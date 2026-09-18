import type { BridgeHttpClient, BridgeAction } from "./transport.ts";
import type { AnnotationCoreClient } from "dsh-annotation-core/client-api";
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
export interface BridgeRuntimeIdentity { readonly dshInstanceId?: string; readonly profileId: string; }

export type BorrowedBridgeTransport = Omit<BridgeHttpClient, "dispose" | "nextActions" | "acknowledgeDeepLink" | "acknowledgeAction">;
export type BridgeDeliveryOutcome = "handled" | "retry" | "ignored" | "cancelled";
export interface BridgeActionHandler {
  accepts(action: BridgeAction): boolean;
  handle(action: BridgeAction, signal: AbortSignal): Promise<BridgeDeliveryOutcome | boolean>;
}
export interface ReferenceHandoffResult { setId: string; referenceId: string; }
export interface ReferenceHandoffInput {
  sessionId: string;
  operationId: string;
  prepare(): Promise<{ referenceId: string; source: Parameters<AnnotationCoreClient["addReference"]>[1] }>;
  commit(result: ReferenceHandoffResult): Promise<void>;
  assertCurrent(): void;
}
export interface ObsidianBridgeLifecycle {
  readonly capabilities?: readonly string[];
  readonly transport?: BorrowedBridgeTransport;
  registerActionHandler?(name: string, handler: BridgeActionHandler): () => void;
  retryActions?(): void;
  handoffReference?(input: ReferenceHandoffInput): Promise<ReferenceHandoffResult>;
  readonly runtimeIdentity?: BridgeRuntimeIdentity;
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
