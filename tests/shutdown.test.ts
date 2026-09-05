import { describe, expect, it, vi } from "vitest";
import { BridgeLifecycleRuntime } from "../src/runtime.ts";
import { createRequestScope } from "../src/request-scope.ts";
const ready = { lifecycleProtocolVersion: 3, instanceId: "test", bootId: "550e8400-e29b-41d4-a716-446655440000", bridgeVersion: "0.6.1", startedAt: 1, state: "READY", stateChangedAt: 2, activeLeaseCount: 0, inFlightRequestCount: 0 };
const response = (body: unknown) => new Response(JSON.stringify(body));
function deferred<T>() { let resolve!: (value: T) => void; const promise = new Promise<T>((done) => { resolve = done; }); return { promise, resolve }; }
function mockFetch(status: () => Promise<Response> = async () => response(ready)) {
  let current = ready;
  return vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
    if (String(url).endsWith("/status")) { const result = await status(); current = await result.clone().json(); return result; }
    if (String(url).endsWith("/handshake")) return response({ ...current, clientId: "test", role: "controller", token: "x".repeat(32), tokenExpiresAt: Date.now() + 100000 });
    if (init?.method === "DELETE") return response({});
    return response({ leaseId: "550e8400-e29b-41d4-a716-446655440002", clientId: "test", role: "controller", bootId: current.bootId, acquiredAt: 1, expiresAt: Date.now() + 100000, browserOrigins: [] });
  });
}
function runtime(fetch: typeof globalThis.fetch) { return new BridgeLifecycleRuntime({ bridgeOrigin: "http://127.0.0.1:18474", clientId: "test", role: "controller", fetch, requestTimeoutMs: 50 }); }

describe("shutdown races", () => {
  it("finishes shutdown even if fetch ignores cancellation; a late status cannot reacquire or mount", async () => {
    const status = deferred<Response>(); const fetch = mockFetch(() => status.promise); const lifecycle = runtime(fetch);
    const mount = vi.fn(); lifecycle.mountWhenReady("fixture", mount); lifecycle.start();
    const closing = lifecycle.dispose(); expect(lifecycle.dispose()).toBe(closing);
    await closing; status.resolve(response(ready)); await Promise.resolve(); await Promise.resolve();
    expect(mount).not.toHaveBeenCalled(); expect(fetch).toHaveBeenCalledTimes(1); expect(lifecycle.getSnapshot().state).toBe("OFFLINE");
  });
  it("awaits and cleans a late mount once, without mounting later attachments", async () => {
    const mounted = deferred<() => void>(); const cleanup = vi.fn(); const second = vi.fn(); const lifecycle = runtime(mockFetch());
    const mount = vi.fn(() => mounted.promise); lifecycle.mountWhenReady("first", mount); lifecycle.mountWhenReady("second", second); lifecycle.start();
    await vi.waitFor(() => expect(mount).toHaveBeenCalledOnce());
    const closing = lifecycle.dispose(); mounted.resolve(cleanup); await closing;
    expect(cleanup).toHaveBeenCalledOnce(); expect(second).not.toHaveBeenCalled();
  });
  it("cleans a removed attachment even when its mount is still pending", async () => {
    const mounted = deferred<() => void>(); const cleanup = vi.fn(); const lifecycle = runtime(mockFetch());
    const mount = vi.fn(() => mounted.promise); const remove = lifecycle.mountWhenReady("fixture", mount); lifecycle.start();
    await vi.waitFor(() => expect(mount).toHaveBeenCalledOnce()); remove(); mounted.resolve(cleanup);
    await vi.waitFor(() => expect(cleanup).toHaveBeenCalledOnce()); await lifecycle.dispose(); expect(cleanup).toHaveBeenCalledOnce();
  });
  it("unmounts the prior boot before remounting attachments on a new boot", async () => {
    let bootId = ready.bootId; const scheduled: Array<() => void> = []; const events: string[] = [];
    const lifecycle = new BridgeLifecycleRuntime({ bridgeOrigin: "http://localhost:18474", clientId: "test", role: "controller", fetch: mockFetch(async () => response({ ...ready, bootId })), setTimer: (callback) => { scheduled.push(callback); return 1 as any; }, clearTimer() {} });
    lifecycle.mountWhenReady("fixture", (status) => { events.push(`mount:${status.bootId}`); return () => { events.push("unmount"); }; }); lifecycle.start();
    await vi.waitFor(() => expect(events.length).toBe(1)); bootId = "550e8400-e29b-41d4-a716-446655440003"; scheduled.shift()?.();
    await vi.waitFor(() => expect(events).toEqual([`mount:${ready.bootId}`, "unmount", `mount:${bootId}`])); await lifecycle.dispose();
  });
  it("continues reverse cleanup if a disposer fails", async () => {
    const lifecycle = runtime(mockFetch()); const cleanup = vi.fn(); const mount = vi.fn(() => () => { throw Error("cleanup failed"); });
    lifecycle.mountWhenReady("first", () => cleanup); lifecycle.mountWhenReady("last", mount); lifecycle.start(); await vi.waitFor(() => expect(mount).toHaveBeenCalledOnce());
    await lifecycle.dispose(); expect(cleanup).toHaveBeenCalledOnce();
  });
});
describe("bounded requests", () => {
  it("bounds response body reads, not only response headers", async () => {
    const request = createRequestScope(async () => new Response(new ReadableStream({ start() {} })), 10);
    await expect(request.request("http://127.0.0.1:18474")).rejects.toMatchObject({ name: "TimeoutError" });
  });
  it("does not start requests whose signal is already cancelled", async () => {
    const fetch = vi.fn(); const scope = createRequestScope(fetch); const abort = new AbortController(); abort.abort();
    await expect(scope.request("http://127.0.0.1:18474", { signal: abort.signal })).rejects.toMatchObject({ name: "AbortError" }); expect(fetch).not.toHaveBeenCalled();
  });
});
