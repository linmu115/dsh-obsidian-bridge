import { registerBridgeHealth } from "./health-panel.tsx";
import { bridgeSurfaceIdFromUrl } from "./transport.ts";
import { handoffReference } from "./reference/handoff.ts";
import type { AnnotationCoreClient } from "dsh-annotation-core/client-api";
import { apply as mountReferences } from "./reference/client.ts";
import { mountBridgeConfig } from "./client-config.ts";
import { Service, type Context } from "@deepseek-ai/cordis";

import type { ObsidianBridgeLifecycle, BridgeRuntimeIdentity } from "./api.ts";
import { BridgeLifecycleRuntime } from "./runtime.ts";

export const inject = ["remote"] as const;

class BridgeLifecycleClientService extends Service implements ObsidianBridgeLifecycle {
  private readonly runtime: BridgeLifecycleRuntime;

  constructor(private readonly owner: Context, origin: string, readonly runtimeIdentity: BridgeRuntimeIdentity = { profileId: "web" }) {
    super(owner, "obsidianBridgeLifecycle");
    const ctx = owner;
    const requestOrigin = typeof location === "undefined" ? undefined : location.origin;
    this.runtime = new BridgeLifecycleRuntime({
      bridgeOrigin: origin,
      clientId: `dsh-web-surface-${crypto.randomUUID()}`,
      role: "surface",
      ...runtimeIdentity,
      ...(typeof location === "undefined" || !bridgeSurfaceIdFromUrl(location.href) ? {} : { surfaceId: bridgeSurfaceIdFromUrl(location.href)! }),
      ...(requestOrigin === undefined ? {} : { requestOrigin }),
      onError: (error) => console.warn("[dsh-obsidian-bridge-lifecycle] Bridge unavailable", error),
    });
    ctx.inject(["sessions", "annotationCore"], injected => mountReferences(injected as Parameters<typeof mountReferences>[0]));
    registerBridgeHealth(ctx as unknown as Parameters<typeof registerBridgeHealth>[0], this);
    this.runtime.start();
    ctx.effect(() => () => this.runtime.dispose(), "dsh-obsidian-bridge-lifecycle: client");
  }

  handoffReference: NonNullable<ObsidianBridgeLifecycle["handoffReference"]> = input => {
    const sessions = this.owner.get("sessions" as never) as { scope?(id: string): { get(name: string): unknown } | undefined } | undefined;
    const core = (sessions?.scope?.(input.sessionId)?.get("annotationCore") ?? this.owner.get("annotationCore" as never)) as AnnotationCoreClient | undefined;
    return handoffReference(core, input);
  };
  get capabilities() { return this.runtime.capabilities; }
  get transport() { return this.runtime.transport; }
  registerActionHandler: NonNullable<ObsidianBridgeLifecycle["registerActionHandler"]> = (name, handler) => this.runtime.registerActionHandler(name, handler);
  retryActions = () => this.runtime.retryActions();
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
    new BridgeLifecycleClientService(ctx, config.origin, config.runtimeIdentity);
    ctx.effect(() => config.dispose, "dsh-obsidian-bridge-lifecycle: client remote");
  } catch (error) {
    await config.dispose();
    throw error;
  }
}
