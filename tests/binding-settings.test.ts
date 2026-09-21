import { expect, it, vi } from 'vitest';
import { changeCurrentBinding, registerBridgeSettings } from '../src/binding-settings.tsx';
import type { ObsidianBridgeLifecycle, VaultConnectionSnapshot } from '../src/api.ts';

const identity = { instanceId: 'this-instance', profileId: 'web', origin: 'http://127.0.0.1:3000', bootId: 'boot' };
const vault = { vaultId: 'vault-a', state: 'available', binding: { revision: 3, target: null } } as VaultConnectionSnapshot;
it('binds the chosen Vault with a pinned current host and revision, without Maintenance', async () => {
  const changeVaultBinding = vi.fn();
  const lifecycle = { getInstanceIdentity: () => identity, changeVaultBinding } as unknown as ObsidianBridgeLifecycle;
  await changeCurrentBinding(lifecycle, vault, 'operation-a');
  expect(changeVaultBinding).toHaveBeenCalledWith('vault-a', { operationId: 'operation-a', expectedRevision: 3, intent: 'bind', target: { instanceId: 'this-instance', profileId: 'web' }, candidate: { origin: identity.origin, bootId: 'boot' } });
  await expect(changeCurrentBinding(lifecycle, { ...vault, state: 'foreign' }, 'operation-b')).rejects.toThrow('断开原连接');
  expect(changeVaultBinding).toHaveBeenCalledTimes(1);
});
it('disconnects only an owned channel and does not invoke reference deletion', async () => {
  const changeVaultBinding = vi.fn();
  const lifecycle = { getInstanceIdentity: () => identity, changeVaultBinding } as unknown as ObsidianBridgeLifecycle;
  await changeCurrentBinding(lifecycle, { ...vault, state: 'bound', binding: { ...vault.binding, target: { instanceId: identity.instanceId, profileId: identity.profileId } } }, 'disconnect');
  expect(changeVaultBinding).toHaveBeenCalledWith('vault-a', { operationId: 'disconnect', expectedRevision: 3, intent: 'unbind', target: null });
  await expect(changeCurrentBinding(lifecycle, { ...vault, state: 'bound' }, 'stale')).rejects.toThrow('状态已改变');
});
it('registers the official settings slot and releases it on disposal', () => {
  const dispose = vi.fn(); const register = vi.fn((_options: Record<string, unknown>) => dispose);
  const unmount = registerBridgeSettings({ inject: (_name, mount) => mount(), register }, {} as ObsidianBridgeLifecycle);
  expect(register.mock.calls[0]?.[0]).toMatchObject({ name: 'settings.section', id: 'obsidian-bridge' });
  unmount(); expect(dispose).toHaveBeenCalledOnce();
});
