import { useEffect, useState } from 'react';
import { bridgeSettingsStyles } from './binding-settings-style.ts';
import type { ObsidianBridgeLifecycle, VaultConnectionSnapshot } from './api.ts';

export interface BridgeSettingsSlots {
  inject(name: string, register: () => (() => void)): () => void;
  register(options: Record<string, unknown>, component: typeof BridgeSettings): () => void;
}

/** Only the current host's unbound/owned channels are editable here. */
export async function changeCurrentBinding(lifecycle: ObsidianBridgeLifecycle, vault: VaultConnectionSnapshot, operationId: string): Promise<void> {
  const identity = lifecycle.getInstanceIdentity?.();
  if (!identity || !lifecycle.changeVaultBinding) throw new Error('当前实例连接服务尚未就绪');
  if (vault.state !== 'bound' && vault.state !== 'available') throw new Error('请在 Vault 中断开原连接，再刷新此面板');
  const owned = vault.binding.target?.instanceId === identity.instanceId && vault.binding.target.profileId === identity.profileId;
  if (vault.state === 'bound' ? !owned : vault.binding.target !== null) throw new Error('Vault 连接状态已改变，请刷新');
  await lifecycle.changeVaultBinding(vault.vaultId, {
    operationId, expectedRevision: vault.binding.revision,
    intent: owned ? 'unbind' : 'bind',
    target: owned ? null : { instanceId: identity.instanceId, profileId: identity.profileId },
    ...(!owned ? { candidate: { origin: identity.origin, bootId: identity.bootId } } : {}),
  });
}

const connectionLabels: Record<string, string> = {
  READY: '已连接', STARTING: '正在连接', DEGRADED: '连接受限', OFFLINE: '等待连接',
  DRAINING: '正在断开', STOPPED: '已停止', FAILED: '连接失败',
};

export function BridgeSettings({ lifecycle }: { lifecycle: ObsidianBridgeLifecycle }) {
  const [vaults, setVaults] = useState(() => lifecycle.listVaults?.() ?? []);
  const [busy, setBusy] = useState<string>();
  const [feedback, setFeedback] = useState('');
  useEffect(() => lifecycle.subscribe(() => setVaults(lifecycle.listVaults?.() ?? [])), [lifecycle]);
  const run = async (key: string, action: () => Promise<void>) => {
    if (busy) return;
    setBusy(key); setFeedback('');
    try { await action(); setVaults(lifecycle.listVaults?.() ?? []); }
    catch (error) { setFeedback(error instanceof Error ? error.message : '连接操作失败，请刷新后检查状态'); }
    finally { setBusy(undefined); }
  };
  const labels = { bound: '已绑定此实例', available: '可连接', foreign: '已连接其他实例', offline: '离线', conflict: '身份冲突' };
  const cliAvailable = lifecycle.getCliAvailability?.().available ?? false;
  return <section className="dsh-bridge-settings" aria-label="Obsidian 连接设置" aria-busy={Boolean(busy)}>
    <style>{bridgeSettingsStyles}</style>
    <header className="dsh-bridge-settings__heading">
      <h3>Obsidian 连接</h3>
      <p>连接你的笔记仓库，在 DSH 与 Obsidian 之间打开笔记和会话。</p>
    </header>
    <div className="dsh-bridge-settings__toolbar">
      <h4>笔记仓库 <span className="dsh-bridge-settings__count">{vaults.length}</span></h4>
      <button type="button" className="dsh-bridge-settings__button" disabled={Boolean(busy)} onClick={() => { void run('refresh', async () => { await lifecycle.refreshVaults?.(); }); }}>{busy === 'refresh' ? '正在刷新…' : '刷新列表'}</button>
    </div>
    {vaults.length === 0 ? <div className="dsh-bridge-settings__empty"><strong>尚未发现笔记仓库</strong><p>请在 Obsidian 中打开 Vault 并启用 Companion，然后刷新列表。无需启动 Maintenance。</p></div> : <ul className="dsh-bridge-settings__list">{vaults.map(vault => {
      const label = vault.state === 'bound' ? connectionLabels[vault.connectionState ?? ''] ?? labels.bound : labels[vault.state];
      return <li key={vault.vaultId} className="dsh-bridge-settings__vault">
        <div className="dsh-bridge-settings__row">
          <div className="dsh-bridge-settings__identity"><strong>{vault.displayName}</strong><span className="dsh-bridge-settings__badge" data-connected={vault.state === 'bound' && vault.connectionState === 'READY'}>{label}</span></div>
          {vault.state === 'available' || vault.state === 'bound' ? <button type="button" className="dsh-bridge-settings__button" disabled={Boolean(busy)} onClick={() => { void run(vault.vaultId, () => changeCurrentBinding(lifecycle, vault, crypto.randomUUID())); }}>{busy === vault.vaultId ? '正在处理…' : vault.state === 'bound' ? '断开连接' : '连接此仓库'}</button> : null}
        </div>
        {vault.state === 'foreign' ? <p className="dsh-bridge-settings__hint">如需连接此实例，请先在该仓库的 Companion 设置中断开原连接。</p> : null}
        {vault.state === 'offline' ? <p className="dsh-bridge-settings__hint">打开此仓库并启用 Companion 后，可重新检查连接。</p> : null}
        {vault.state === 'conflict' ? <p className="dsh-bridge-settings__hint">请核对仓库身份后再连接。</p> : null}
        <details className="dsh-bridge-settings__details"><summary>连接详情</summary><dl><dt>仓库标识</dt><dd>{vault.vaultId}</dd>{vault.origin ? <><dt>连接地址</dt><dd>{vault.origin}</dd></> : null}</dl></details>
      </li>;
    })}</ul>}
    <p className="dsh-bridge-settings__note">一个 DSH 实例可连接多个仓库，每个仓库同时连接一个实例。断开连接会保留笔记、引用和双链。</p>
    <div className="dsh-bridge-settings__cli"><div><strong>Obsidian CLI</strong><p>可选增强，不影响基础桥接。</p></div><span className="dsh-bridge-settings__badge" data-connected={cliAvailable}>{cliAvailable ? '可用' : '未配置'}</span></div>
    {feedback ? <output className="dsh-bridge-settings__feedback" role="alert">{feedback}</output> : null}
  </section>;
}

export function registerBridgeSettings(slots: BridgeSettingsSlots, lifecycle: ObsidianBridgeLifecycle): () => void {
  return slots.inject('settings.section', () => slots.register({
    name: 'settings.section', id: 'obsidian-bridge', label: 'Obsidian 连接', order: 85,
    inject: () => ({ lifecycle }),
  }, BridgeSettings));
}
