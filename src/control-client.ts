import { vaultBindingSnapshotSchema, type ChangeVaultBindingRequest, type VaultBindingSnapshot } from "dsh-obsidian-bridge-protocol/binding";
import { createRequestScope } from "./request-scope.ts";
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
  dshInstanceId?: string;
  vaultId?: string;
  bindingRevision?: number;
  dshBootId?: string;
  profileId?: string;
  dshOrigin?: string;
  fetch?: typeof globalThis.fetch;
  requestOrigin?: string;
  requestTimeoutMs?: number;
}

export interface BridgeControlClient {
  readonly origin: string;
  status(): Promise<BridgeStatus>;
  changeBinding(input: ChangeVaultBindingRequest): Promise<VaultBindingSnapshot>;
  acquireLease(ttlMs: number, browserOrigins: readonly string[], dshViewerUrl?: string): Promise<BridgeLease>;
  renewLease(ttlMs: number, browserOrigins: readonly string[], dshViewerUrl?: string): Promise<BridgeLease>;
  releaseLease(): Promise<void>;
  drain(reason: string, deadlineMs: number): Promise<BridgeStatus>;
  resume(): Promise<BridgeStatus>;
  cancelPending(): void;
  dispose(): Promise<void>;
}

export function normalizeBridgeOrigin(value: string): string {
  const url = new URL(value);
  if (url.protocol !== "http:" || (url.hostname !== "127.0.0.1" && url.hostname !== "localhost")) {
    throw new TypeError("Obsidian Bridge origin must be loopback HTTP");
  }
  if (url.pathname !== "/" || url.search || url.hash || url.username || url.password) {
    throw new TypeError("Obsidian Bridge origin cannot contain credentials, a path, query or fragment");
  }
  return url.origin;
}

export function createBridgeControlClient(options: BridgeControlClientOptions): BridgeControlClient {
  const origin = normalizeBridgeOrigin(options.origin);
  const fetchImpl = options.fetch ?? globalThis.fetch;
  const requests = createRequestScope(fetchImpl, options.requestTimeoutMs);
  let disposed = false;
  let requestGeneration = 0;
  let disposing: Promise<void> | undefined;
  let token: string | undefined;
  let tokenExpiresAt = 0;
  let bootId: string | undefined;
  let lease: BridgeLease | undefined;

  const request = async (path: string, init: RequestInit = {}, authenticated = true): Promise<unknown> => {
    const generation = requestGeneration;
    if (disposed) throw new DOMException("Bridge client disposed", "AbortError");
    const headers = new Headers(init.headers);
    if (init.body !== undefined) headers.set("content-type", "application/json");
    if (options.requestOrigin) headers.set("origin", options.requestOrigin);
    if (authenticated) {
      if (token === undefined || tokenExpiresAt <= Date.now() + 1_000) await handshake();
      if (disposed || generation !== requestGeneration) throw new DOMException("Bridge request cancelled", "AbortError");
      headers.set("authorization", `Bearer ${token}`);
    }
    const response = await requests.request(`${origin}${path}`, { ...init, headers });
    if (disposed || generation !== requestGeneration) throw new DOMException("Bridge request cancelled", "AbortError");
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
        ...(options.dshInstanceId === undefined ? {} : { dshInstanceId: options.dshInstanceId }),
        ...(bootId === undefined ? {} : { expectedBootId: bootId }),
        ...bindingFields(options),
      }),
    }, false);
    const result = bridgeControlHandshakeResponseSchema.parse(raw);
    if ((bootId !== undefined && result.bootId !== bootId) || result.clientId !== options.clientId || result.role !== options.role) {
      throw new Error("Bridge control handshake identity changed");
    }
    if(options.vaultId!==undefined&&(result.vaultId!==options.vaultId||result.bindingRevision!==options.bindingRevision||result.profileId!==options.profileId||result.dshBootId!==options.dshBootId))throw new Error("Bridge binding handshake identity changed");
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
    async changeBinding(input) { return vaultBindingSnapshotSchema.parse(await request("/control/v1/binding", {method:"POST", body:JSON.stringify(input)})); },
    status,
    async acquireLease(ttlMs, browserOrigins, dshViewerUrl) {
      if (bootId === undefined) await status();
      if (bootId === undefined) throw new Error("Bridge boot identity is unavailable");
      const input = acquireBridgeLeaseRequestSchema.parse({
        lifecycleProtocolVersion: BRIDGE_LIFECYCLE_PROTOCOL_VERSION,
        expectedBootId: bootId,
        ttlMs,
        ...bindingFields(options),
        browserOrigins: [...browserOrigins],
        ...(dshViewerUrl === undefined ? {} : { dshViewerUrl }),
      });
      lease = bridgeLeaseSchema.parse(await request("/control/v1/leases", {
        method: "POST",
        body: JSON.stringify(input),
      }));
      return lease;
    },
    async renewLease(ttlMs, browserOrigins, dshViewerUrl) {
      if (lease === undefined) return this.acquireLease(ttlMs, browserOrigins, dshViewerUrl);
      const input = acquireBridgeLeaseRequestSchema.parse({
        lifecycleProtocolVersion: BRIDGE_LIFECYCLE_PROTOCOL_VERSION,
        expectedBootId: lease.bootId,
        ttlMs,
        ...bindingFields(options),
        browserOrigins: [...browserOrigins],
        ...(dshViewerUrl === undefined ? {} : { dshViewerUrl }),
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
    cancelPending() { requestGeneration += 1; requests.abort(); },
    dispose() {
      if (disposing !== undefined) return disposing;
      requestGeneration += 1;
      requests.abort();
      disposing = this.releaseLease().catch(() => undefined).finally(() => { disposed = true; token = undefined; });
      return disposing;
    },
  };
}

export function bindingFields(options: {vaultId?:string;bindingRevision?:number;dshBootId?:string;profileId?:string;dshOrigin?:string}) {
 return options.vaultId === undefined ? {} : {bindingProtocolVersion:1 as const,vaultId:options.vaultId,bindingRevision:options.bindingRevision,dshBootId:options.dshBootId,profileId:options.profileId,dshOrigin:options.dshOrigin};
}
