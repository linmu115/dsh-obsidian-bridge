import { execFile } from 'node:child_process';
import { open, realpath, stat } from 'node:fs/promises';
import { isAbsolute, join } from 'node:path';
import { z } from 'zod';
import type { ChangeVaultBindingRequest, DshInstanceIdentity, VaultBindingSnapshot, VaultIdentity } from 'dsh-obsidian-bridge-protocol/binding';
import type { ObsidianBridgeLifecycle } from './api.ts';

// Fixed script only: selected paths never become executable PowerShell text.
export const FOLDER_PICKER_SCRIPT = `
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
Add-Type -AssemblyName System.Windows.Forms
$dialog = [System.Windows.Forms.FolderBrowserDialog]::new()
$dialog.Description = '选择已安装 Obsidian Bridge 的 Vault 文件夹'
$dialog.ShowNewFolderButton = $false
try {
  if ($dialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
    @{ path = $dialog.SelectedPath } | ConvertTo-Json -Compress
  } else { @{ path = $null } | ConvertTo-Json -Compress }
} finally { $dialog.Dispose() }
`;
export type VaultFolderPicker = (signal: AbortSignal) => Promise<string | null>;
export function createWindowsVaultFolderPicker(options: { platform?: string; timeoutMs?: number; execute?: typeof execFile } = {}): VaultFolderPicker {
  return async signal => {
    signal.throwIfAborted();
    if ((options.platform ?? process.platform) !== 'win32') throw new Error('选择文件夹功能需要 Windows 本机桌面');
    const deadline = AbortSignal.any([signal, AbortSignal.timeout(options.timeoutMs ?? 60_000)]);
    const output = await new Promise<string>((resolve, reject) => {
      (options.execute ?? execFile)('powershell.exe', ['-NoLogo', '-NoProfile', '-STA', '-NonInteractive', '-EncodedCommand', Buffer.from(FOLDER_PICKER_SCRIPT, 'utf16le').toString('base64')],
        { windowsHide: true, encoding: 'utf8', maxBuffer: 32_768, signal: deadline }, (error, stdout) => {
          if (error) reject(new Error(deadline.aborted ? '选择文件夹已取消或超时，请重新操作' : '无法打开 Windows 文件夹选择框'));
          else resolve(String(stdout));
        });
    });
    deadline.throwIfAborted();
    return z.object({ path: z.string().min(1).max(32_768).nullable() }).strict().parse(JSON.parse(output.trim())).path;
  };
}

async function readSmallJson(path: string): Promise<unknown> {
  const file = await open(path, 'r');
  try {
    // Bounded read, including files concurrently replaced or extended by another process.
    const buffer = Buffer.alloc(1_048_577);
    const { bytesRead } = await file.read(buffer, 0, buffer.length, 0);
    if (bytesRead > 1_048_576) throw new Error('Vault 插件配置过大，无法验证');
    return JSON.parse(buffer.subarray(0, bytesRead).toString('utf8'));
  } finally { await file.close(); }
}
export async function inspectVaultFolder(selected: string): Promise<{ root: string; vaultId: string }> {
  if (!isAbsolute(selected)) throw new Error('请选择 Vault 的完整文件夹路径');
  const root = await realpath(selected).catch(() => { throw new Error('所选文件夹不存在或无法访问'); });
  if (!(await stat(join(root, '.obsidian')).catch(() => undefined))?.isDirectory()) throw new Error('所选文件夹不是 Obsidian Vault：缺少 .obsidian 文件夹');
  const plugin = join(root, '.obsidian', 'plugins', 'obsidian-deepharness-bridge');
  try {
    const manifest = z.object({ id: z.literal('obsidian-deepharness-bridge') }).parse(await readSmallJson(join(plugin, 'manifest.json')));
    if (!manifest || !(await stat(join(plugin, 'main.js'))).isFile()) throw new Error('missing entry');
  } catch { throw new Error('此 Vault 未完整安装 Obsidian Bridge 插件，请先安装并启用插件'); }
  try {
    const data = z.object({ vaultId: z.string().min(1).max(256) }).parse(await readSmallJson(join(plugin, 'data.json')));
    return { root, vaultId: data.vaultId };
  } catch { throw new Error('此 Vault 尚无有效 Bridge 身份，请在 Obsidian 打开此 Vault 并启用 Bridge 后重试'); }
}

