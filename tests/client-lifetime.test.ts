import { Context } from '@deepseek-ai/cordis';
import { beforeEach, expect, it, vi } from 'vitest';
import { apply } from '../src/client.ts';

const f=vi.hoisted(()=>({mount:vi.fn(),refresh:vi.fn(),remoteDispose:vi.fn(),routeDispose:vi.fn(),reconcile:vi.fn()}));
vi.mock('../src/client-config.ts',()=>({mountBridgeConfig:f.mount}));
vi.mock('../src/vault-runtime.ts',()=>({VaultBridgeRuntime:class {
 reconcile=f.reconcile;dispose=f.routeDispose;
}}));
const identity={discoveryProtocolVersion:1 as const,kind:'dsh' as const,instanceId:'fixture',profileId:'web',bootId:crypto.randomUUID(),publisherId:crypto.randomUUID(),displayName:'fixture',origin:'http://127.0.0.1:51882',capabilities:[]};
const config=()=>({origin:'http://127.0.0.1:18473',identity,vaults:[],refresh:f.refresh,dispose:f.remoteDispose});
function deferred<T>(){let resolve!:(value:T)=>void;const promise=new Promise<T>(done=>{resolve=done;});return{promise,resolve};}
beforeEach(()=>{vi.resetAllMocks();f.mount.mockImplementation(async()=>config());f.reconcile.mockResolvedValue(undefined);f.remoteDispose.mockResolvedValue(undefined);f.routeDispose.mockResolvedValue(undefined);});

it('unload waits for route cleanup and drops a late remote refresh before it can remount routes',async()=>{
 const ctx=new Context();const owner=ctx.plugin({apply});await owner.await();
 const fresh=deferred<ReturnType<typeof config>>();const closing=deferred<void>();
 f.refresh.mockReturnValue(fresh.promise);f.remoteDispose.mockImplementation(async()=>{fresh.resolve(config());});f.routeDispose.mockReturnValue(closing.promise);
 const service=ctx.get('obsidianBridgeLifecycle') as {refreshVaults():Promise<void>};
 const refresh=service.refreshVaults();let disposed=false;const disposal=owner.dispose().then(()=>{disposed=true;});
 await vi.waitFor(()=>expect(f.routeDispose).toHaveBeenCalledOnce());expect(disposed).toBe(false);
 expect(f.reconcile).toHaveBeenCalledOnce();await refresh;closing.resolve();await disposal;
 expect(f.remoteDispose).toHaveBeenCalledOnce();expect(f.reconcile).toHaveBeenCalledOnce();
 await expect(service.refreshVaults()).rejects.toThrow('stopped');await ctx.fiber.dispose();
});

it('startup completed after disposal only releases its remote descriptor and never mounts routes',async()=>{
 const ctx=new Context();const mounted=deferred<ReturnType<typeof config>>();f.mount.mockReturnValue(mounted.promise);
 const owner=ctx.plugin({apply});const activation=owner.await().catch(()=>undefined);
 await vi.waitFor(()=>expect(f.mount).toHaveBeenCalledOnce());
 const disposal=owner.dispose();mounted.resolve(config());await Promise.all([activation,disposal]);
 expect(f.remoteDispose).toHaveBeenCalledOnce();expect(f.reconcile).not.toHaveBeenCalled();expect(f.routeDispose).not.toHaveBeenCalled();await ctx.fiber.dispose();
});
