import { createHash } from 'node:crypto';
import type { DshInstanceIdentity } from 'dsh-obsidian-bridge-protocol/binding';
import type { ObsidianBridgeLifecycle, VaultConnectionSnapshot } from './api.ts';

// Structural optional service: the Bridge remains usable when Maintenance is absent.
interface ActionRequest { owner:{instanceId:string;profileId:string;namespace:string;providerId:string}; operationId:string; actionId:string; expectedRevision:number; input:Record<string,string|number|boolean>; }
interface Snapshot {title:string;revision:number;sections:({id:string;title:string;kind:'summary';text:string}|{id:string;title:string;kind:'key-values';items:{label:string;value:string}[]}|{id:string;title:string;kind:'actions';actions:{id:string;label:string;expectedRevision:number;fields:never[]}[]})[];}
export interface BusinessPageService { readonly identity:{instanceId:string;profileId:string}; register(provider:{namespace:string;providerId:string;snapshot():Promise<Snapshot>;handleAction(request:ActionRequest,signal:AbortSignal):Promise<{message:string}>}):()=>void; }
const actionId=(vault:VaultConnectionSnapshot)=>`${vault.state==='bound'?'unbind':'bind'}:${createHash('sha256').update(vault.vaultId).digest('hex').slice(0,32)}`;
const states={bound:'已绑定',available:'可绑定',foreign:'已绑定其他实例',offline:'离线',conflict:'身份冲突'};
const actionable=(vault:VaultConnectionSnapshot)=>['bound','available','foreign'].includes(vault.state);
export function registerBridgeBusinessPage(service:BusinessPageService,lifecycle:ObsidianBridgeLifecycle,identity:DshInstanceIdentity,options:{bindSelectedFolder?:(operationId:string,signal:AbortSignal)=>Promise<{message:string}>}={}):()=>void {
 if(service.identity.instanceId!==identity.instanceId||service.identity.profileId!==identity.profileId)throw new Error('Bridge business page identity mismatch');
 let revision=0,fingerprint='';
 return service.register({namespace:'obsidian-bridge',providerId:'vault-bindings',
  async snapshot(){
   const vaults=[...(lifecycle.listVaults?.()??[])].sort((a,b)=>a.vaultId.localeCompare(b.vaultId));
   const sections:Snapshot['sections']=[{id:'overview',title:'Obsidian 连接',kind:'summary',text:`已发现 ${vaults.length} 个 Vault。绑定由各 Vault 保存。选择文件夹会在运行当前 DSH 的 Windows 桌面打开选择框（60 秒内完成）；请先在 Obsidian 打开该 Vault 并启用 Bridge。已绑定其他实例的 Vault 需在明确的改绑入口操作。更多 Vault 可在 DSH 的 Obsidian 面板管理。`},
    {id:'vaults',title:'Vault 状态',kind:'key-values',items:vaults.slice(0,24).map(vault=>({label:vault.displayName.slice(0,120),value:`${vault.vaultId} · ${states[vault.state]}${vault.connectionState ? ' / '+vault.connectionState : ''} · ${vault.binding.target?.instanceId??'尚未绑定'} · 修订 ${vault.binding.revision}`.slice(0,600)}))},
    {id:'binding-actions',title:'绑定管理',kind:'actions',actions:[...(options.bindSelectedFolder?[{id:'select-folder-and-bind',label:'选择文件夹并绑定',expectedRevision:0,fields:[] as never[]}]:[]),...vaults.filter(actionable).slice(0,15).map(vault=>({id:actionId(vault),label:`${vault.state==='bound'?'解除绑定':vault.state==='foreign'?'改绑到当前实例':'绑定当前实例'}：${vault.displayName}`.slice(0,200),expectedRevision:vault.binding.revision,fields:[] as never[]}))]}];
   // Bound serialized bytes too: valid labels can contain JSON-escaped characters.
   while(JSON.stringify({title:'Obsidian Vault 绑定',revision:Number.MAX_SAFE_INTEGER,sections}).length>30000){
    const rows=sections.find(section=>section.kind==='key-values');const actions=sections.find(section=>section.kind==='actions');
    if(rows?.kind==='key-values'&&rows.items.length)rows.items.pop();else if(actions?.kind==='actions'&&actions.actions.length)actions.actions.pop();else break;
   }
   const next=JSON.stringify(sections);if(next!==fingerprint){fingerprint=next;revision++;}return{title:'Obsidian Vault 绑定',revision,sections};
  },
  async handleAction(request,signal){
   signal.throwIfAborted();
   if(request.owner.instanceId!==identity.instanceId||request.owner.profileId!==identity.profileId||request.owner.namespace!=='obsidian-bridge'||request.owner.providerId!=='vault-bindings')throw new Error('业务操作不属于当前实例');
   if(request.actionId==='select-folder-and-bind'){
    if(!options.bindSelectedFolder||request.expectedRevision!==0||Object.keys(request.input).length)throw new Error('文件夹选择动作无效，请刷新后重试');
    return options.bindSelectedFolder(request.operationId,signal);
   }
   const vault=lifecycle.listVaults?.().find(vault=>actionable(vault)&&actionId(vault)===request.actionId);
   if(!vault||vault.binding.revision!==request.expectedRevision)throw new Error('Vault 绑定已改变，请刷新后重试');
   if(!lifecycle.changeVaultBinding)throw new Error('Vault 绑定服务尚未就绪');
   const unbind=vault.state==='bound';
   await lifecycle.changeVaultBinding(vault.vaultId,{operationId:request.operationId,expectedRevision:request.expectedRevision,intent:unbind?'unbind':vault.binding.target?'rebind':'bind',target:unbind?null:{instanceId:identity.instanceId,profileId:identity.profileId},...(!unbind?{candidate:{origin:identity.origin,bootId:identity.bootId}}:{})});
   return{message:unbind?'已解除此 Vault 绑定':'已将此 Vault 绑定到当前实例'};
  },
 });
}
