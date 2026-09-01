import {
  BRIDGE_LIFECYCLE_PROTOCOL_VERSION,
  acceptsBridgeWork,
  type BridgeIdentity,
  type BridgeStatus,
  type ObservedBridgeStatus,
} from "dsh-obsidian-bridge-protocol";

import type { BridgeAttachmentDisposer, BridgeAttachmentMount, ObsidianBridgeLifecycle, ReadyBridgeStatus } from "./api.ts";
import { createBridgeControlClient, type BridgeControlClient } from "./control-client.ts";

interface Attachment {
  name: string;
  mount: BridgeAttachmentMount;
  disposer: BridgeAttachmentDisposer | undefined;
}

export interface LifecycleRuntimeOptions {
  bridgeOrigin: string;
  clientId: string;
  role: "controller" | "surface";
  browserOrigins?: readonly string[];
  dshViewerUrl?: string;
  requestOrigin?: string;
  pollIntervalMs?: number;
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
  private leaseExpiresAt = 0;
  private transition: Promise<void> = Promise.resolve();
  private lastKnownIdentity?: BridgeIdentity;
  private snapshot: ObservedBridgeStatus;

  constructor(options: LifecycleRuntimeOptions) {
    this.control = createBridgeControlClient({
      origin: options.bridgeOrigin,
      clientId: options.clientId,
      role: options.role,
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

  start(): void { void this.poll(); }

  mountWhenReady(name: string, mount: BridgeAttachmentMount): () => void {
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
        await attachment.disposer?.();
        attachment.disposer = undefined;
      });
    };
  }

  async drain(reason: string, deadlineMs = 10_000): Promise<void> {
    await this.observe(await this.control.drain(reason, deadlineMs));
  }

  async resume(): Promise<void> {
    await this.observe(await this.control.resume());
  }

  async dispose(): Promise<void> {
    this.stopped = true;
    if (this.timer !== undefined) this.clearTimer(this.timer);
    await this.unmountAll();
    await this.control.dispose();
    this.listeners.clear();
  }

  private async poll(): Promise<void> {
    if (this.stopped) return;
    try {
      const status = await this.control.status();
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
        this.leaseExpiresAt = lease.expiresAt;
      }
      await this.observe(status);
    } catch (error) {
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
      if (!this.stopped) this.timer = this.setTimer(() => { void this.poll(); }, this.pollIntervalMs);
    }
  }

  private async observe(status: ObservedBridgeStatus): Promise<void> {
    const changed = JSON.stringify(status) !== JSON.stringify(this.snapshot);
    this.snapshot = status;
    if (changed) for (const listener of [...this.listeners]) listener();
    this.queueReconcile();
    await this.transition;
  }

  private queueReconcile(): void {
    this.transition = this.transition.then(async () => {
      if (!acceptsBridgeWork(this.snapshot)) {
        await this.unmountAllNow();
        return;
      }
      const ready = this.snapshot as ReadyBridgeStatus;
      for (const attachment of this.attachments) {
        if (attachment.disposer !== undefined) continue;
        const disposer = await attachment.mount(ready);
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
      await disposer?.();
    }
  }
}
