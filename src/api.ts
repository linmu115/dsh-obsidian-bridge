import type {} from "@deepseek-ai/cordis";
import type { BridgeStatus, ObservedBridgeStatus } from "dsh-obsidian-bridge-protocol";

export type BridgeAttachmentDisposer = () => void | Promise<void>;
export type ReadyBridgeStatus = BridgeStatus & { state: "READY" | "DEGRADED" };
export type BridgeAttachmentMount = (
  status: ReadyBridgeStatus,
) => void | BridgeAttachmentDisposer | Promise<void | BridgeAttachmentDisposer>;

export interface BridgeComponentHealth {
  state: string;
  pendingCount?: number;
  lastError?: string;
}
export interface BridgeLifecycleHealth {
  state: ObservedBridgeStatus["state"];
  bridgeOrigin: string;
  components: Readonly<Record<string, BridgeComponentHealth>>;
}
export interface BridgeHealthSource {
  getHealth(): BridgeComponentHealth;
  retry?(): void;
  subscribe?(listener: () => void): () => void;
}
export interface ObsidianBridgeLifecycle {
  readonly bridgeOrigin: string;
  getHealth?(): BridgeLifecycleHealth;
  registerHealthSource?(name: string, source: BridgeHealthSource): () => void;
  retry?(name?: string): void;
  getSnapshot(): ObservedBridgeStatus;
  subscribe(listener: () => void): () => void;
  mountWhenReady(name: string, mount: BridgeAttachmentMount): () => void;
  drain(reason: string, deadlineMs?: number): Promise<void>;
  resume(): Promise<void>;
}

declare module "@deepseek-ai/cordis" {
  interface Context {
    obsidianBridgeLifecycle: ObsidianBridgeLifecycle;
  }
}
