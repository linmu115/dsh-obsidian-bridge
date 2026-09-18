import { apply as mountReferences } from "./reference/host.ts";
import { TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
import { type Context } from "@deepseek-ai/cordis";
import s from "@deepseek-ai/schemastery";

import type { ObsidianBridgeLifecycle, BridgeRuntimeIdentity } from "./api.ts";
import { BridgeLifecycleRuntime } from "./runtime.ts";

export * from "./api.ts";
export { BridgeLifecycleRuntime } from "./runtime.ts";

export const name = "dsh-obsidian-bridge-lifecycle";
export const inject = ["webServer", "connection"] as const;

interface WebServerBinding {
  readonly host: "127.0.0.1" | "0.0.0.0";
  readonly port: number;
}

interface ConnectionBinding {
  authenticatedUrl(baseUrl: string): string;
}

export function browserOriginFromWebServer(server: WebServerBinding): string {
  if (!Number.isInteger(server.port) || server.port < 1 || server.port > 65_535) {
    throw new Error("DSH Web server has not published its listening port");
  }
  const browserHost = server.host === "0.0.0.0" ? "127.0.0.1" : server.host;
  return `http://${browserHost}:${server.port}`;
}

export async function waitForBrowserOrigin(
  server: WebServerBinding,
  timeoutMs = 10_000,
  now: () => number = Date.now,
  wait: (delayMs: number) => Promise<void> = (delayMs) => new Promise((resolve) => setTimeout(resolve, delayMs)),
  signal?: AbortSignal,
): Promise<string> {
  const deadline = now() + timeoutMs;
  while (true) {
    signal?.throwIfAborted();
    try {
      return browserOriginFromWebServer(server);
    } catch (error) {
      if (now() >= deadline) throw error;
      await wait(25);
    }
  }
}

export interface Config { bridgeOrigin: string; dshInstanceId?: string; profileId?: string; }
export const Config = s.object({
  dshInstanceId: s.string().default(""),
  profileId: s.string().default("web"),
  bridgeOrigin: s.string().default("http://127.0.0.1:18473"),
});

export class BridgeLifecycleService extends TypertRemoteService implements ObsidianBridgeLifecycle {
  private readonly runtime: BridgeLifecycleRuntime;
  readonly runtimeIdentity: BridgeRuntimeIdentity;

  constructor(ctx: Context, config: Config) {
    super(ctx, "obsidianBridgeLifecycle");
    this.runtimeIdentity = Object.freeze({ profileId: config.profileId || "web", ...(config.dshInstanceId ? { dshInstanceId: config.dshInstanceId } : {}) });
    const browserOrigin = browserOriginFromWebServer((ctx as Context & { webServer: WebServerBinding }).webServer);
    const dshViewerUrl = (ctx as Context & { connection: ConnectionBinding }).connection.authenticatedUrl(browserOrigin);
    this.runtime = new BridgeLifecycleRuntime({
      bridgeOrigin: config.bridgeOrigin,
      clientId: `dsh-host-controller:${encodeURIComponent(config.dshInstanceId || browserOrigin)}`,
      role: "controller",
      profileId: this.runtimeIdentity.profileId,
      ...(config.dshInstanceId ? { dshInstanceId: config.dshInstanceId } : {}),
      browserOrigins: [browserOrigin],
      dshViewerUrl,
      onError: (error) => console.warn("[dsh-obsidian-bridge-lifecycle] Bridge unavailable", error),
    });
    ctx.inject(["annotationCoreHost"], injected => mountReferences(injected as Parameters<typeof mountReferences>[0], { profileId: this.runtimeIdentity.profileId }));
    this.runtime.start();
    ctx.effect(() => () => this.runtime.dispose(), "dsh-obsidian-bridge-lifecycle: host");
  }

  getBridgeConfig(): { origin: string; runtimeIdentity: BridgeRuntimeIdentity } { return { origin: this.runtime.bridgeOrigin, runtimeIdentity: this.runtimeIdentity }; }
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

export function apply(ctx: Context, config: Config): void {
  ctx.inject(inject, async (injected) => {
    const abort = new AbortController();
    injected.effect(() => () => abort.abort(), "dsh-obsidian-bridge-lifecycle: host startup");
    const server = (injected as Context & { webServer: WebServerBinding }).webServer;
    await waitForBrowserOrigin(server, 10_000, Date.now, undefined, abort.signal);
    abort.signal.throwIfAborted();
    new BridgeLifecycleService(injected, config);
  });
}
