import {expect,it,vi} from 'vitest';
import {registerBridgeBusinessPage,type BusinessPageService} from '../src/business-page.ts';
import type {DshInstanceIdentity} from 'dsh-obsidian-bridge-protocol/binding';
import type {VaultConnectionSnapshot} from '../src/api.ts';
it('projects binding status and forwards owner-checked CAS without becoming a binding authority',async()=>{
 let provider!:Parameters<BusinessPageService['register']>[0];const dispose=vi.fn();
 const identity={instanceId:'instance',profileId:'web',origin:'http://127.0.0.1:3000',bootId:crypto.randomUUID()} as DshInstanceIdentity;
 const service={identity,register:vi.fn(value=>{provider=value;return dispose;})} as BusinessPageService;
 let vault:VaultConnectionSnapshot={vaultId:'vault',displayName:'Notes',origin:'http://127.0.0.1:4000',state:'available',binding:{bindingProtocolVersion:1,vaultId:'vault',revision:0,target:null,updatedAt:1}};
 const change=vi.fn(async()=>vault.binding);const un=registerBridgeBusinessPage(service,{listVaults:()=>[vault],changeVaultBinding:change} as never,identity);
 const first=await provider.snapshot();expect(await provider.snapshot()).toEqual(first);
 const section=first.sections.find(item=>item.kind==='actions')!;if(section.kind!=='actions')throw Error('actions');
 const action=section.actions[0]!;const request={owner:{...identity,namespace:'obsidian-bridge',providerId:'vault-bindings'},operationId:crypto.randomUUID(),actionId:action.id,expectedRevision:0,input:{}};
 await provider.handleAction(request,new AbortController().signal);expect(change).toHaveBeenCalledWith('vault',expect.objectContaining({operationId:request.operationId,expectedRevision:0,intent:'bind',candidate:{origin:identity.origin,bootId:identity.bootId}}));
 vault={...vault,binding:{...vault.binding,revision:1,target:{instanceId:'other',profileId:'web'}},state:'foreign'};
 expect((await provider.snapshot()).revision).toBeGreaterThan(first.revision);
 await expect(provider.handleAction(request,new AbortController().signal)).rejects.toThrow('绑定已改变');
 await expect(provider.handleAction({...request,owner:{...request.owner,instanceId:'other'}},new AbortController().signal)).rejects.toThrow('当前实例');
 expect(change).toHaveBeenCalledTimes(1);un();expect(dispose).toHaveBeenCalledOnce();
 expect(()=>registerBridgeBusinessPage({...service,identity:{instanceId:'other',profileId:'web'}},{} as never,identity)).toThrow('identity mismatch');
});

it('offers an owner-checked fieldless folder action even with no discovered Vaults',async()=>{
 let provider!:Parameters<BusinessPageService['register']>[0];
 const identity={instanceId:'instance',profileId:'web',origin:'http://127.0.0.1:3000',bootId:crypto.randomUUID()} as DshInstanceIdentity;
 const bindSelectedFolder=vi.fn(async()=>({message:'已取消选择，绑定未改变'}));
 registerBridgeBusinessPage({identity,register:value=>{provider=value;return()=>{};}},{listVaults:()=>[]} as never,identity,{bindSelectedFolder});
 const snapshot=await provider.snapshot();const section=snapshot.sections.find(section=>section.kind==='actions');
 expect(section?.kind==='actions'&&section.actions[0]).toEqual({id:'select-folder-and-bind',label:'选择文件夹并绑定',expectedRevision:0,fields:[]});
 const request={owner:{...identity,namespace:'obsidian-bridge',providerId:'vault-bindings'},operationId:crypto.randomUUID(),actionId:'select-folder-and-bind',expectedRevision:0,input:{}};
 const signal=new AbortController().signal;await provider.handleAction(request,signal);
 expect(bindSelectedFolder).toHaveBeenCalledWith(request.operationId,signal);
 await expect(provider.handleAction({...request,input:{path:'do not accept browser paths'}},signal)).rejects.toThrow('动作无效');
 await expect(provider.handleAction({...request,expectedRevision:1},signal)).rejects.toThrow('动作无效');
 await expect(provider.handleAction({...request,owner:{...request.owner,profileId:'other'}},signal)).rejects.toThrow('当前实例');
 expect(bindSelectedFolder).toHaveBeenCalledOnce();
});
