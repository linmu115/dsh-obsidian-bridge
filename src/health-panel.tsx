import type { VaultConnectionSnapshot } from "./api.ts";
import type { BridgeLifecycleHealth, ObsidianBridgeLifecycle } from "./api.ts";
import { useEffect, useState, type ReactNode } from "react";

const labels: Record<string, string> = {
  READY: "已连接", DEGRADED: "已连接，部分操作需要处理", OFFLINE: "等待连接",
  STARTING: "正在连接", DRAINING: "正在关闭", STOPPED: "已停止", FAILED: "连接未成功",
  receiving: "等待接收引用", "waiting-for-session": "等待打开会话", retrying: "等待重试",
  stopped: "已暂停", closed: "已关闭", conflict: "需要选择保留的内容", error: "需要处理",
  pending: "等待同步", synced: "已同步", "local-only": "已保存到 DSH，等待连接",
};
const components: Record<string, string> = { actions: "动作接收", references: "引用接收", "reference-deletions": "引用删除", stickers: "贴纸同步" };

export function BridgeHealthPanel({ lifecycle }: { lifecycle: ObsidianBridgeLifecycle }): ReactNode {
  const [busy,setBusy]=useState<string>();
  const [error,setError]=useState("");
  const change=async(vault:VaultConnectionSnapshot,unbind=false)=>{
    const identity=lifecycle.getInstanceIdentity?.();if(!identity||!lifecycle.changeVaultBinding)return;setBusy(vault.vaultId);setError("");
    try{await lifecycle.changeVaultBinding(vault.vaultId,{operationId:crypto.randomUUID(),expectedRevision:vault.binding.revision,intent:unbind?"unbind":vault.binding.target?"rebind":"bind",target:unbind?null:{instanceId:identity.instanceId,profileId:identity.profileId},...(!unbind?{candidate:{origin:identity.origin,bootId:identity.bootId}}:{})});}catch(error){setError(error instanceof Error?error.message:String(error));}finally{setBusy(undefined);}
  };
  const [health, setHealth] = useState<BridgeLifecycleHealth | undefined>(() => lifecycle.getHealth?.());
  useEffect(() => {
    const refresh = () => setHealth(lifecycle.getHealth?.());
    refresh();
    return lifecycle.subscribe(refresh);
  }, [lifecycle]);
  if (!health) return <p className="dsh-bridge-health-empty">连接状态尚未准备好。</p>;
  return <section className="dsh-bridge-health-detail" aria-label="Obsidian 连接和同步">
    <h3>Obsidian 连接和同步</h3>
    {error&&<p role="alert">{error}</p>}
    {health.vaults?.map(vault=><article key={vault.vaultId} style={{padding:"12px 0",borderBottom:"1px solid currentColor"}}>
      <h4>{vault.displayName}</h4><p>{vault.state==="bound"?`已绑定当前实例 · ${labels[vault.connectionState??"OFFLINE"]??"等待连接"}`:vault.state==="available"?"尚未绑定":vault.state==="foreign"?`已绑定 ${vault.binding.target?.instanceId}`:vault.state==="conflict"?"发现身份冲突，暂不可连接":"Vault 已离线"}</p>
      <small>{vault.vaultId} · {vault.origin}</small>
      {vault.state==="available"||vault.state==="foreign"?<button disabled={busy!==undefined} onClick={()=>void change(vault)}>{vault.state==="foreign"?"改绑到当前实例":"绑定当前实例"}</button>:vault.state==="bound"?<button disabled={busy!==undefined} onClick={()=>void change(vault,true)}>解除此绑定</button>:null}
    </article>)}
    <p role="status">{labels[health.state] ?? "正在检查连接"}</p>
    <div className="dsh-bridge-health-sync-recovery">
      <button type="button" onClick={() => { lifecycle.retry?.(); void lifecycle.refreshVaults?.(); }}>检查连接并重试</button>
    </div>
    {Object.entries(health.components).map(([name, status]) => <div key={name}>
      <h4>{components[name] ?? "同步操作"}</h4>
      <p>{labels[status.state] ?? "正在处理"}{status.pendingCount ? `（${status.pendingCount} 项待处理）` : ""}</p>
      {status.state === "conflict"
        ? <p>打开相应贴纸，选择使用 DSH 或 Obsidian 的贴纸内容。</p>
        : status.pendingCount || status.lastError ? <div className="dsh-bridge-health-sync-recovery">
          <button type="button" onClick={() => lifecycle.retry?.(name)}>重试{components[name] ?? "同步"}</button>
        </div> : null}
      {status.lastError && <details><summary>查看详情</summary><p>{status.lastError}</p></details>}
    </div>)}
    <details><summary>连接详情</summary><p>{health.bridgeOrigin}</p></details>
  </section>;
}
