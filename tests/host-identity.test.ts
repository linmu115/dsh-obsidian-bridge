import {expect,it,vi} from "vitest";
import {mkdtemp,readFile,writeFile,rm} from "node:fs/promises";
import {join} from "node:path";
import {tmpdir} from "node:os";
import {resolveInstanceIdentity,bridgeIdentityDomainSpec} from "../src/host-identity.ts";
function storage(){let value:{}|{instanceId:string}={};return{open:vi.fn(async()=>({global:{get:()=>value,set:async(next:{instanceId:string})=>{value=next;}},close:vi.fn(async()=>{})}))};}
it("persists an identity across restarts independently of port and display name",async()=>{
 const domain=storage();const first=await resolveInstanceIdentity({storage:domain,profileId:"web",origin:"http://127.0.0.1:51882",displayName:"First"});await first.dispose();const second=await resolveInstanceIdentity({storage:domain,profileId:"web",origin:"http://127.0.0.1:62431",displayName:"Renamed"});expect(second.identity.instanceId).toBe(first.identity.instanceId);expect(second.identity.bootId).not.toBe(first.identity.bootId);expect(second.identity.publisherId).not.toBe(first.identity.publisherId);await second.dispose();
});
it("keeps configured and persisted identity independent of optional provider load order",async()=>{
 const domain=storage();const first=await resolveInstanceIdentity({storage:domain,configuredId:"trusted",maintenance:{instanceId:"trusted",profileId:"web"},profileId:"web",origin:"http://127.0.0.1:51882"});expect(first.identity.instanceId).toBe("trusted");await first.dispose();await expect(resolveInstanceIdentity({storage:domain,configuredId:"other",profileId:"web",origin:"http://127.0.0.1:51882"})).rejects.toThrow("conflicts");
 const restarted=await resolveInstanceIdentity({storage:domain,maintenance:{instanceId:"other",profileId:"web"},profileId:"web",origin:"http://127.0.0.1:51882"});expect(restarted.identity.instanceId).toBe('trusted');await restarted.dispose();
 const configured=await resolveInstanceIdentity({configuredId:"trusted",maintenance:{instanceId:"other",profileId:"web"},profileId:"web",origin:"http://127.0.0.1:51882"});expect(configured.identity.instanceId).toBe('trusted');await configured.dispose();
});
it("never uses discovery or a random transient id when persistence is absent",async()=>{await expect(resolveInstanceIdentity({profileId:"web",origin:"http://127.0.0.1:51882"})).rejects.toThrow("storageDomain");});

it("uses the real RC2 domain contract and restores its durable global after facility restart",async()=>{
 const moduleUrl=import.meta.resolve('@deepseek-ai/dsh-storage-domain');
 const {DomainFacility,defineDomain}=await import(moduleUrl);
 expect(defineDomain(bridgeIdentityDomainSpec)).toBe(bridgeIdentityDomainSpec);
 const directory=await mkdtemp(join(tmpdir(),'synthetic-bridge-identity-'));const file=join(directory,'identity.json');
 const create=()=>new DomainFacility({emit:vi.fn(),logger:{warn:vi.fn()},storage:{backend:{get:()=>({kv:{open:async(descriptor:{name:string})=>{
  expect(descriptor.name).toMatch(/^[a-z0-9_]+$/);return{loadAll:async()=>({tables:{},global:await readFile(file,'utf8').then(JSON.parse).catch(()=>null)}),setGlobal:async(value:unknown)=>writeFile(file,JSON.stringify(value)),close:async()=>{}};
 }}})}}},{backend:'synthetic'});
 try{const first=await resolveInstanceIdentity({storage:create(),profileId:'web',origin:'http://127.0.0.1:3000'});await first.dispose();const next=await resolveInstanceIdentity({storage:create(),profileId:'web',origin:'http://127.0.0.1:4567'});expect(next.identity.instanceId).toBe(first.identity.instanceId);await next.dispose();}finally{await rm(directory,{recursive:true,force:true});}
});
