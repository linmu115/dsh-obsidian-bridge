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
  const [health, setHealth] = useState<BridgeLifecycleHealth | undefined>(() => lifecycle.getHealth?.());
  useEffect(() => {
    const refresh = () => setHealth(lifecycle.getHealth?.());
    refresh();
    return lifecycle.subscribe(refresh);
  }, [lifecycle]);
  if (!health) return <p className="dsh-bridge-health-empty">连接状态尚未准备好。</p>;
  return <section className="dsh-bridge-health-detail" aria-label="Obsidian 连接和同步">
    <h3>Obsidian 连接和同步</h3>
    <p role="status">{labels[health.state] ?? "正在检查连接"}</p>
    <div className="dsh-bridge-health-sync-recovery">
      <button type="button" onClick={() => lifecycle.retry?.()}>检查连接并重试</button>
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

export function registerBridgeHealth(ctx: { inject(keys: readonly string[], callback: (ctx: unknown) => void): unknown }, lifecycle: ObsidianBridgeLifecycle): void {
  ctx.inject(["betterSidebar"], value => {
    const injected = value as { betterSidebar: { registerTab(tab: { id: string; title: string; order: number; single: boolean; icon(size: number): ReactNode; component(): ReactNode }): () => void }; effect(setup: () => () => void, name: string): void };
    const unregister = injected.betterSidebar.registerTab({ id: "dsh-obsidian-bridge-lifecycle:health", title: "Obsidian", order: 66, single: true,
      icon: size => <span style={{ fontSize: size }} aria-hidden="true">◎</span>, component: () => <BridgeHealthPanel lifecycle={lifecycle} /> });
    injected.effect(() => unregister, "obsidian bridge: health panel");
  });
}
