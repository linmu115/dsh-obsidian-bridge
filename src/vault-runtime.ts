import { vaultIdentitySchema, VAULT_IDENTITY_PATH, type DshInstanceIdentity, type VaultIdentity, type ChangeVaultBindingRequest, type VaultBindingSnapshot } from "dsh-obsidian-bridge-protocol/binding";
import type { BridgeActionHandler, BridgeAttachmentMount, BridgeHealthSource, BridgeLifecycleHealth, BorrowedBridgeTransport, ObsidianBridgeLifecycle, VaultConnectionSnapshot, ReferenceHandoffInput } from "./api.ts";
import { BridgeLifecycleRuntime, type LifecycleRuntimeOptions } from "./runtime.ts";
import { createBridgeControlClient, normalizeBridgeOrigin } from "./control-client.ts";
import { BridgeUnavailableError } from "./transport.ts";

type Route = { identity: VaultIdentity; runtime: BridgeLifecycleRuntime; disposeHooks: (()=>void)[]; handlers:Map<string,()=>void>; mounts:Map<string,()=>void> };
export class AmbiguousVaultError extends Error { readonly code="AMBIGUOUS_VAULT"; constructor(){super("多个 Vault 可用，请明确选择目标 Vault");} }
export interface VaultRuntimeOptions {
 identity: DshInstanceIdentity; role:"controller"|"surface"; fallbackOrigin:string;
 surfaceId?:string; requestOrigin?:string; dshViewerUrl?:string; fetch?:typeof fetch;
 createRuntime?:(options:LifecycleRuntimeOptions)=>BridgeLifecycleRuntime;
}
/** The Vault identity, revision and boot are fixed for every runtime and pending request. */
export class VaultBridgeRuntime implements ObsidianBridgeLifecycle {
 readonly capabilities=Object.freeze(["reference-channel-v1","action-dispatch-v1","vault-routing-v1","vault-instance-binding-v1"]);
 readonly runtimeIdentity;
 private routes=new Map<string,Route>(); private candidates=new Map<string,VaultIdentity>();
 private snapshots=new Map<string,VaultConnectionSnapshot>(); private listeners=new Set<()=>void>();
 private handlers=new Map<string,BridgeActionHandler>(); private mounts=new Map<string,BridgeAttachmentMount>(); private health=new Map<string,BridgeHealthSource>();
 private stopped=false; private generation=0; private identityConflict:string|undefined;
 blockIdentity(reason:string){this.identityConflict=reason;void this.reconcile([]);this.changed();}
 readonly transport:BorrowedBridgeTransport;
 constructor(private options:VaultRuntimeOptions){
  this.runtimeIdentity={dshInstanceId:options.identity.instanceId,profileId:options.identity.profileId};
  this.transport=new Proxy({} as BorrowedBridgeTransport,{get:(_target,key)=>key==="origin"?this.select().runtime.transport.origin:(...args:unknown[])=>{
   const transport=this.select().runtime.transport as unknown as Record<string,(...args:unknown[])=>unknown>;
   const method=transport[String(key)];if(typeof method!=="function")throw new Error("Unsupported borrowed Bridge operation");return method(...args);
  }});
 }
 get bridgeOrigin(){return this.options.fallbackOrigin;}
 listVaults=()=>[...this.snapshots.values()].map(value=>({...value,...(this.routes.get(value.vaultId)?{connectionState:this.routes.get(value.vaultId)!.runtime.getSnapshot().state}:{})}));
 identities=()=>[...this.candidates.values()];
 private select(vaultId?:string):Route {
  if(this.identityConflict)throw new Error(this.identityConflict);
  if(this.stopped)throw new BridgeUnavailableError("Bridge runtime stopped");
  if(vaultId!==undefined){const route=this.routes.get(vaultId);if(!route)throw new BridgeUnavailableError(`Vault ${vaultId} 未连接到当前实例`);return route;}
  if(this.routes.size>1)throw new AmbiguousVaultError();const route=this.routes.values().next().value as Route|undefined;
  if(!route)throw new BridgeUnavailableError("尚未绑定可用的 Obsidian Vault");return route;
 }
 forVault=(vaultId:string)=>this.select(vaultId).runtime.transport;
 subscribe=(listener:()=>void)=>{this.listeners.add(listener);return()=>{this.listeners.delete(listener);};};
 private changed(){for(const listener of this.listeners)listener();}
 getSnapshot=()=>{
  const routes=[...this.routes.values()];const ready=routes.find(route=>["READY","DEGRADED"].includes(route.runtime.getSnapshot().state));
  return ready?.runtime.getSnapshot()??routes[0]?.runtime.getSnapshot()??{lifecycleProtocolVersion:3 as const,state:"OFFLINE" as const,stateChangedAt:Date.now(),reason:"No confirmed Vault binding"};
 };
 getHealth=():BridgeLifecycleHealth=>({state:this.getSnapshot().state,bridgeOrigin:this.bridgeOrigin,components:Object.fromEntries([...this.health].map(([name,source])=>[name,source.getHealth()]).concat([...this.routes].flatMap(([vaultId,route])=>Object.entries(route.runtime.getHealth().components).map(([name,health])=>[`${vaultId}/${name}`,health])))),vaults:this.listVaults()});
 registerHealthSource=(name:string,source:BridgeHealthSource)=>{this.health.set(name,source);const un=source.subscribe?.(()=>this.changed());this.changed();return()=>{if(this.health.get(name)===source)this.health.delete(name);un?.();this.changed();};};
 private bindHandler(route:Route,name:string,handler:BridgeActionHandler){return route.runtime.registerActionHandler(name,{accepts:handler.accepts,handle:(action,signal)=>handler.handle(action,signal,{vaultId:route.identity.vaultId,bindingRevision:route.identity.binding.revision,transport:route.runtime.transport})});}
 registerActionHandler=(name:string,handler:BridgeActionHandler)=>{
  if(this.handlers.has(name))throw new Error(`Bridge action handler already registered: ${name}`);this.handlers.set(name,handler);
  for(const route of this.routes.values())route.handlers.set(name,this.bindHandler(route,name,handler));
  return()=>{this.handlers.delete(name);for(const route of this.routes.values()){route.handlers.get(name)?.();route.handlers.delete(name);route.runtime.retryActions();}};
 };
 mountWhenReady=(name:string,mount:BridgeAttachmentMount)=>{
  if(this.mounts.has(name))throw new Error(`Bridge attachment already registered: ${name}`);this.mounts.set(name,mount);
  for(const route of this.routes.values())route.mounts.set(name,route.runtime.mountWhenReady(name,status=>mount(status,{vaultId:route.identity.vaultId,bindingRevision:route.identity.binding.revision,transport:route.runtime.transport})));
  return()=>{this.mounts.delete(name);for(const route of this.routes.values()){route.mounts.get(name)?.();route.mounts.delete(name);}};
 };
 retryActions=()=>{for(const route of this.routes.values())route.runtime.retryActions();};
 retry=(name?:string)=>{for(const route of this.routes.values())route.runtime.retry(name);if(name===undefined)for(const source of this.health.values())source.retry?.();else this.health.get(name)?.retry?.();};
 drain=async(reason:string,deadlineMs?:number)=>{await Promise.all([...this.routes.values()].map(route=>route.runtime.drain(reason,deadlineMs)));};
 resume=async()=>{await Promise.all([...this.routes.values()].map(route=>route.runtime.resume()));};
 async reconcile(input:readonly VaultIdentity[], conflicts:readonly string[]=[]):Promise<void>{
  const generation=++this.generation;if(this.stopped)return;
  const found=new Map<string,VaultIdentity>();
  const duplicated=new Set(conflicts);
  for(const raw of this.identityConflict?[]:input){const identity=vaultIdentitySchema.parse(raw);if(found.has(identity.vaultId)&&found.get(identity.vaultId)?.publisherId!==identity.publisherId)duplicated.add(identity.vaultId);found.set(identity.vaultId,identity);}
  for(const [vaultId,route] of this.routes){const next=found.get(vaultId);
   if(!next||duplicated.has(vaultId)||next.bootId!==route.identity.bootId||next.origin!==route.identity.origin||next.binding.revision!==route.identity.binding.revision||!this.owned(next)){
    this.routes.delete(vaultId);for(const dispose of route.disposeHooks)dispose();await route.runtime.dispose();
   }
  }
  if(this.stopped||generation!==this.generation)return;
  for(const [vaultId,old] of this.snapshots)if(!found.has(vaultId))this.snapshots.set(vaultId,{...old,state:"offline"});
  this.candidates=found;
  for(const [vaultId,identity] of found){
   const state=duplicated.has(vaultId)?"conflict":this.owned(identity)?"bound":identity.binding.target===null?"available":"foreign";
   this.snapshots.set(vaultId,{vaultId,displayName:identity.displayName,origin:identity.origin,binding:identity.binding,state});
   if(state!=="bound"||this.routes.has(vaultId))continue;
   const runtime=(this.options.createRuntime??(options=>new BridgeLifecycleRuntime(options)))({bridgeOrigin:identity.origin,clientId:`dsh-${this.options.role}:${crypto.randomUUID()}`,
    role:this.options.role,dshInstanceId:this.options.identity.instanceId,profileId:this.options.identity.profileId,vaultId,bindingRevision:identity.binding.revision,dshBootId:this.options.identity.bootId,dshOrigin:this.options.identity.origin,
    ...(this.options.surfaceId?{surfaceId:this.options.surfaceId}:{}),...(this.options.requestOrigin?{requestOrigin:this.options.requestOrigin}:{}),
    ...(this.options.fetch?{fetch:this.options.fetch}:{}),...(this.options.role==="controller"?{browserOrigins:[this.options.identity.origin],...(this.options.dshViewerUrl?{dshViewerUrl:this.options.dshViewerUrl}:{})}:{}),
   });
   const route:Route={identity,runtime,disposeHooks:[],handlers:new Map(),mounts:new Map()};this.routes.set(vaultId,route);
   for(const [name,handler]of this.handlers)route.handlers.set(name,this.bindHandler(route,name,handler));
   for(const [name,mount]of this.mounts)route.mounts.set(name,runtime.mountWhenReady(name,status=>mount(status,{vaultId,bindingRevision:identity.binding.revision,transport:runtime.transport})));
   route.disposeHooks.push(runtime.subscribe(()=>this.changed()));runtime.start();
  }
  this.changed();
 }
 private owned(identity:VaultIdentity){return identity.binding.target?.instanceId===this.options.identity.instanceId&&identity.binding.target.profileId===this.options.identity.profileId;}
 async changeVaultBinding(vaultId:string,input:ChangeVaultBindingRequest):Promise<VaultBindingSnapshot>{
  if(this.identityConflict)throw new Error(this.identityConflict);
  const candidate=this.candidates.get(vaultId);if(!candidate)throw new Error("Vault discovery candidate unavailable");
  if(this.snapshots.get(vaultId)?.state==="conflict")throw new Error("Vault discovery identity conflict");
  const fresh=await this.probe(candidate.origin);if(fresh.vaultId!==vaultId||fresh.bootId!==candidate.bootId)throw new Error("Vault candidate identity changed");
  const control=createBridgeControlClient({origin:fresh.origin,clientId:`dsh-binding:${this.options.identity.publisherId}`,role:"controller",dshInstanceId:this.options.identity.instanceId,profileId:this.options.identity.profileId,
   vaultId,bindingRevision:input.expectedRevision,dshBootId:this.options.identity.bootId,dshOrigin:this.options.identity.origin,...(this.options.fetch?{fetch:this.options.fetch}:{})});
  try {return await control.changeBinding(input);}finally{await control.dispose();}
 }
 guardHandoff(input:ReferenceHandoffInput):ReferenceHandoffInput {
  let pinned:Route|undefined;
  return {...input,prepare:async()=>{
   const prepared=await input.prepare();if(prepared.source.sourceType!=="obsidian-note")throw new Error("Expected Obsidian reference source");
   if(input.vaultId&&prepared.source.locator.vaultId!==input.vaultId)throw new Error("Prepared reference Vault does not match the selected Vault");
   pinned=this.select(prepared.source.locator.vaultId);return prepared;
  },commit:async(result)=>{if(!pinned||this.routes.get(pinned.identity.vaultId)!==pinned)throw new Error("Vault binding changed during reference handoff");await input.commit(result);}};
 }
 async probe(origin:string):Promise<VaultIdentity>{
  origin=normalizeBridgeOrigin(origin);const response=await(this.options.fetch??fetch)(`${origin}${VAULT_IDENTITY_PATH}`,{redirect:"error",signal:AbortSignal.timeout(3000)});
  if(!response.ok)throw new Error(`Vault identity unavailable (${response.status})`);
  if(Number(response.headers.get("content-length"))>65536)throw new Error("Vault identity response too large");
  const reader=response.body?.getReader();if(!reader)throw new Error("Vault identity response is empty");let size=0;const chunks:Uint8Array[]=[];
  try{for(;;){const part=await reader.read();if(part.done)break;size+=part.value.length;if(size>65536)throw new Error("Vault identity response too large");chunks.push(part.value);}}finally{await reader.cancel().catch(()=>undefined);}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  const identity=vaultIdentitySchema.parse(JSON.parse(new TextDecoder().decode(bytes)));
  if(identity.origin!==origin||!identity.capabilities.includes("vault-instance-binding-v1"))throw new Error("Vault endpoint identity or binding capability mismatch");return identity;
 }

 async dispose(){if(this.stopped)return;this.stopped=true;this.generation++;await Promise.all([...this.routes.values()].map(route=>route.runtime.dispose()));this.routes.clear();this.listeners.clear();this.handlers.clear();this.mounts.clear();this.health.clear();}
}
