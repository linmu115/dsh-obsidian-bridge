import {pathToFileURL} from "node:url";
import {resolve} from "node:path";
import {createServer} from "node:http";
import type {AddressInfo} from "node:net";
import {expect,it,vi} from "vitest";
import {VaultBridgeRuntime} from "../src/vault-runtime.ts";
import type {DshInstanceIdentity,VaultIdentity} from "dsh-obsidian-bridge-protocol/binding";

it("performs binding, independent controller leases and routed data handshakes against the Companion server",async()=>{
 // Full cross-project integration requires a checked-out Companion source tree.
 const companionRoot=process.env.DSH_OBSIDIAN_COMPANION_SOURCE;
 const serverModule=(companionRoot ? pathToFileURL(resolve(companionRoot,"src/bridge/server.ts")) : new URL("../../obsidian-deepharness-bridge/src/bridge/server.ts",import.meta.url)).href;
 const providerModule=(companionRoot ? pathToFileURL(resolve(companionRoot,"src/binding/provider.ts")) : new URL("../../obsidian-deepharness-bridge/src/binding/provider.ts",import.meta.url)).href;
 const {startBridgeServer}=await import(serverModule);const {VaultBindingProvider}=await import(providerModule);
 let dsh:DshInstanceIdentity={discoveryProtocolVersion:1,kind:"dsh",instanceId:"instance",profileId:"web",bootId:crypto.randomUUID(),publisherId:crypto.randomUUID(),displayName:"Synthetic DSH",origin:"http://127.0.0.1:1",capabilities:["vault-instance-binding-v1"]};
 const probeServer=createServer((_request,response)=>{response.setHeader("content-type","application/json");response.end(JSON.stringify(dsh));});await new Promise<void>(resolve=>probeServer.listen(0,"127.0.0.1",resolve));dsh={...dsh,origin:`http://127.0.0.1:${(probeServer.address() as AddressInfo).port}`};
 const running:any[]=[];const knowledge=vi.fn(async(_op:string,input:unknown)=>input);
 const make=async(vaultId:string)=>{const binding=new VaultBindingProvider(vaultId,async()=>{},undefined,undefined,async()=>({records:[],conflicts:[]}));let server:any;const publisherId=crypto.randomUUID();const value=():VaultIdentity=>({discoveryProtocolVersion:1,kind:"vault",vaultId,bootId:server.identity.bootId,publisherId,displayName:vaultId,origin:server.origin,capabilities:["vault-instance-binding-v1"],binding:binding.snapshot()});server=await startBridgeServer({port:0,binding,discoveryIdentity:value,onKnowledge:async(op:string,input:unknown)=>({vaultId,result:await knowledge(op,input)})});running.push(server);return {server,binding,value};};
 const a=await make("vault-a"),b=await make("vault-b");const manager=new VaultBridgeRuntime({identity:dsh,role:"controller",fallbackOrigin:a.server.origin,dshViewerUrl:dsh.origin+"/?token=synthetic-test-only"});
 try{
  await manager.reconcile([a.value(),b.value()]);expect(manager.listVaults().every(v=>v.state==="available")).toBe(true);
  for(const vault of [a,b])await manager.changeVaultBinding(vault.value().vaultId,{operationId:crypto.randomUUID(),expectedRevision:0,intent:"bind",target:{instanceId:dsh.instanceId,profileId:dsh.profileId},candidate:{origin:dsh.origin,bootId:dsh.bootId}});
  await manager.reconcile([a.value(),b.value()]);await vi.waitFor(()=>expect(a.server.activeDshViewerUrl()).toBe(dsh.origin+"/?token=synthetic-test-only"));await vi.waitFor(()=>expect(b.server.activeDshViewerUrl()).toBe(dsh.origin+"/?token=synthetic-test-only"));
  expect(await manager.forVault("vault-a").knowledge("notes",{query:"same.md"})).toMatchObject({vaultId:"vault-a"});expect(await manager.forVault("vault-b").knowledge("notes",{query:"same.md"})).toMatchObject({vaultId:"vault-b"});
  const old=manager.forVault("vault-a");await manager.changeVaultBinding("vault-a",{operationId:crypto.randomUUID(),expectedRevision:1,intent:"unbind",target:null});await manager.reconcile([a.value(),b.value()]);await expect(old.knowledge("notes",{})).rejects.toThrow();expect(await manager.forVault("vault-b").knowledge("notes",{})).toMatchObject({vaultId:"vault-b"});
 }finally{await manager.dispose();await Promise.all(running.map(server=>server.close()));await new Promise<void>((resolve,reject)=>probeServer.close(error=>error?reject(error):resolve()));}
},15000);
