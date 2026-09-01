import {
  BRIDGE_LIFECYCLE_PROTOCOL_VERSION,
  acquireBridgeLeaseRequestSchema,
  bridgeControlHandshakeResponseSchema,
  bridgeLeaseSchema,
  bridgeStatusSchema,
  drainBridgeRequestSchema,
  resumeBridgeRequestSchema,
  type BridgeClientRole,
  type BridgeLease,
  type BridgeStatus,
} from "dsh-obsidian-bridge-protocol";

export interface BridgeControlClientOptions {
  origin: string;
  clientId: string;
  role: BridgeClientRole;
  fetch?: typeof globalThis.fetch;
  requestOrigin?: string;
}

export interface BridgeControlClient {
  readonly origin: string;
  status(): Promise<BridgeStatus>;
  acquireLease(ttlMs: number, browserOrigins: readonly string[]): Promise<BridgeLease>;
  renewLease(ttlMs: number, browserOrigins: readonly string[]): Promise<BridgeLease>;
  releaseLease(): Promise<void>;
  drain(reason: string, deadlineMs: number): Promise<BridgeStatus>;
  resume(): Promise<BridgeStatus>;
  dispose(): Promise<void>;
}

export function normalizeBridgeOrigin(value: string): string {
  const url = new URL(value);
  if (url.protocol !== "http:" || (url.hostname !== "127.0.0.1" && url.hostname !== "localhost")) {
    throw new TypeError("Obsidian Bridge origin must be loopback HTTP");
  }
  url.pathname = "";
  url.search = "";
  url.hash = "";
  return url.origin;
}

export function createBridgeControlClient(options: BridgeControlClientOptions): BridgeControlClient {
  const origin = normalizeBridgeOrigin(options.origin);
  const fetchImpl = options.fetch ?? globalThis.fetch;
  let token: string | undefined;
  let tokenExpiresAt = 0;
  let bootId: string | undefined;
  let lease: BridgeLease | undefined;

  const request = async (path: string, init: RequestInit = {}, authenticated = true): Promise<unknown> => {
    const headers = new Headers(init.headers);
    if (init.body !== undefined) headers.set("content-type", "application/json");
    if (options.requestOrigin) headers.set("origin", options.requestOrigin);
    if (authenticated) {
      if (token === undefined || tokenExpiresAt <= Date.now() + 1_000) await handshake();
      headers.set("authorization", `Bearer ${token}`);
    }
    const response = await fetchImpl(`${origin}${path}`, { ...init, headers });
    const body = await response.json().catch(() => ({ error: response.statusText })) as unknown;
    if (!response.ok) {
      const message = typeof body === "object" && body !== null && "error" in body
        ? String((body as { error: unknown }).error)
        : `Bridge control request failed (${response.status})`;
      throw new Error(message);
    }
    return body;
  };

  const handshake = async (): Promise<void> => {
    const raw = await request("/control/v1/handshake", {
      method: "POST",
      body: JSON.stringify({
        lifecycleProtocolVersion: BRIDGE_LIFECYCLE_PROTOCOL_VERSION,
        clientId: options.clientId,
        role: options.role,
        ...(bootId === undefined ? {} : { expectedBootId: bootId }),
      }),
    }, false);
    const result = bridgeControlHandshakeResponseSchema.parse(raw);
    token = result.token;
    tokenExpiresAt = result.tokenExpiresAt;
    bootId = result.bootId;
  };

  const status = async (): Promise<BridgeStatus> => {
    const result = bridgeStatusSchema.parse(await request("/control/v1/status", {}, false));
    if (bootId !== undefined && result.bootId !== bootId) {
      token = undefined;
      lease = undefined;
    }
    bootId = result.bootId;
    return result;
  };

  return {
    origin,
    status,
    async acquireLease(ttlMs, browserOrigins) {
      if (bootId === undefined) await status();
      if (bootId === undefined) throw new Error("Bridge boot identity is unavailable");
      const input = acquireBridgeLeaseRequestSchema.parse({
        lifecycleProtocolVersion: BRIDGE_LIFECYCLE_PROTOCOL_VERSION,
        expectedBootId: bootId,
        ttlMs,
        browserOrigins: [...browserOrigins],
      });
      lease = bridgeLeaseSchema.parse(await request("/control/v1/leases", {
        method: "POST",
        body: JSON.stringify(input),
      }));
      return lease;
    },
    async renewLease(ttlMs, browserOrigins) {
      if (lease === undefined) return this.acquireLease(ttlMs, browserOrigins);
      const input = acquireBridgeLeaseRequestSchema.parse({
        lifecycleProtocolVersion: BRIDGE_LIFECYCLE_PROTOCOL_VERSION,
        expectedBootId: lease.bootId,
        ttlMs,
        browserOrigins: [...browserOrigins],
      });
      lease = bridgeLeaseSchema.parse(await request(`/control/v1/leases/${encodeURIComponent(lease.leaseId)}`, {
        method: "PUT",
        body: JSON.stringify({ ...input, leaseId: lease.leaseId }),
      }));
      return lease;
    },
    async releaseLease() {
      if (lease === undefined) return;
      const releasing = lease;
      lease = undefined;
      await request(`/control/v1/leases/${encodeURIComponent(releasing.leaseId)}`, { method: "DELETE" });
    },
    async drain(reason, deadlineMs) {
      const current = await status();
      const input = drainBridgeRequestSchema.parse({
        lifecycleProtocolVersion: BRIDGE_LIFECYCLE_PROTOCOL_VERSION,
        requestId: crypto.randomUUID(),
        expectedBootId: current.bootId,
        deadlineMs,
        reason,
      });
      return bridgeStatusSchema.parse(await request("/control/v1/drain", {
        method: "POST",
        body: JSON.stringify(input),
      }));
    },
    async resume() {
      const current = await status();
      const input = resumeBridgeRequestSchema.parse({
        lifecycleProtocolVersion: BRIDGE_LIFECYCLE_PROTOCOL_VERSION,
        requestId: crypto.randomUUID(),
        expectedBootId: current.bootId,
      });
      return bridgeStatusSchema.parse(await request("/control/v1/resume", {
        method: "POST",
        body: JSON.stringify(input),
      }));
    },
    async dispose() {
      await this.releaseLease().catch(() => undefined);
      token = undefined;
    },
  };
}
