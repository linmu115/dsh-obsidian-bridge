import { Service, type Context } from "@deepseek-ai/cordis";

import type { ObsidianBridgeLifecycle } from "./api.ts";
import { BridgeLifecycleRuntime } from "./runtime.ts";

export const inject = [] as const;

class BridgeLifecycleClientService extends Service implements ObsidianBridgeLifecycle {
  private readonly runtime: BridgeLifecycleRuntime;

  constructor(ctx: Context) {
    super(ctx, "obsidianBridgeLifecycle");
    const requestOrigin = typeof location === "undefined" ? undefined : location.origin;
    this.runtime = new BridgeLifecycleRuntime({
      bridgeOrigin: "http://127.0.0.1:18473",
      clientId: `dsh-web-surface-${crypto.randomUUID()}`,
      role: "surface",
      ...(requestOrigin === undefined ? {} : { requestOrigin }),
      onError: (error) => console.warn("[dsh-obsidian-bridge-lifecycle] Bridge unavailable", error),
    });
    this.runtime.start();
    ctx.effect(() => () => { void this.runtime.dispose(); }, "dsh-obsidian-bridge-lifecycle: client");
  }

  get bridgeOrigin(): string { return this.runtime.bridgeOrigin; }
  getSnapshot = () => this.runtime.getSnapshot();
  subscribe = (listener: () => void) => this.runtime.subscribe(listener);
  mountWhenReady: ObsidianBridgeLifecycle["mountWhenReady"] = (name, mount) => this.runtime.mountWhenReady(name, mount);
  drain = (reason: string, deadlineMs?: number) => this.runtime.drain(reason, deadlineMs);
  resume = () => this.runtime.resume();
}

export function apply(ctx: Context): void {
  new BridgeLifecycleClientService(ctx);
}
