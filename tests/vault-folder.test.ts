import { afterEach, expect, it, vi } from 'vitest';
import { mkdtemp, mkdir, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { execFile } from 'node:child_process';
import type { DshInstanceIdentity, VaultIdentity } from 'dsh-obsidian-bridge-protocol/binding';
import { createVaultFolderBinding, createWindowsVaultFolderPicker, FOLDER_PICKER_SCRIPT, inspectVaultFolder } from '../src/vault-folder.ts';
import type { VaultConnectionSnapshot } from '../src/api.ts';

const roots: string[] = [];
afterEach(async () => { await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true }))); });
const identity = { instanceId: 'fixture-instance', profileId: 'web', origin: 'http://127.0.0.1:3000', bootId: crypto.randomUUID() } as DshInstanceIdentity;
async function fixture() {
  const root = await realpath(await mkdtemp(join(tmpdir(), 'bridge-vault-folder-'))); roots.push(root);
  const plugin = join(root, '.obsidian', 'plugins', 'obsidian-deepharness-bridge');
  await mkdir(plugin, { recursive: true });
  await writeFile(join(plugin, 'manifest.json'), JSON.stringify({ id: 'obsidian-deepharness-bridge', version: 'fixture' }));
  await writeFile(join(plugin, 'main.js'), '// Synthetic test fixture only');
  await writeFile(join(plugin, 'data.json'), JSON.stringify({ vaultId: 'fixture-vault', unrelated: { retained: true } }));
  let online: VaultIdentity = { discoveryProtocolVersion: 1, kind: 'vault', vaultId: 'fixture-vault', publisherId: crypto.randomUUID(), bootId: crypto.randomUUID(), origin: 'http://127.0.0.1:4000', displayName: 'Fixture', capabilities: ['vault-instance-binding-v1'], binding: { bindingProtocolVersion: 1, vaultId: 'fixture-vault', revision: 2, target: null, updatedAt: 1 } };
  let state: VaultConnectionSnapshot['state'] = 'available';
  const picker = vi.fn(async () => root as string | null);
  const refreshVaults = vi.fn(async () => undefined);
  const bind = vi.fn(async (_id, request) => ({ ...online.binding, revision: 3, target: request.target }));
  const proof = () => ({ locationProtocolVersion: 1, vaultId: online.vaultId, publisherId: online.publisherId, bootId: online.bootId, origin: online.origin, vaultRoot: root });
  const fetchProof = vi.fn(async () => Response.json(proof()));
  const options = { lifecycle: { refreshVaults, listVaults: () => [{ vaultId: online.vaultId, displayName: online.displayName, origin: online.origin, binding: online.binding, state }] } as never,
    identity, probe: vi.fn(async () => online), bind, picker, fetch: fetchProof as typeof fetch };
  return { root, plugin, options, bind, picker, refreshVaults, fetchProof, proof, run: createVaultFolderBinding(options), setState(value: typeof state) { state = value; }, setOnline(value: Partial<VaultIdentity>) { online = { ...online, ...value }; }, get online() { return online; } };
}
const signal = () => new AbortController().signal;

