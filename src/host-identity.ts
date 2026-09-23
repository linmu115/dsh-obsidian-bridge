import { z } from "zod";
import { dshInstanceIdentitySchema, type DshInstanceIdentity } from "dsh-obsidian-bridge-protocol/binding";
export const bridgeIdentityDomainSpec={name:"dsh_obsidian_bridge_identity_v1",version:1,tables:{},global:{schema:z.object({instanceId:z.string().min(1).optional()}).strict(),initial:{}}};
export interface IdentityDomain {global:{get():{instanceId?:string};set(value:{instanceId:string}):Promise<void>};close():Promise<void>;}
export interface IdentityStorage {open(spec:typeof bridgeIdentityDomainSpec):Promise<IdentityDomain>;}
export async function resolveInstanceIdentity(input:{configuredId?:string;profileId:string;maintenance?:{instanceId:string;profileId:string};storage?:IdentityStorage;origin:string;displayName?:string}):Promise<{identity:DshInstanceIdentity;dispose():Promise<void>}> {
 const configured=input.configuredId?.trim();const maintenance=input.maintenance;
 let domain:IdentityDomain|undefined;
 try {
  if(input.storage)domain=await input.storage.open(bridgeIdentityDomainSpec);
  const stored=domain?.global.get().instanceId;
  // Existing Bridge identity is independent of an optional provider's load order.
  // Maintenance is only a first-install seed; the live dependency scope fences
  // conflicts and releases that fence when the provider is removed or corrected.
  const trusted=configured||stored||(maintenance?.profileId===input.profileId?maintenance.instanceId:undefined);
  if(stored&&configured&&stored!==configured)throw new Error("Stored Bridge identity conflicts with configured identity; explicit reconciliation is required");
  const instanceId=trusted||stored||crypto.randomUUID();
  if(!trusted&&!domain)throw new Error("Bridge stable identity requires instance storageDomain");
  if(domain&&!stored)await domain.global.set({instanceId});
  const identity=dshInstanceIdentitySchema.parse({discoveryProtocolVersion:1,kind:"dsh",instanceId,profileId:input.profileId,bootId:crypto.randomUUID(),publisherId:crypto.randomUUID(),displayName:input.displayName||"DSH",origin:input.origin,capabilities:["vault-instance-binding-v1","reference-channel-v1"]});
  return {identity,dispose:async()=>{await domain?.close();}};
 }catch(error){await domain?.close();throw error;}
}
