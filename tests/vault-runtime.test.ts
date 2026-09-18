import {expect,it,vi} from "vitest";
import {VaultBridgeRuntime} from "../src/vault-runtime.ts";
import {createObsidianSourceAdapter} from "../src/reference/host/obsidian-source-adapter.ts";
import type {DshInstanceIdentity,VaultIdentity} from "dsh-obsidian-bridge-protocol/binding";
import type {LifecycleRuntimeOptions} from "../src/runtime.ts";
const identity:DshInstanceIdentity={discoveryProtocolVersion:1,kind:"dsh",instanceId:"instance",profileId:"web",bootId:"1f6fba93-9a32-4e28-9844-567a34e37e87",publisherId:"2f6fba93-9a32-4e28-9844-567a34e37e87",displayName:"DSH",origin:"http://127.0.0.1:51882",capabilities:[]};
const vault=(id:string,revision=1,target=identity.instanceId):VaultIdentity=>({discoveryProtocolVersion:1,kind:"vault",vaultId:id,bootId:"3f6fba93-9a32-4e28-9844-567a34e37e87",publisherId:id==="a"?"4f6fba93-9a32-4e28-9844-567a34e37e87":"5f6fba93-9a32-4e28-9844-567a34e37e87",displayName:id,origin:id==="a"?"http://127.0.0.1:18473":"http://127.0.0.1:18474",capabilities:[],binding:{bindingProtocolVersion:1,vaultId:id,revision,target:target?{instanceId:target,profileId:"web"}:null,updatedAt:1}});
function fixture(){
 const created:any[]=[];
 const factory=vi.fn((options:LifecycleRuntimeOptions)=>{
  const handlers=new Map();let stopped=false;
  const current={options,start:vi.fn(),dispose:vi.fn(async()=>{stopped=true;handlers.clear();}),getSnapshot:()=>({lifecycleProtocolVersion:3,state:"OFFLINE",stateChangedAt:1}),getHealth:()=>({components:{}}),subscribe:()=>()=>{},mountWhenReady:vi.fn(()=>vi.fn()),retryActions:vi.fn(),registerActionHandler:vi.fn((name:string,handler:unknown)=>{if(handlers.has(name))throw Error("duplicate");handlers.set(name,handler);return()=>handlers.delete(name);}),handlers,
   transport:{origin:options.bridgeOrigin,knowledge:vi.fn(async()=>{if(stopped)throw Error("disposed");return options.vaultId;}),openNote:vi.fn(async()=>{}),refreshReference:vi.fn(async()=>({kind:"offline"})),discardReference:vi.fn(async()=>{}),commitBacklink:vi.fn(async()=>({})),deleteCommittedReference:vi.fn(async()=>{})}};
  created.push(current);return current as never;
 });
 return{created,factory,runtime:new VaultBridgeRuntime({identity,role:"controller",fallbackOrigin:"http://127.0.0.1:18473",createRuntime:factory})};
}
it("creates independent bound Vault routes, rejects ambiguous writes and does not pick latest online",async()=>{
 const f=fixture();await f.runtime.reconcile([vault("a"),vault("b")]);expect(f.factory).toHaveBeenCalledTimes(2);expect(()=>f.runtime.transport.knowledge("note-open",{})).toThrow("多个 Vault");expect(await f.runtime.forVault("a").knowledge("note-open",{})).toBe("a");expect(await f.runtime.forVault("b").knowledge("note-open",{})).toBe("b");
 await f.runtime.reconcile([vault("b"),vault("a")]);expect(f.factory).toHaveBeenCalledTimes(2);expect(()=>f.runtime.transport.knowledge("note-open",{})).toThrow("多个 Vault");await f.runtime.dispose();
});
it("closing one Vault stops only its runtime and old handles cannot be redirected",async()=>{
 const f=fixture();await f.runtime.reconcile([vault("a"),vault("b")]);const previous=f.runtime.forVault("a");await f.runtime.reconcile([vault("b")]);expect(f.created[0].dispose).toHaveBeenCalledOnce();expect(f.created[1].dispose).not.toHaveBeenCalled();await expect(previous.knowledge("note-open",{})).rejects.toThrow("disposed");expect(await f.runtime.transport.knowledge("note-open",{})).toBe("b");await f.runtime.dispose();
});
it("bind revision, boot and target changes fence old queue and token runtime",async()=>{
 const f=fixture();await f.runtime.reconcile([vault("a")]);await f.runtime.reconcile([vault("a",2,"other")]);expect(f.created[0].dispose).toHaveBeenCalledOnce();expect(()=>f.runtime.forVault("a")).toThrow("未连接");expect(f.runtime.listVaults()[0]?.state).toBe("foreign");await f.runtime.reconcile([vault("a",3)]);expect(f.created[1].options).toMatchObject({vaultId:"a",bindingRevision:3,dshInstanceId:"instance",dshBootId:identity.bootId,dshOrigin:identity.origin});await f.runtime.dispose();
});
it("discovery alone, a foreign profile, or conflicting publishers never starts a controller",async()=>{
 const f=fixture();await f.runtime.reconcile([vault("a",0,"")]);expect(f.factory).not.toHaveBeenCalled();await f.runtime.reconcile([{...vault("a"),binding:{...vault("a").binding,target:{instanceId:"instance",profileId:"other"}}}]);expect(f.factory).not.toHaveBeenCalled();await f.runtime.reconcile([vault("a")],["a"]);expect(f.factory).not.toHaveBeenCalled();await f.runtime.dispose();
});
it("late handler reloads detach from Vaults added after registration",async()=>{
 const f=fixture();const handle=vi.fn(async()=>"handled" as const);const unregister=f.runtime.registerActionHandler("references",{accepts:()=>true,handle});await f.runtime.reconcile([vault("a"),vault("b")]);const action={type:"reference-delete-request"};await f.created[1].handlers.get("references").handle(action,new AbortController().signal);expect(handle).toHaveBeenCalledWith(action,expect.any(AbortSignal),expect.objectContaining({vaultId:"b",bindingRevision:1}));unregister();expect(f.created[0].handlers.size).toBe(0);expect(f.created[1].handlers.size).toBe(0);f.runtime.registerActionHandler("references",{accepts:()=>true,handle});expect(f.created[1].handlers.size).toBe(1);await f.runtime.dispose();
});
it("routes identical note paths through the source locator Vault for refresh, discard, commit and deletion",async()=>{
 const f=fixture();await f.runtime.reconcile([vault("a"),vault("b")]);const source=createObsidianSourceAdapter(f.runtime.transport,id=>f.runtime.forVault(id));
 const item={sourceType:"obsidian-note",referenceId:"same-ref",locator:{vaultId:"b",notePath:"same.md"},snapshot:{documentHash:"hash"}} as never;
 await source.prepare(item,new AbortController().signal);await source.discardPending?.(item);await source.commitBacklink?.({item,referenceId:"same-ref"} as never);await source.deleteCommitted?.({item,referenceId:"same-ref"} as never);
 expect(f.created[0].transport.refreshReference).not.toHaveBeenCalled();expect(f.created[1].transport.refreshReference).toHaveBeenCalledOnce();expect(f.created[1].transport.discardReference).toHaveBeenCalledOnce();expect(f.created[1].transport.commitBacklink).toHaveBeenCalledOnce();expect(f.created[1].transport.deleteCommittedReference).toHaveBeenCalledOnce();await f.runtime.dispose();
});
it("reference handoff cannot commit into a new binding after Core add",async()=>{
 const f=fixture();await f.runtime.reconcile([vault("a")]);const commit=vi.fn();const input=f.runtime.guardHandoff({sessionId:"s",operationId:"o",vaultId:"a",assertCurrent(){},prepare:async()=>({referenceId:"ref",source:{sourceType:"obsidian-note",locator:{vaultId:"a"}} as never}),commit});await input.prepare();await f.runtime.reconcile([vault("a",2)]);await expect(input.commit({referenceId:"ref",setId:"set"})).rejects.toThrow("binding changed");expect(commit).not.toHaveBeenCalled();await f.runtime.dispose();
});
