import { mountBridgeConfig } from "./client-config.ts";
import { Service, type Context } from "@deepseek-ai/cordis";

import type { ObsidianBridgeLifecycle } from "./api.ts";
import { BridgeLifecycleRuntime } from "./runtime.ts";

export const inject = ["remote"] as const;

class BridgeLifecycleClientService extends Service implements ObsidianBridgeLifecycle {
  private readonly runtime: BridgeLifecycleRuntime;

  constructor(ctx: Context, origin: string) {
    super(ctx, "obsidianBridgeLifecycle");
    const requestOrigin = typeof location === "undefined" ? undefined : location.origin;
    this.runtime = new BridgeLifecycleRuntime({
      bridgeOrigin: origin,
      clientId: `dsh-web-surface-${crypto.randomUUID()}`,
      role: "surface",
      ...(requestOrigin === undefined ? {} : { requestOrigin }),
      onError: (error) => console.warn("[dsh-obsidian-bridge-lifecycle] Bridge unavailable", error),
    });
    this.runtime.start();
    ctx.effect(() => () => this.runtime.dispose(), "dsh-obsidian-bridge-lifecycle: client");
  }

  getHealth = () => this.runtime.getHealth();
  registerHealthSource: NonNullable<ObsidianBridgeLifecycle["registerHealthSource"]> = (name, source) => this.runtime.registerHealthSource(name, source);
  retry = (name?: string) => this.runtime.retry(name);
  get bridgeOrigin(): string { return this.runtime.bridgeOrigin; }
  getSnapshot = () => this.runtime.getSnapshot();
  subscribe = (listener: () => void) => this.runtime.subscribe(listener);
  mountWhenReady: ObsidianBridgeLifecycle["mountWhenReady"] = (name, mount) => this.runtime.mountWhenReady(name, mount);
  drain = (reason: string, deadlineMs?: number) => this.runtime.drain(reason, deadlineMs);
  resume = () => this.runtime.resume();
}

export async function apply(ctx: Context): Promise<void> {
  const abort = new AbortController();
  ctx.effect(() => () => abort.abort(), "dsh-obsidian-bridge-lifecycle: client startup");
  const config = await mountBridgeConfig(ctx);
  try {
    abort.signal.throwIfAborted();
    new BridgeLifecycleClientService(ctx, config.origin);
    ctx.effect(() => config.dispose, "dsh-obsidian-bridge-lifecycle: client remote");
  } catch (error) {
    await config.dispose();
    throw error;
  }
}
