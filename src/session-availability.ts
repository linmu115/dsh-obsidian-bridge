export type SessionAvailabilityStatus="available"|"not-synced"|"offline"|"mapping-pending"|"deleted"|"not-found";
export function assertSessionAvailable(result:{status:SessionAvailabilityStatus}):void {
 if(result.status==="available")return;
 const messages:Record<Exclude<SessionAvailabilityStatus,"available">,string>={"not-synced":"当前绑定实例未同步此工作区",offline:"当前绑定实例离线", "mapping-pending":"会话映射尚未就绪，请稍后重试",deleted:"此会话已删除","not-found":"当前实例中未找到此会话"};
 throw Object.assign(new Error(messages[result.status]??"会话可用状态未知"),{code:result.status});
}
export async function assertMaintenanceSessionAvailable(logicalSessionId:string|undefined,fetchImpl:typeof fetch=fetch):Promise<void>{
 if(!logicalSessionId)return;
 const response=await fetchImpl("/maintenance-knowledge/api/session-availability",{method:"POST",credentials:"same-origin",headers:{"content-type":"application/json"},body:JSON.stringify({logicalSessionId}),signal:AbortSignal.timeout(5000)});
 if(response.status===404)return; // An absent optional Maintenance provider does not disable the Bridge.
 if(!response.ok)throw new Error(`无法核验当前实例会话状态 (${response.status})`);
 const result=await response.json() as {logicalSessionId?:unknown;status:SessionAvailabilityStatus};if(result.logicalSessionId!==logicalSessionId)throw new Error("Session availability identity mismatch");assertSessionAvailable(result);
}
