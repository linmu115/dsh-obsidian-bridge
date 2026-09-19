import type { SubmissionAttachment } from '../protocol/submission-attachments.ts';
import type { Context } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
import type { SubmitImageAttachment } from './admit-images.ts';
import type { BacklinkOutbox } from './backlink-outbox.ts';
import { SessionSettlementTracker } from './session-reconcile.ts';
import type { HostSourceRegistry } from './source-registry.ts';
import { type AnnotationStore } from './store.ts';
export interface SubmitAnnotatedInput {
    readonly expectedRevision: number;
    readonly setId: string;
    readonly referenceRevision: number;
    readonly clientSubmissionId: string;
    readonly requestDigest: string;
    readonly text: string;
    readonly images?: readonly SubmitImageAttachment[];
    readonly attachments?: readonly SubmissionAttachment[];
    readonly useSavedSnapshotFor?: readonly string[];
    readonly createdAt: number;
}
export interface SubmitPlainInput {
    readonly expectedRevision: number;
    readonly clientSubmissionId: string;
    readonly requestDigest: string;
    readonly text: string;
    readonly images?: readonly SubmitImageAttachment[];
    readonly attachments?: readonly SubmissionAttachment[];
    readonly createdAt: number;
}
export interface SubmissionSuccess {
    readonly kind: 'success';
    readonly clientSubmissionId: string;
    readonly userMessageId: string;
    readonly setId?: string;
}
export interface SubmissionFailure {
    readonly kind: 'error';
    readonly code: 'source-confirmation' | 'source-blocked' | 'image-admission' | 'delivery' | 'durability' | 'unresolved';
    readonly message: string;
    readonly details?: unknown;
}
export type SubmissionResult = SubmissionSuccess | SubmissionFailure;
/** Host-owned idempotent transaction; Remote and embedded clients share this one path. */
export declare class AnnotationSubmissionCoordinator {
    readonly ctx: Context;
    readonly store: AnnotationStore;
    readonly sources: HostSourceRegistry;
    readonly settlements: SessionSettlementTracker;
    readonly outbox: BacklinkOutbox;
    readonly now: () => number;
    private readonly tails;
    constructor(ctx: Context, store: AnnotationStore, sources: HostSourceRegistry, settlements: SessionSettlementTracker, outbox: BacklinkOutbox, now?: () => number);
    submitAnnotated(agent: Agent, input: SubmitAnnotatedInput, signal?: AbortSignal): Promise<SubmissionResult>;
    submitPlain(agent: Agent, input: SubmitPlainInput, signal?: AbortSignal): Promise<SubmissionResult>;
    private submitAnnotatedExclusive;
    private submitPlainExclusive;
    private checkSubmissionCapability;
    private validateRequest;
    private resumeKnown;
    private deliverAndSettle;
    private settleRecorded;
    private awaitSettlement;
    private finalizeLatest;
    private recordReconciliationFailure;
    private failTerminal;
    private exclusive;
}
//# sourceMappingURL=submit-annotated.d.ts.map