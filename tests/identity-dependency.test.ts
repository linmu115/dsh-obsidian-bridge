import { Context } from '@deepseek-ai/cordis';
import { expect, it, vi } from 'vitest';
import { BridgeLifecycleService } from '../src/index.ts';
import { VaultBridgeRuntime } from '../src/vault-runtime.ts';

const discovery=vi.hoisted(()=>({refresh:vi.fn(async()=>{}),dispose:vi.fn(async()=>{})}));
vi.mock('../src/discovery-host.ts',()=>({startHostDiscovery:()=>discovery}));

it('a mismatched optional provider fences the existing Bridge and unload releases only that fence',async()=>{
 const ctx=new Context();
 const identity={discoveryProtocolVersion:1 as const,kind:'dsh' as const,instanceId:'bridge',profileId:'web',bootId:crypto.randomUUID(),publisherId:crypto.randomUUID(),displayName:'test',origin:'http://127.0.0.1:51882',capabilities:[] as string[]};
 let bridge!:BridgeLifecycleService;
 const deps=ctx.plugin({apply(scope){scope.provide('webServer',{host:'127.0.0.1',port:51882,register:()=>()=>{}});scope.provide('connection',{authenticatedUrl:(origin:string)=>origin});}});
 await deps.await();
 const owner=ctx.plugin({inject:['webServer','connection'],apply(scope){bridge=new BridgeLifecycleService(scope,{bridgeOrigin:'http://127.0.0.1:18473'},identity);}});
 const block=vi.spyOn(VaultBridgeRuntime.prototype,'blockIdentity');
 try{
  await owner.await();
  const bad=ctx.plugin({apply(scope){scope.provide('maintenanceInstanceIdentity',{instanceId:'wrong',profileId:'web'});}});
  await bad.await();await vi.waitFor(()=>expect(block).toHaveBeenCalledOnce());
  expect(()=>bridge.forVault('missing')).toThrow('identities conflict');
  expect(ctx.get('obsidianBridgeLifecycle')).toBeDefined();
  await bad.dispose();await vi.waitFor(()=>expect(()=>bridge.forVault('missing')).toThrow('未连接'));
  const good=ctx.plugin({apply(scope){scope.provide('maintenanceInstanceIdentity',{instanceId:'bridge',profileId:'web'});scope.provide('maintenanceKnowledge',{});}});
  await good.await();await vi.waitFor(()=>expect(identity.capabilities).toContain('maintenance-knowledge-v1'));
  expect(block).toHaveBeenCalledOnce();
  await good.dispose();await vi.waitFor(()=>expect(identity.capabilities).not.toContain('maintenance-knowledge-v1'));
  expect(bridge.getInstanceIdentity().instanceId).toBe('bridge');
  expect(discovery.refresh).toHaveBeenCalled();
 }finally{await ctx.fiber.dispose();block.mockRestore();}
});
