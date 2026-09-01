import type {} from "@deepseek-ai/cordis";
import type { BridgeStatus, ObservedBridgeStatus } from "dsh-obsidian-bridge-protocol";

export type BridgeAttachmentDisposer = () => void | Promise<void>;
export type ReadyBridgeStatus = BridgeStatus & { state: "READY" | "DEGRADED" };
export type BridgeAttachmentMount = (
  status: ReadyBridgeStatus,
) => void | BridgeAttachmentDisposer | Promise<void | BridgeAttachmentDisposer>;

export interface ObsidianBridgeLifecycle {
  readonly bridgeOrigin: string;
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
