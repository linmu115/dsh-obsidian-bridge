import { Context } from '@deepseek-ai/cordis';
import { expect, it, vi } from 'vitest';
import * as bridge from '../src/index.ts';
import { LIFECYCLE_REMOTE_DESCRIPTORS } from '../src/typert.ts';

vi.mock('../src/discovery-host.ts', () => ({
  startHostDiscovery: () => ({ refresh: vi.fn(), dispose: vi.fn() }),
}));
vi.mock('../src/vault-runtime.ts', () => ({ VaultBridgeRuntime: class {
  bridgeOrigin = 'http://127.0.0.1:18473';
  identities = () => [];
  dispose = vi.fn();
} }));

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>(done => { resolve = done; });
  return { promise, resolve };
}

it('keeps host activation pending until identity storage is ready, then activates a required consumer', async () => {
  const ctx = new Context();
  const opened = deferred();
  const release = deferred();
  const close = vi.fn(async () => {});
  const consumerStarted = vi.fn();
  const dependencies = ctx.plugin({ apply(scope) {
    scope.provide('webServer', { host: '127.0.0.1', port: 51882, register: () => vi.fn() });
    scope.provide('connection', { authenticatedUrl: (origin: string) => origin });
    scope.provide('storageDomain', { async open() {
      opened.resolve();
      await release.promise;
      return { global: { get: () => ({ instanceId: 'fixture' }) }, close };
    } });
  } });
  await dependencies.await();
  const consumer = ctx.plugin({ inject: ['obsidianBridgeLifecycle'], apply: consumerStarted });
  const owner = ctx.plugin(bridge, { bridgeOrigin: 'http://127.0.0.1:18473' });
  let settled = false;
  const activation = owner.await().then(() => { settled = true; });
  try {
    await opened.promise;
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(settled).toBe(false);
    expect(consumerStarted).not.toHaveBeenCalled();
    release.resolve();
    await activation;
    await consumer.await();
    expect(consumerStarted).toHaveBeenCalledOnce();
    expect(ctx.get('obsidianBridgeLifecycle')).toBeDefined();
    const host = ctx.get('obsidianBridgeLifecycle') as bridge.BridgeLifecycleService;
    expect(host.getBridgeConfig().referenceLocationResolverAvailable).toBe(false);
    const codec = LIFECYCLE_REMOTE_DESCRIPTORS[0]!.result;
    if (codec.mode !== 'strict') throw new Error('Expected a checked configuration contract');
    expect(codec.schema.parse(host.getBridgeConfig())).toMatchObject({ referenceLocationResolverAvailable: false });
    const resolver = ctx.plugin({ apply(scope) { scope.provide('maintenanceReferenceResolver', {}); } });
    await resolver.await();
    expect(host.getBridgeConfig().referenceLocationResolverAvailable).toBe(true);
    await resolver.dispose();
    expect(host.getBridgeConfig().referenceLocationResolverAvailable).toBe(false);
  } finally {
    release.resolve();
    await activation;
    await ctx.fiber.dispose();
  }
  expect(close).toHaveBeenCalledOnce();
});

it('reports identity storage initialization failure through the host plugin activation', async () => {
  const ctx = new Context();
  const dependencies = ctx.plugin({ apply(scope) {
    scope.provide('webServer', { host: '127.0.0.1', port: 51882, register: () => vi.fn() });
    scope.provide('connection', { authenticatedUrl: (origin: string) => origin });
    scope.provide('storageDomain', { open: async () => { throw new Error('identity storage unavailable'); } });
  } });
  await dependencies.await();
  const owner = ctx.plugin(bridge, { bridgeOrigin: 'http://127.0.0.1:18473' });
  try {
    await expect(owner.await()).rejects.toThrow('identity storage unavailable');
    expect(ctx.get('obsidianBridgeLifecycle')).toBeUndefined();
  } finally {
    await ctx.fiber.dispose();
  }
});
