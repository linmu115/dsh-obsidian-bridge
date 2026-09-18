import { Context } from "@deepseek-ai/cordis";
import { beforeEach, expect, it, vi } from "vitest";
import { apply as applyClient } from "../src/client.ts";
import { BridgeLifecycleService } from "../src/index.ts";
const runtime = vi.hoisted(() => ({ start: vi.fn(), dispose: vi.fn(), register: vi.fn(), remove: vi.fn() }));
vi.mock("../src/client-config.ts",()=>({mountBridgeConfig:async()=>({origin:"http://127.0.0.1:18473",runtimeIdentity:{profileId:"web"},dispose:vi.fn()})}));
beforeEach(()=>vi.clearAllMocks());
vi.mock("../src/runtime.ts", () => ({ BridgeLifecycleRuntime: class {
 bridgeOrigin="http://127.0.0.1:18473"; capabilities=["reference-channel-v1","action-dispatch-v1"]; transport={};
 start=runtime.start;dispose=runtime.dispose;registerActionHandler=runtime.register;
 getHealth(){return {state:"OFFLINE",components:{},bridgeOrigin:this.bridgeOrigin};}
} }));
it("keeps the Bridge host alive without Core or SM, and reattaches one source and handler per Core fiber",async()=>{
 runtime.register.mockImplementation(()=>runtime.remove);
 const ctx=new Context();
 const dependencies=ctx.plugin({apply(context){context.provide("webServer",{host:"127.0.0.1",port:51882});context.provide("connection",{authenticatedUrl:(origin:string)=>origin});}});
 await dependencies.await();
 let bridge:BridgeLifecycleService|undefined;
 const owner=ctx.plugin({inject:["webServer","connection"],apply(context){bridge=new BridgeLifecycleService(context,{bridgeOrigin:"http://127.0.0.1:18473",profileId:"web"});}});
 const unregister=vi.fn();const registerSourceAdapter=vi.fn(()=>unregister);
 const installCore=()=>ctx.plugin({apply(context){context.provide("annotationCoreHost",{registerSourceAdapter,deleteReferenceLink:async()=>({deleted:true,scope:"sent"})});}});
 try {
  await owner.await();expect(runtime.start).toHaveBeenCalledOnce();expect(bridge?.getHealth().state).toBe("OFFLINE");expect(registerSourceAdapter).not.toHaveBeenCalled();
  const first=installCore();await first.await();await vi.waitFor(()=>expect(registerSourceAdapter).toHaveBeenCalledTimes(1));expect(runtime.register).toHaveBeenCalledTimes(1);
  await first.dispose();await vi.waitFor(()=>expect(unregister).toHaveBeenCalledTimes(1));expect(runtime.remove).toHaveBeenCalledTimes(1);expect(runtime.dispose).not.toHaveBeenCalled();
  const second=installCore();await second.await();await vi.waitFor(()=>expect(registerSourceAdapter).toHaveBeenCalledTimes(2));expect(runtime.register).toHaveBeenCalledTimes(2);await second.dispose();
 } finally {await owner.dispose();await dependencies.dispose();}
 expect(runtime.dispose).toHaveBeenCalledOnce();expect(unregister).toHaveBeenCalledTimes(2);expect(runtime.remove).toHaveBeenCalledTimes(2);
});

it("keeps the surface alive without Core/SM and reattaches reference sources after Core reload",async()=>{
 runtime.register.mockImplementation(()=>runtime.remove);const ctx=new Context();
 const dependencies=ctx.plugin({apply(context){context.provide("sessions",{list:{getSnapshot:()=>({})},open:vi.fn()});}});await dependencies.await();
 const owner=ctx.plugin({apply:applyClient});const unregister=vi.fn();const registerSourceAdapter=vi.fn(()=>unregister);
 const installCore=()=>ctx.plugin({apply(context){context.provide("annotationCore",{registerSourceAdapter});}});
 try {
  await owner.await();expect(runtime.start).toHaveBeenCalledOnce();expect(registerSourceAdapter).not.toHaveBeenCalled();
  const first=installCore();await first.await();await vi.waitFor(()=>expect(registerSourceAdapter).toHaveBeenCalledTimes(1));expect(runtime.register).toHaveBeenCalledTimes(1);await first.dispose();await vi.waitFor(()=>expect(unregister).toHaveBeenCalledTimes(1));expect(runtime.dispose).not.toHaveBeenCalled();
  const second=installCore();await second.await();await vi.waitFor(()=>expect(registerSourceAdapter).toHaveBeenCalledTimes(2));expect(runtime.register).toHaveBeenCalledTimes(2);await second.dispose();
 }finally{await owner.dispose();await dependencies.dispose();}
 expect(runtime.dispose).toHaveBeenCalledOnce();expect(runtime.remove).toHaveBeenCalledTimes(2);
});
