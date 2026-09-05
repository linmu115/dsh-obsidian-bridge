import {
  BRIDGE_LIFECYCLE_PROTOCOL_VERSION,
  acceptsBridgeWork,
  type BridgeIdentity,
  type BridgeStatus,
  type ObservedBridgeStatus,
} from "dsh-obsidian-bridge-protocol";

import type { BridgeHealthSource, BridgeLifecycleHealth, BridgeAttachmentDisposer, BridgeAttachmentMount, ObsidianBridgeLifecycle, ReadyBridgeStatus } from "./api.ts";
import { createBridgeControlClient, type BridgeControlClient } from "./control-client.ts";

interface Attachment {
  name: string;
  mount: BridgeAttachmentMount;
  disposer: BridgeAttachmentDisposer | undefined;
  bootId?: string;
}

export interface LifecycleRuntimeOptions {
  bridgeOrigin: string;
  clientId: string;
  role: "controller" | "surface";
  browserOrigins?: readonly string[];
  dshViewerUrl?: string;
  requestOrigin?: string;
  pollIntervalMs?: number;
  requestTimeoutMs?: number;
  leaseTtlMs?: number;
  fetch?: typeof globalThis.fetch;
  now?: () => number;
  setTimer?: (callback: () => void, delay: number) => ReturnType<typeof setTimeout>;
  clearTimer?: (timer: ReturnType<typeof setTimeout>) => void;
  onError?: (error: unknown) => void;
}

export class BridgeLifecycleRuntime implements ObsidianBridgeLifecycle {
  readonly bridgeOrigin: string;
  private readonly control: BridgeControlClient;
  private readonly attachments: Attachment[] = [];
  private readonly healthSources = new Map<string, BridgeHealthSource>();
  private readonly healthSubscriptions = new Map<string, () => void>();
  private readonly listeners = new Set<() => void>();
  private readonly pollIntervalMs: number;
  private readonly leaseTtlMs: number;
  private readonly browserOrigins: readonly string[];
  private readonly dshViewerUrl: string | undefined;
  private readonly now: () => number;
  private readonly setTimer: NonNullable<LifecycleRuntimeOptions["setTimer"]>;
  private readonly clearTimer: NonNullable<LifecycleRuntimeOptions["clearTimer"]>;
  private readonly onError: (error: unknown) => void;
  private timer?: ReturnType<typeof setTimeout>;
  private stopped = false;
  private started = false;
  private generation = 0;
  private inFlight?: Promise<void>;
  private shutdown?: Promise<void>;
  private leaseExpiresAt = 0;
  private transition: Promise<void> = Promise.resolve();
  private lastKnownIdentity?: BridgeIdentity;
  private snapshot: ObservedBridgeStatus;

  constructor(options: LifecycleRuntimeOptions) {
    this.control = createBridgeControlClient({
      origin: options.bridgeOrigin,
      clientId: options.clientId,
      role: options.role,
      ...(options.requestTimeoutMs === undefined ? {} : { requestTimeoutMs: options.requestTimeoutMs }),
      ...(options.fetch === undefined ? {} : { fetch: options.fetch }),
      ...(options.requestOrigin === undefined ? {} : { requestOrigin: options.requestOrigin }),
    });
    this.bridgeOrigin = this.control.origin;
    this.pollIntervalMs = options.pollIntervalMs ?? 1_000;
    this.leaseTtlMs = options.leaseTtlMs ?? 15_000;
    this.browserOrigins = Object.freeze([...(options.browserOrigins ?? [])]);
    this.dshViewerUrl = options.dshViewerUrl;
    this.now = options.now ?? Date.now;
    this.setTimer = options.setTimer ?? setTimeout;
    this.clearTimer = options.clearTimer ?? clearTimeout;
    this.onError = options.onError ?? (() => undefined);
    this.snapshot = {
      lifecycleProtocolVersion: BRIDGE_LIFECYCLE_PROTOCOL_VERSION,
      state: "OFFLINE",
      stateChangedAt: this.now(),
      reason: "Bridge status has not been observed yet",
    };
  }

  getSnapshot(): ObservedBridgeStatus { return this.snapshot; }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  start(): void {
    if (this.started || this.stopped) return;
    this.started = true;
    this.inFlight = this.poll();
  }

  getHealth(): BridgeLifecycleHealth {
    return { state: this.snapshot.state, bridgeOrigin: this.bridgeOrigin,
      components: Object.fromEntries([...this.healthSources].map(([name, source]) => [name, source.getHealth()])) };
  }

  registerHealthSource(name: string, source: BridgeHealthSource): () => void {
    if (this.stopped) return () => undefined;
    this.healthSubscriptions.get(name)?.();
    this.healthSources.set(name, source);
    const unsubscribe = source.subscribe?.(() => { for (const listener of [...this.listeners]) listener(); });
    if (unsubscribe !== undefined) this.healthSubscriptions.set(name, unsubscribe);
    return () => {
      if (this.healthSources.get(name) !== source) return;
      unsubscribe?.(); this.healthSources.delete(name); this.healthSubscriptions.delete(name);
    };
  }

  retry(name?: string): void {
    if (this.stopped) return;
    if (name !== undefined) { if (!this.stopped) this.healthSources.get(name)?.retry?.(); return; }
    for (const source of this.healthSources.values()) source.retry?.();
    if (this.stopped) return;
    if (this.timer !== undefined) this.clearTimer(this.timer);
    this.inFlight = (this.inFlight ?? Promise.resolve()).then(() => {
      if (this.timer !== undefined) this.clearTimer(this.timer);
      return this.poll();
    });
  }

