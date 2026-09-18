import { readDiscoveryRecords, writeDiscoveryRecord, removeDiscoveryRecord } from "dsh-obsidian-bridge-protocol/discovery";
import type { DshInstanceIdentity } from "dsh-obsidian-bridge-protocol/binding";
import type { VaultBridgeRuntime } from "./vault-runtime.ts";
export function startHostDiscovery(identity:DshInstanceIdentity,runtime:VaultBridgeRuntime,options:{directory?:string;manualOrigin?:string;intervalMs?:number;onError?:(error:unknown)=>void}={}) {
 let stopped=false,timer:ReturnType<typeof setTimeout>|undefined,running:Promise<void>|undefined,refreshing:Promise<void>|undefined;
 const discoveryOptions=options.directory?{directory:options.directory}:{};
 const cycle=async()=>{
  try {
   const now=Date.now();await writeDiscoveryRecord({...identity,updatedAt:now,expiresAt:now+30_000},discoveryOptions);
   const found=await readDiscoveryRecords(discoveryOptions);
   const selfConflict=found.conflicts.some(conflict=>conflict.kind==="dsh"&&conflict.id===identity.instanceId&&conflict.profileId===identity.profileId);
   const candidates=found.records.filter(record=>record.kind==="vault");
   const origins=new Set(candidates.map(candidate=>candidate.origin));if(options.manualOrigin)origins.add(options.manualOrigin);
   const verified=await Promise.all([...origins].map(async origin=>{try{const result=await runtime.probe(origin);const advertised=candidates.find(candidate=>candidate.origin===origin);if(advertised&&(advertised.vaultId!==result.vaultId||advertised.bootId!==result.bootId||advertised.publisherId!==result.publisherId))throw new Error("Discovery candidate changed identity");return result;}catch{return undefined;}}));
   if(!stopped){const live=verified.filter(value=>value!==undefined);await runtime.reconcile(live,[...found.conflicts.filter(conflict=>conflict.kind==="vault").map(conflict=>conflict.id),...(selfConflict?live.map(value=>value.vaultId):[])]);}
  }catch(error){if(!stopped){await runtime.reconcile([]);options.onError?.(error);}}
  finally{if(!stopped)timer=setTimeout(()=>{running=cycle();},options.intervalMs??10_000);}
 };
 running=cycle();return {refresh:()=>refreshing??=(async()=>{if(running)await running;if(timer)clearTimeout(timer);if(!stopped){running=cycle();await running;}})().finally(()=>{refreshing=undefined;}),dispose:async()=>{stopped=true;if(timer)clearTimeout(timer);await running;await removeDiscoveryRecord(identity,discoveryOptions);}};
}
