import type { VaultIdentity, VaultBindingSnapshot, ChangeVaultBindingRequest, DshInstanceIdentity } from "dsh-obsidian-bridge-protocol/binding";
import type { BridgeHttpClient, BridgeAction } from "./transport.ts";
import type { ObsidianNoteReferenceSource } from "dsh-annotation-core/protocol";
import type {} from "@deepseek-ai/cordis";
import type { BridgeStatus, ObservedBridgeStatus } from "dsh-obsidian-bridge-protocol";

export type BridgeAttachmentDisposer = () => void | Promise<void>;
export type ReadyBridgeStatus = BridgeStatus & { state: "READY" | "DEGRADED" };
export type BridgeAttachmentMount = (
  status: ReadyBridgeStatus,
  route?: BridgeActionRoute,
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
  vaults?: readonly VaultConnectionSnapshot[];
}
export interface BridgeHealthSource {
  getHealth(): BridgeComponentHealth;
  retry?(): void;
  subscribe?(listener: () => void): () => void;
}
export interface BridgeRuntimeIdentity { readonly dshInstanceId?: string; readonly profileId: string; }

export type BorrowedBridgeTransport = Omit<BridgeHttpClient, "dispose" | "nextActions" | "acknowledgeDeepLink" | "acknowledgeAction">;
export type BridgeDeliveryOutcome = "handled" | "retry" | "ignored" | "cancelled";
export interface VaultConnectionSnapshot {
  vaultId: string; displayName: string; origin: string; binding: VaultBindingSnapshot;
  state: "bound" | "available" | "foreign" | "offline" | "conflict"; lastError?: string; connectionState?:ObservedBridgeStatus["state"];
}
export interface BridgeActionRoute { vaultId: string; bindingRevision: number; transport: BorrowedBridgeTransport; }
export interface CliAvailability { available: boolean; reason?: string; }
export interface BridgeConfiguration { origin: string; runtimeIdentity?: BridgeRuntimeIdentity; identity?: DshInstanceIdentity; vaults?: VaultIdentity[]; cli?: CliAvailability; referenceLocationResolverAvailable?: boolean; }
export interface BridgeActionHandler {
  accepts(action: BridgeAction): boolean;
  handle(action: BridgeAction, signal: AbortSignal, route?: BridgeActionRoute): Promise<BridgeDeliveryOutcome | boolean>;
}
export interface ReferenceHandoffResult { setId: string; referenceId: string; }
export interface ReferenceHandoffInput {
  vaultId?: string;
  sessionId: string;
  operationId: string;
  prepare(): Promise<{ referenceId: string; source: ObsidianNoteReferenceSource }>;
  commit(result: ReferenceHandoffResult): Promise<void>;
  assertCurrent(): void;
}
export interface ObsidianBridgeLifecycle {
  /** False means native locations are used; logical-only targets still require a resolver. */
  hasReferenceLocationResolver?(): boolean;
  getCliAvailability?(): CliAvailability;
  getInstanceIdentity?(): DshInstanceIdentity;
  forVault?(vaultId: string): BorrowedBridgeTransport;
  listVaults?(): readonly VaultConnectionSnapshot[];
  changeVaultBinding?(vaultId: string, request: ChangeVaultBindingRequest): Promise<VaultBindingSnapshot>;
  refreshVaults?(): Promise<void>;
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

export { assertSessionAvailable, assertMaintenanceSessionAvailable } from "./session-availability.ts";