it('validates only selected root, proves live location and uses existing bind CAS without changing plugin data', async () => {
  const f = await fixture(); const before = await readFile(join(f.plugin, 'data.json'));
  expect(await f.run('operation-1', signal())).toEqual({ message: '已将所选 Vault 绑定到当前实例' });
  expect(f.refreshVaults).toHaveBeenCalledOnce();
  expect(f.fetchProof).toHaveBeenCalledWith('http://127.0.0.1:4000/discovery/v1/vault-location', expect.objectContaining({ redirect: 'error' }));
  expect(f.bind).toHaveBeenCalledWith('fixture-vault', { operationId: 'operation-1', expectedRevision: 2, intent: 'bind', target: { instanceId: identity.instanceId, profileId: identity.profileId }, candidate: { origin: identity.origin, bootId: identity.bootId } }, f.online, expect.any(AbortSignal));
  expect(await readFile(join(f.plugin, 'data.json'))).toEqual(before);
});
it('cancellation never discovers, proves, or binds', async () => {
  const f = await fixture(); f.picker.mockResolvedValue(null);
  expect((await f.run('cancel', signal())).message).toContain('取消');
  expect(f.refreshVaults).not.toHaveBeenCalled(); expect(f.bind).not.toHaveBeenCalled();
});
it('abort after selection never binds', async () => {
  const f = await fixture(); const abort = new AbortController(); f.picker.mockImplementation(async () => { abort.abort(); return f.root; });
  await expect(f.run('abort', abort.signal)).rejects.toThrow(); expect(f.bind).not.toHaveBeenCalled();
});
it('rejects a containing directory instead of scanning children for a Vault', async () => {
  const f = await fixture(); await rm(join(f.root, '.obsidian'), { recursive: true });
  await mkdir(join(f.root, 'child', '.obsidian'), { recursive: true });
  await expect(f.run('missing-vault', signal())).rejects.toThrow('不是 Obsidian Vault'); expect(f.bind).not.toHaveBeenCalled();
});
it.each(['manifest.json', 'main.js'])('rejects incomplete plugin: %s', async file => {
  const f = await fixture(); await rm(join(f.plugin, file));
  await expect(f.run('missing-plugin', signal())).rejects.toThrow('未完整安装'); expect(f.bind).not.toHaveBeenCalled();
});
it('rejects another plugin manifest and missing Vault identity', async () => {
  const f = await fixture(); await writeFile(join(f.plugin, 'manifest.json'), '{"id":"other-plugin"}');
  await expect(inspectVaultFolder(f.root)).rejects.toThrow('未完整安装');
  await writeFile(join(f.plugin, 'manifest.json'), '{"id":"obsidian-deepharness-bridge"}');
  await writeFile(join(f.plugin, 'data.json'), '{}');
  await expect(f.run('invalid-data', signal())).rejects.toThrow('尚无有效 Bridge 身份'); expect(f.bind).not.toHaveBeenCalled();
});
it.each(['offline', 'conflict'] as const)('rejects %s discovery', async state => {
  const f = await fixture(); f.setState(state);
  await expect(f.run('discovery-invalid', signal())).rejects.toThrow(state === 'offline' ? '打开所选 Vault' : '身份冲突');
  expect(f.fetchProof).not.toHaveBeenCalled(); expect(f.bind).not.toHaveBeenCalled();
});
it('refuses copied Vault with identical vaultId but different live path', async () => {
  const f = await fixture(); const other = await fixture();
  f.fetchProof.mockImplementation(async () => Response.json({ ...f.proof(), vaultRoot: other.root }));
  await expect(f.run('copy', signal())).rejects.toThrow('复制的 Vault'); expect(f.bind).not.toHaveBeenCalled();
});
it.each(['bootId', 'publisherId'] as const)('rejects changed live proof %s', async field => {
  const f = await fixture(); f.fetchProof.mockImplementation(async () => Response.json({ ...f.proof(), [field]: crypto.randomUUID() }));
  await expect(f.run('changed-proof', signal())).rejects.toThrow('路径证明身份'); expect(f.bind).not.toHaveBeenCalled();
});
it('rejects older Companion without path proof and oversized proof', async () => {
  const f = await fixture(); f.fetchProof.mockImplementation(async () => new Response('', { status: 404 }));
  await expect(f.run('old', signal())).rejects.toThrow('更新 Obsidian Bridge');
  f.fetchProof.mockImplementation(async () => new Response(' '.repeat(65_537)));
  await expect(f.run('large', signal())).rejects.toThrow('路径证明过大'); expect(f.bind).not.toHaveBeenCalled();
});
it('same target is idempotent, foreign target never silently rebinds', async () => {
  const f = await fixture(); f.setOnline({ binding: { ...f.online.binding, target: { instanceId: identity.instanceId, profileId: identity.profileId } } });
  expect((await f.run('same', signal())).message).toContain('无需重复绑定'); expect(f.bind).not.toHaveBeenCalled();
  f.setOnline({ binding: { ...f.online.binding, target: { instanceId: 'foreign', profileId: 'web' } } });
  await expect(f.run('foreign', signal())).rejects.toThrow('已绑定其他实例'); expect(f.bind).not.toHaveBeenCalled();
});
it('aborts during proof before mutation and releases the picker lock', async () => {
  const f = await fixture(); const abort = new AbortController(); f.fetchProof.mockImplementation(async () => { abort.abort(); return Response.json(f.proof()); });
  await expect(f.run('cancel-proof', abort.signal)).rejects.toThrow(); expect(f.bind).not.toHaveBeenCalled();
  f.fetchProof.mockImplementation(async () => Response.json(f.proof())); await f.run('next', signal()); expect(f.bind).toHaveBeenCalledOnce();
});
it('does not open concurrent native pickers', async () => {
  const f = await fixture(); let finish!: (path: null) => void;
  f.picker.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
  const pending = f.run('first', signal()); await expect(f.run('second', signal())).rejects.toThrow('已有文件夹选择');
  finish(null); await pending; expect(f.picker).toHaveBeenCalledOnce();
});
it('native picker uses a fixed encoded script, hidden console, and preserves literal selected paths', async () => {
  const selected = 'C:\\Vault 中文\\$(literal);`text';
  const execute = vi.fn((_file, _args, _options, callback) => { callback(null, JSON.stringify({ path: selected })); }) as unknown as typeof execFile;
  expect(await createWindowsVaultFolderPicker({ platform: 'win32', execute })(signal())).toBe(selected);
  expect(execute).toHaveBeenCalledWith('powershell.exe', ['-NoLogo', '-NoProfile', '-STA', '-NonInteractive', '-EncodedCommand', Buffer.from(FOLDER_PICKER_SCRIPT, 'utf16le').toString('base64')], expect.objectContaining({ windowsHide: true, maxBuffer: 32_768, signal: expect.any(AbortSignal) }), expect.any(Function));
  expect(FOLDER_PICKER_SCRIPT).not.toContain(selected);
});
it('native picker accepts cancel and rejects unsupported hosts and timeout without returning a path', async () => {
  const cancel = vi.fn((_file, _args, _options, callback) => callback(null, '{"path":null}')) as unknown as typeof execFile;
  expect(await createWindowsVaultFolderPicker({ platform: 'win32', execute: cancel })(signal())).toBeNull();
  await expect(createWindowsVaultFolderPicker({ platform: 'linux', execute: cancel })(signal())).rejects.toThrow('Windows');
  const timeout = vi.fn((_file, _args, options, callback) => options.signal.addEventListener('abort', () => callback(new Error('aborted'), ''))) as unknown as typeof execFile;
  await expect(createWindowsVaultFolderPicker({ platform: 'win32', timeoutMs: 5, execute: timeout })(signal())).rejects.toThrow('取消或超时');
});
