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
 private stopped=false; private generation=0;
 private readonly identityBlocks=new Map<symbol,string>();
 private reconcileQueue:Promise<void>=Promise.resolve();
 private disposal:Promise<void>|undefined;
 private readonly bindingRequests=new Map<AbortController,Promise<VaultBindingSnapshot>>();
 private get identityConflict(){return this.identityBlocks.values().next().value;}
 /** The conflict belongs to the observing dependency, never to a permanent latch. */
 blockIdentity(reason:string):()=>void {
  const token=Symbol();this.identityBlocks.set(token,reason);
  for(const controller of this.bindingRequests.keys())controller.abort(new Error(reason));
  void this.reconcile([]).catch(()=>undefined);this.changed();
  return()=>{if(this.identityBlocks.delete(token)&&!this.stopped)this.changed();};
 }
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
 reconcile(input:readonly VaultIdentity[], conflicts:readonly string[]=[]):Promise<void>{
  if(this.stopped)return Promise.resolve();
  const generation=++this.generation;
  const work=this.reconcileQueue.then(()=>this.reconcileCurrent(input,conflicts,generation));
  this.reconcileQueue=work.catch(()=>undefined);return work;
 }
 private async reconcileCurrent(input:readonly VaultIdentity[], conflicts:readonly string[],generation:number):Promise<void>{
  if(this.stopped||generation!==this.generation)return;
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
 changeVaultBinding(vaultId:string,input:ChangeVaultBindingRequest,guard?:{identity:VaultIdentity;signal:AbortSignal}):Promise<VaultBindingSnapshot>{
  if(this.stopped)return Promise.reject(new BridgeUnavailableError('Bridge runtime stopped'));
  const controller=new AbortController();
  const signal=guard?AbortSignal.any([controller.signal,guard.signal]):controller.signal;
  const task=Promise.resolve().then(()=>this.changeBindingCurrent(vaultId,input,signal,guard?.identity)).finally(()=>{this.bindingRequests.delete(controller);});
  this.bindingRequests.set(controller,task);return task;
 }
 private async changeBindingCurrent(vaultId:string,input:ChangeVaultBindingRequest,signal:AbortSignal,selected?:VaultIdentity):Promise<VaultBindingSnapshot>{
  signal.throwIfAborted();
  if(this.stopped)throw new BridgeUnavailableError('Bridge runtime stopped');
  if(this.identityConflict)throw new Error(this.identityConflict);
  const candidate=this.candidates.get(vaultId);if(!candidate)throw new Error("Vault discovery candidate unavailable");
  if(this.snapshots.get(vaultId)?.state==="conflict")throw new Error("Vault discovery identity conflict");
  const fresh=await this.probe(candidate.origin);if(fresh.vaultId!==vaultId||fresh.bootId!==candidate.bootId||fresh.publisherId!==candidate.publisherId)throw new Error("Vault candidate identity changed");
  if(selected&&(fresh.bootId!==selected.bootId||fresh.publisherId!==selected.publisherId||fresh.origin!==selected.origin))throw new Error("所选 Vault 在线身份已改变，请重新选择");
  signal.throwIfAborted();
  if(this.identityConflict)throw new Error(this.identityConflict);
  if(this.stopped)throw new BridgeUnavailableError('Bridge runtime stopped');
  const current=this.candidates.get(vaultId);
  if(!current||current.bootId!==candidate.bootId||current.publisherId!==candidate.publisherId||current.origin!==candidate.origin||current.binding.revision!==candidate.binding.revision||this.snapshots.get(vaultId)?.state==='conflict')throw new Error('Vault candidate changed during binding probe');
  const control=createBridgeControlClient({origin:fresh.origin,clientId:`dsh-binding:${this.options.identity.publisherId}`,role:"controller",dshInstanceId:this.options.identity.instanceId,profileId:this.options.identity.profileId,
   vaultId,bindingRevision:input.expectedRevision,dshBootId:this.options.identity.bootId,dshOrigin:this.options.identity.origin,...(this.options.fetch?{fetch:this.options.fetch}:{})});
  const cancel=()=>control.cancelPending();signal.addEventListener('abort',cancel,{once:true});
  try {signal.throwIfAborted();const result=await control.changeBinding(input);signal.throwIfAborted();return result;}finally{signal.removeEventListener('abort',cancel);await control.dispose();}
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

 dispose():Promise<void>{
  if(this.disposal)return this.disposal;
  this.stopped=true;this.generation++;
  for(const controller of this.bindingRequests.keys())controller.abort(new Error('Bridge runtime stopped'));
  this.disposal=(async()=>{
   await Promise.allSettled([...this.bindingRequests.values()]);
   await this.reconcileQueue;
   const routes=[...this.routes.values()];this.routes.clear();
   const results=await Promise.allSettled(routes.map(async route=>{
    try{for(const stop of route.disposeHooks)stop();}finally{await route.runtime.dispose();}
   }));
   this.listeners.clear();this.handlers.clear();this.mounts.clear();this.health.clear();this.identityBlocks.clear();
   const failures=results.filter((result):result is PromiseRejectedResult=>result.status==='rejected');
   if(failures.length)throw new AggregateError(failures.map(result=>result.reason),'Vault route cleanup failed');
  })();return this.disposal;
 }
}