export const vaultLocationSchema = z.object({ locationProtocolVersion: z.literal(1), vaultId: z.string().min(1).max(256), publisherId: z.string().uuid(), bootId: z.string().uuid(), origin: z.string(), vaultRoot: z.string().min(1).max(32_768) }).strict();
export interface FolderBindingOptions {
  lifecycle: ObsidianBridgeLifecycle;
  identity: DshInstanceIdentity;
  probe(origin: string): Promise<VaultIdentity>;
  bind(vaultId: string, request: ChangeVaultBindingRequest, expected: VaultIdentity, signal: AbortSignal): Promise<VaultBindingSnapshot>;
  picker?: VaultFolderPicker;
  fetch?: typeof fetch;
}
/** Local folder inspection is read-only; all writes remain with the Vault binding authority. */
export function createVaultFolderBinding(options: FolderBindingOptions) {
  let busy = false;
  return async (operationId: string, signal: AbortSignal): Promise<{ message: string }> => {
    signal.throwIfAborted();
    if (busy) throw new Error('已有文件夹选择正在进行，请先完成或取消');
    busy = true;
    try {
      const selected = await (options.picker ?? createWindowsVaultFolderPicker())(signal);
      signal.throwIfAborted();
      if (selected === null) return { message: '已取消选择，绑定未改变' };
      const folder = await inspectVaultFolder(selected);
      await options.lifecycle.refreshVaults?.();
      signal.throwIfAborted();
      const candidate = options.lifecycle.listVaults?.().find(vault => vault.vaultId === folder.vaultId);
      if (!candidate || candidate.state === 'offline') throw new Error('此 Vault 未在线，请在 Obsidian 打开所选 Vault 并启用 Bridge 后重试');
      if (candidate.state === 'conflict') throw new Error('Vault 身份冲突，请先解决重复 Vault 身份后重试');
      const fresh = await options.probe(candidate.origin).catch(() => { throw new Error('此 Vault 当前无法连接，请在 Obsidian 打开所选 Vault 并启用 Bridge 后重试'); });
      if (fresh.vaultId !== folder.vaultId) throw new Error('Vault 在线身份已改变，请刷新后重试');
      const response = await (options.fetch ?? fetch)(`${fresh.origin}/discovery/v1/vault-location`, { redirect: 'error', signal: AbortSignal.any([signal, AbortSignal.timeout(3000)]) })
        .catch(() => { signal.throwIfAborted(); throw new Error('无法读取在线 Vault 路径证明，请在 Obsidian 打开所选 Vault 并启用 Bridge 后重试'); });
      if (!response.ok) throw new Error('无法验证所选文件夹与在线 Vault 的对应关系，请更新 Obsidian Bridge 后重试');
      if (Number(response.headers.get('content-length')) > 65_536) throw new Error('Vault 路径证明无效');
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Vault 路径证明为空');
      const chunks: Uint8Array[] = []; let size = 0;
      try { for (;;) { const part = await reader.read(); if (part.done) break; size += part.value.length; if (size > 65_536) throw new Error('Vault 路径证明过大'); chunks.push(part.value); } }
      finally { await reader.cancel().catch(() => undefined); }
      const proof = vaultLocationSchema.parse(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      if (proof.vaultId !== fresh.vaultId || proof.publisherId !== fresh.publisherId || proof.bootId !== fresh.bootId || proof.origin !== fresh.origin) throw new Error('Vault 路径证明身份已改变，请刷新后重试');
      if (!isAbsolute(proof.vaultRoot) || await realpath(proof.vaultRoot) !== folder.root) throw new Error('所选文件夹与在线 Vault 不一致；可能是复制的 Vault，请打开所选 Vault 后重试');
      // Re-read the selected root before binding: never trust only a copied vaultId.
      const checked = await inspectVaultFolder(selected);
      if (checked.root !== folder.root || checked.vaultId !== folder.vaultId) throw new Error('所选 Vault 已改变，请重新选择');
      signal.throwIfAborted();
      const target = { instanceId: options.identity.instanceId, profileId: options.identity.profileId };
      if (fresh.binding.target?.instanceId === target.instanceId && fresh.binding.target.profileId === target.profileId) return { message: '此 Vault 已绑定当前实例，无需重复绑定' };
      if (fresh.binding.target) throw new Error('此 Vault 已绑定其他实例；请在明确的改绑入口核对后操作');
      const result = await options.bind(folder.vaultId, { operationId, expectedRevision: fresh.binding.revision, intent: 'bind', target, candidate: { origin: options.identity.origin, bootId: options.identity.bootId } }, fresh, signal);
      if (result.vaultId !== folder.vaultId || result.target?.instanceId !== target.instanceId || result.target.profileId !== target.profileId) throw new Error('Vault 绑定回执与目标不一致，请刷新核对');
      return { message: '已将所选 Vault 绑定到当前实例' };
    } finally { busy = false; }
  };
}
