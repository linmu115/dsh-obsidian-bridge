import {mkdtemp,rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {createServer} from "node:http";
import type {AddressInfo} from "node:net";
import {expect,it,vi} from "vitest";
import {writeDiscoveryRecord,readDiscoveryRecords} from "dsh-obsidian-bridge-protocol/discovery";
import type {DshInstanceIdentity,VaultIdentity} from "dsh-obsidian-bridge-protocol/binding";
import {startHostDiscovery} from "../src/discovery-host.ts";
import {VaultBridgeRuntime} from "../src/vault-runtime.ts";
const identity:DshInstanceIdentity={discoveryProtocolVersion:1,kind:"dsh",instanceId:"instance",profileId:"web",bootId:crypto.randomUUID(),publisherId:crypto.randomUUID(),displayName:"DSH",origin:"http://127.0.0.1:51882",capabilities:[]};
async function server(vaultId:string,bound=true){
 let value:VaultIdentity={discoveryProtocolVersion:1,kind:"vault",vaultId,bootId:crypto.randomUUID(),publisherId:crypto.randomUUID(),displayName:vaultId,origin:"http://127.0.0.1:1",capabilities:["vault-instance-binding-v1"],binding:{bindingProtocolVersion:1,vaultId,revision:1,target:bound?{instanceId:"instance",profileId:"web"}:null,updatedAt:1}};
 const server=createServer((req,res)=>{res.setHeader("content-type","application/json");res.end(JSON.stringify(value));});await new Promise<void>(done=>server.listen(0,"127.0.0.1",done));value={...value,origin:`http://127.0.0.1:${(server.address() as AddressInfo).port}`};let closed=false;
 return {get identity(){return value;},async close(){if(closed)return;closed=true;await new Promise<void>((done,reject)=>server.close(error=>error?reject(error):done()));}};
}
function runtime(){const handles:any[]=[];const manager=new VaultBridgeRuntime({identity,role:"controller",fallbackOrigin:"http://127.0.0.1:18473",createRuntime:options=>{const handle={options,start:vi.fn(),dispose:vi.fn(async()=>{}),subscribe:()=>()=>{},transport:{origin:options.bridgeOrigin},getSnapshot:()=>({state:"OFFLINE"}),getHealth:()=>({components:{}})};handles.push(handle);return handle as never;}});return {manager,handles};}
it("discovers two live Vaults, publishes no secrets and isolates one Vault shutdown",async()=>{
 const directory=await mkdtemp(join(tmpdir(),"bridge-discovery-"));const a=await server("a"),b=await server("b"),f=runtime();const now=Date.now();
 await writeDiscoveryRecord({...a.identity,updatedAt:now,expiresAt:now+30000},{directory});await writeDiscoveryRecord({...b.identity,updatedAt:now,expiresAt:now+30000},{directory});const discovery=startHostDiscovery(identity,f.manager,{directory});
 try{await discovery.refresh();expect(f.manager.listVaults().filter(v=>v.state==="bound")).toHaveLength(2);expect(f.handles).toHaveLength(2);const published=await readDiscoveryRecords({directory});expect(published.records.find(record=>record.kind==="dsh")).toMatchObject(identity);expect(JSON.stringify(published)).not.toMatch(/token|Viewer|password/);await a.close();await discovery.refresh();expect(f.manager.listVaults().find(v=>v.vaultId==="a")?.state).toBe("offline");expect(f.manager.listVaults().find(v=>v.vaultId==="b")?.state).toBe("bound");expect(f.handles.find(handle=>handle.options.vaultId==="b").dispose).not.toHaveBeenCalled();}
 finally{await discovery.dispose();await f.manager.dispose();await a.close();await b.close();await rm(directory,{recursive:true,force:true});}
});
it("manual origin is only a verified unbound candidate, and duplicate instance publishers block all routes",async()=>{
 const directory=await mkdtemp(join(tmpdir(),"bridge-discovery-"));const a=await server("a",false),b=await server("b"),f=runtime();const now=Date.now();await writeDiscoveryRecord({...b.identity,updatedAt:now,expiresAt:now+30000},{directory});await writeDiscoveryRecord({...identity,publisherId:crypto.randomUUID(),bootId:crypto.randomUUID(),updatedAt:now,expiresAt:now+30000},{directory});
 const discovery=startHostDiscovery(identity,f.manager,{directory,manualOrigin:a.identity.origin});try{await discovery.refresh();expect(f.handles).toHaveLength(0);expect(f.manager.listVaults()).toHaveLength(2);expect(f.manager.listVaults().every(v=>v.state==="conflict")).toBe(true);}finally{await discovery.dispose();await f.manager.dispose();await a.close();await b.close();await rm(directory,{recursive:true,force:true});}
});
