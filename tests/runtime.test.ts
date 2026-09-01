import { describe, expect, it, vi } from "vitest";

import { BRIDGE_LIFECYCLE_PROTOCOL_VERSION } from "dsh-obsidian-bridge-protocol";
import { browserOriginFromWebServer, waitForBrowserOrigin } from "../src/index.ts";
import { BridgeLifecycleRuntime } from "../src/runtime.ts";

const ready = {
  lifecycleProtocolVersion: BRIDGE_LIFECYCLE_PROTOCOL_VERSION,
  instanceId: "vault-a",
  bootId: "550e8400-e29b-41d4-a716-446655440000",
  bridgeVersion: "0.4.0",
  startedAt: 1,
  state: "READY" as const,
  stateChangedAt: 2,
  activeLeaseCount: 0,
  inFlightRequestCount: 0,
};

function response(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });
}

describe("BridgeLifecycleRuntime", () => {
  it("mounts in registration order and unmounts in strict reverse order", async () => {
    const calls: string[] = [];
    let statusCall = 0;
    const fetch = vi.fn(async (input: string | URL | Request, _init?: RequestInit) => {
      const url = String(input);
      if (url.endsWith("/control/v1/status")) {
        statusCall += 1;
        if (statusCall === 1) return response(ready);
        throw new TypeError("offline");
      }
      if (url.endsWith("/control/v1/handshake")) return response({
        ...ready,
        clientId: "test",
        role: "controller",
        token: "x".repeat(32),
        tokenExpiresAt: 100_000,
      });
      if (url.endsWith("/control/v1/leases")) return response({
        leaseId: "550e8400-e29b-41d4-a716-446655440002",
        clientId: "test",
        role: "controller",
        bootId: ready.bootId,
        acquiredAt: 1,
        expiresAt: 100_000,
        browserOrigins: ["http://127.0.0.1:23686"],
        dshViewerUrl: "http://127.0.0.1:23686/?token=current",
      });
      throw new Error(`unexpected request ${url}`);
    });
    const scheduled: Array<() => void> = [];
    const runtime = new BridgeLifecycleRuntime({
      bridgeOrigin: "http://127.0.0.1:18473",
      clientId: "test",
      role: "controller",
      browserOrigins: ["http://127.0.0.1:23686"],
      dshViewerUrl: "http://127.0.0.1:23686/?token=current",
      fetch: fetch as typeof globalThis.fetch,
      now: () => 10,
      setTimer: (callback) => { scheduled.push(callback); return 1 as unknown as ReturnType<typeof setTimeout>; },
      clearTimer: () => undefined,
    });
    runtime.mountWhenReady("a", () => { calls.push("mount-a"); return () => { calls.push("dispose-a"); }; });
    runtime.mountWhenReady("b", () => { calls.push("mount-b"); return () => { calls.push("dispose-b"); }; });
    runtime.start();
    await vi.waitFor(() => expect(calls).toEqual(["mount-a", "mount-b"]));
    scheduled.shift()?.();
    await vi.waitFor(() => expect(calls).toEqual(["mount-a", "mount-b", "dispose-b", "dispose-a"]));
    await runtime.dispose();
    const leaseCall = fetch.mock.calls.find(([input]) => String(input).endsWith("/control/v1/leases"));
    expect(JSON.parse(String(leaseCall?.[1]?.body))).toMatchObject({
      browserOrigins: ["http://127.0.0.1:23686"],
      dshViewerUrl: "http://127.0.0.1:23686/?token=current",
    });
  });

  it("derives the exact OS-assigned browser origin from the initialized Web server", () => {
    expect(browserOriginFromWebServer({ host: "127.0.0.1", port: 23686 })).toBe("http://127.0.0.1:23686");
    expect(browserOriginFromWebServer({ host: "0.0.0.0", port: 23686 })).toBe("http://127.0.0.1:23686");
    expect(() => browserOriginFromWebServer({ host: "127.0.0.1", port: 0 })).toThrow(/listening port/);
  });

  it("waits until a --port 0 Web server publishes its OS-assigned port", async () => {
    const server = { host: "127.0.0.1" as const, port: 0 };
    let timestamp = 0;
    const origin = waitForBrowserOrigin(server, 100, () => timestamp, async (delay) => {
      timestamp += delay;
      server.port = 23686;
    });
    await expect(origin).resolves.toBe("http://127.0.0.1:23686");
  });
});