  mountWhenReady(name: string, mount: BridgeAttachmentMount): () => void {
    if (this.stopped) return () => undefined;
    if (this.attachments.some((attachment) => attachment.name === name)) {
      throw new Error(`Bridge attachment ${JSON.stringify(name)} is already registered`);
    }
    const attachment: Attachment = { name, mount, disposer: undefined };
    this.attachments.push(attachment);
    this.queueReconcile();
    return () => {
      const index = this.attachments.indexOf(attachment);
      if (index >= 0) this.attachments.splice(index, 1);
      this.transition = this.transition.then(async () => {
        const disposer = attachment.disposer;
        attachment.disposer = undefined;
        await disposer?.();
      }).catch(this.onError);
    };
  }

  async drain(reason: string, deadlineMs = 10_000): Promise<void> {
    if (this.stopped) return;
    const generation = this.generation;
    const status = await this.control.drain(reason, deadlineMs);
    if (!this.stopped && generation === this.generation) await this.observe(status);
  }

  async resume(): Promise<void> {
    if (this.stopped) return;
    const generation = this.generation;
    const status = await this.control.resume();
    if (!this.stopped && generation === this.generation) await this.observe(status);
  }

  dispose(): Promise<void> {
    if (this.shutdown !== undefined) return this.shutdown;
    this.stopped = true;
    this.generation += 1;
    if (this.timer !== undefined) this.clearTimer(this.timer);
    this.control.cancelPending();
    this.snapshot = {
      lifecycleProtocolVersion: BRIDGE_LIFECYCLE_PROTOCOL_VERSION, state: "OFFLINE",
      stateChangedAt: this.now(), reason: "Bridge lifecycle stopped",
    };
    this.shutdown = (async () => {
      await Promise.resolve();
      for (const listener of [...this.listeners]) listener();
      await this.inFlight;
      await this.unmountAll();
      await this.control.dispose();
      this.listeners.clear();
      for (const unsubscribe of this.healthSubscriptions.values()) unsubscribe();
      this.healthSubscriptions.clear();
      this.healthSources.clear();
    })();
    return this.shutdown;
  }

  private async poll(): Promise<void> {
    if (this.stopped) return;
    const generation = this.generation;
    try {
      const status = await this.control.status();
      if (this.stopped || generation !== this.generation) return;
      if (this.lastKnownIdentity?.bootId !== status.bootId) this.leaseExpiresAt = 0;
      this.lastKnownIdentity = {
        lifecycleProtocolVersion: status.lifecycleProtocolVersion,
        instanceId: status.instanceId,
        bootId: status.bootId,
        bridgeVersion: status.bridgeVersion,
        startedAt: status.startedAt,
      };
      if (this.leaseExpiresAt <= this.now() + this.leaseTtlMs / 2) {
        const lease = this.leaseExpiresAt === 0
          ? await this.control.acquireLease(this.leaseTtlMs, this.browserOrigins, this.dshViewerUrl)
          : await this.control.renewLease(this.leaseTtlMs, this.browserOrigins, this.dshViewerUrl);
        if (this.stopped || generation !== this.generation) return;
        if (lease.bootId !== status.bootId) throw new Error("Bridge lease belongs to another boot");
        this.leaseExpiresAt = lease.expiresAt;
      }
      await this.observe(status);
    } catch (error) {
      if (this.stopped || generation !== this.generation) return;
      this.leaseExpiresAt = 0;
      const reason = error instanceof Error ? error.message : String(error);
      const alreadyReported = this.snapshot.state === "OFFLINE" && this.snapshot.reason === reason;
      if (!alreadyReported) this.onError(error);
      await this.observe({
        lifecycleProtocolVersion: BRIDGE_LIFECYCLE_PROTOCOL_VERSION,
        state: "OFFLINE",
        stateChangedAt: alreadyReported ? this.snapshot.stateChangedAt : this.now(),
        ...(this.lastKnownIdentity === undefined ? {} : { lastKnownIdentity: this.lastKnownIdentity }),
        reason,
      });
    } finally {
      if (!this.stopped) this.timer = this.setTimer(() => { this.inFlight = this.poll(); }, this.pollIntervalMs);
    }
  }

  private async observe(status: ObservedBridgeStatus): Promise<void> {
    if (this.stopped) return;
    const changed = JSON.stringify(status) !== JSON.stringify(this.snapshot);
    this.snapshot = status;
    if (changed) for (const listener of [...this.listeners]) listener();
    this.queueReconcile();
    await this.transition;
  }

  private queueReconcile(): void {
    this.transition = this.transition.then(async () => {
      if (this.stopped || !acceptsBridgeWork(this.snapshot)) {
        await this.unmountAllNow();
        return;
      }
      const ready = this.snapshot as ReadyBridgeStatus;
      if (this.attachments.some((item) => item.disposer !== undefined && item.bootId !== ready.bootId)) await this.unmountAllNow();
      const generation = this.generation;
      for (const attachment of [...this.attachments]) {
        if (this.stopped || generation !== this.generation) break;
        if (!this.attachments.includes(attachment) || attachment.disposer !== undefined) continue;
        const disposer = await attachment.mount(ready);
        if (this.stopped || generation !== this.generation || !this.attachments.includes(attachment)
          || !acceptsBridgeWork(this.snapshot) || this.snapshot.bootId !== ready.bootId) {
          await disposer?.();
          continue;
        }
        attachment.bootId = ready.bootId;
        attachment.disposer = disposer ?? (() => undefined);
      }
    }).catch((error) => { this.onError(error); });
  }

  private async unmountAll(): Promise<void> {
    await this.transition;
    await this.unmountAllNow();
  }

  private async unmountAllNow(): Promise<void> {
    for (const attachment of [...this.attachments].reverse()) {
      const disposer = attachment.disposer;
      attachment.disposer = undefined;
      try { await disposer?.(); } catch (error) { this.onError(error); }
    }
  }
}
