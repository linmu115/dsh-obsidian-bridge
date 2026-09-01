import { Service, type Context } from "@deepseek-ai/cordis";
import s from "@deepseek-ai/schemastery";

import type { ObsidianBridgeLifecycle } from "./api.ts";
import { BridgeLifecycleRuntime } from "./runtime.ts";

export * from "./api.ts";
export { BridgeLifecycleRuntime } from "./runtime.ts";

export const name = "dsh-obsidian-bridge-lifecycle";
export const inject = [] as const;

export interface Config { bridgeOrigin: string; }
export const Config = s.object({
  bridgeOrigin: s.string().default("http://127.0.0.1:18473"),
});

class BridgeLifecycleService extends Service implements ObsidianBridgeLifecycle {
  private readonly runtime: BridgeLifecycleRuntime;

  constructor(ctx: Context, config: Config) {
    super(ctx, "obsidianBridgeLifecycle");
    this.runtime = new BridgeLifecycleRuntime({
      bridgeOrigin: config.bridgeOrigin,
      clientId: "dsh-host-controller",
      role: "controller",
      onError: (error) => console.warn("[dsh-obsidian-bridge-lifecycle] Bridge unavailable", error),
    });
    this.runtime.start();
    ctx.effect(() => () => { void this.runtime.dispose(); }, "dsh-obsidian-bridge-lifecycle: host");
  }

  get bridgeOrigin(): string { return this.runtime.bridgeOrigin; }
  getSnapshot = () => this.runtime.getSnapshot();
  subscribe = (listener: () => void) => this.runtime.subscribe(listener);
  mountWhenReady: ObsidianBridgeLifecycle["mountWhenReady"] = (name, mount) => this.runtime.mountWhenReady(name, mount);
  drain = (reason: string, deadlineMs?: number) => this.runtime.drain(reason, deadlineMs);
  resume = () => this.runtime.resume();
}

export function apply(ctx: Context, config: Config): void {
  new BridgeLifecycleService(ctx, config);
}
