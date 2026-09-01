import { Service, type Context } from "@deepseek-ai/cordis";
import s from "@deepseek-ai/schemastery";

import type { ObsidianBridgeLifecycle } from "./api.ts";
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
): Promise<string> {
  const deadline = now() + timeoutMs;
  while (true) {
    try {
      return browserOriginFromWebServer(server);
    } catch (error) {
      if (now() >= deadline) throw error;
      await wait(25);
    }
  }
}

export interface Config { bridgeOrigin: string; }
export const Config = s.object({
  bridgeOrigin: s.string().default("http://127.0.0.1:18473"),
});

class BridgeLifecycleService extends Service implements ObsidianBridgeLifecycle {
  private readonly runtime: BridgeLifecycleRuntime;

  constructor(ctx: Context, config: Config) {
    super(ctx, "obsidianBridgeLifecycle");
    const browserOrigin = browserOriginFromWebServer((ctx as Context & { webServer: WebServerBinding }).webServer);
    const dshViewerUrl = (ctx as Context & { connection: ConnectionBinding }).connection.authenticatedUrl(browserOrigin);
    this.runtime = new BridgeLifecycleRuntime({
      bridgeOrigin: config.bridgeOrigin,
      clientId: "dsh-host-controller",
      role: "controller",
      browserOrigins: [browserOrigin],
      dshViewerUrl,
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
  ctx.inject(inject, async (injected) => {
    const server = (injected as Context & { webServer: WebServerBinding }).webServer;
    await waitForBrowserOrigin(server);
    new BridgeLifecycleService(injected, config);
  });
}
