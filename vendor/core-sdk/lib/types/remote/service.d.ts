import type { Context } from '@deepseek-ai/cordis';
import type { DshMessageCapture } from '../protocol/index.ts';
import type { Agent } from '@deepseek-ai/dsh-agent';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type { ReferenceSource } from '../protocol/index.ts';
import type { AnnotationStore } from '../host/store.ts';
import type { BacklinkOutbox } from '../host/backlink-outbox.ts';
import type { PendingDiscardOutbox } from '../host/pending-discard-outbox.ts';
import type { CommittedDeleteOutbox } from '../host/committed-delete-outbox.ts';
import type { AnnotationSubmissionCoordinator, SubmitAnnotatedInput, SubmitPlainInput } from '../host/submit-annotated.ts';
export interface AddReferenceRequest {
    readonly expectedRevision: number;
    readonly operationId: string;
    readonly setId: string;
    readonly referenceId: string;
    readonly source: ReferenceSource;
    readonly userComment?: string;
    readonly createdAt: number;
}
export interface FenceReferenceOperationRequest {
    readonly expectedRevision: number;
    readonly operationId: string;
}
export interface DiscardPendingOperationRequest extends FenceReferenceOperationRequest {
    /** False rolls back only a losing local add; it must not cancel the winning source. */
    notifySource?: boolean;
}
export interface UpdateCommentRequest {
    readonly expectedRevision: number;
    readonly referenceId: string;
    readonly comment: string;
}
export interface RemoveReferenceRequest {
    readonly expectedRevision: number;
    readonly referenceId: string;
}
export interface DeleteReferenceLinkRequest {
    readonly expectedRevision: number;
    readonly setId: string;
    readonly referenceId: string;
    readonly deletedAt: number;
}
export interface ReuseReferenceRequest {
    readonly expectedRevision: number;
    readonly sourceReferenceId: string;
    readonly operationId: string;
    readonly setId: string;
    readonly referenceId: string;
    readonly createdAt: number;
}
export type SubmitAnnotatedRequest = SubmitAnnotatedInput;
export type SubmitPlainClaimRequest = SubmitPlainInput;
export interface RetryBacklinkRequest {
    readonly expectedRevision: number;
    readonly setId: string;
    readonly referenceId: string;
}
/**
 * Agent-scoped Host boundary. Task 3 owns durable admission and identity;
 * Task 5 replaces the prepared-only submit methods with the full Agent transaction.
 */
export declare class AnnotationCoreRemoteService extends TypertRemoteService {
    readonly store: AnnotationStore;
    readonly submissions?: AnnotationSubmissionCoordinator | undefined;
    readonly outbox?: BacklinkOutbox | undefined;
    readonly discardOutbox?: PendingDiscardOutbox | undefined;
    readonly deleteOutbox?: CommittedDeleteOutbox | undefined;
    constructor(ctx: Context, store: AnnotationStore, submissions?: AnnotationSubmissionCoordinator | undefined, outbox?: BacklinkOutbox | undefined, discardOutbox?: PendingDiscardOutbox | undefined, deleteOutbox?: CommittedDeleteOutbox | undefined);
    readPending(agent: Agent): Promise<{
        revision: number;
        pending: import("../domain/model.ts").ReferenceSet | null;
    }>;
    resolveReferenceLink(agent: Agent, referenceId: string): Promise<import("../client.tsx").ReferenceLinkSummary | null>;
    upstreamDirectory(_agent: Agent, request: {
        workspaceId?: string;
        after?: string;
    }): Promise<{
        items: {
            id: string;
            title: string;
        }[];
        nextCursor: string | null;
    }>;
    captureUpstream(agent: Agent, request: {
        capture: DshMessageCapture;
        operationId: string;
    }): Promise<{
        sourceType: "dsh-message";
        selectedText: string;
        locator: {
            profileId: string;
            sessionId: string;
            anchorId: string;
            role: "user" | "assistant";
            occurrence: number;
            selectedTextHash: string;
            messageId?: string | undefined;
            upstream?: {
                kind: "fixed-upstream";
                referenceId: string;
                sourceTitle: string;
                sourceVersionId: string;
                cutoffEventId: string;
                targetSessionId: string;
            } | undefined;
            dshInstanceId?: string | undefined;
            logicalSessionId?: string | undefined;
            logicalAnchorId?: string | undefined;
            legacySessionId?: string | undefined;
            legacyAnchorId?: string | undefined;
        };
    }>;
    describeGraphReference(agent: Agent, referenceId: string): Promise<{
        source: {
            sourceType: "dsh-message";
            selectedText: string;
            locator: {
                profileId: string;
                sessionId: string;
                anchorId: string;
                role: "user" | "assistant";
                occurrence: number;
                selectedTextHash: string;
                messageId?: string | undefined;
                upstream?: {
                    kind: "fixed-upstream";
                    referenceId: string;
                    sourceTitle: string;
                    sourceVersionId: string;
                    cutoffEventId: string;
                    targetSessionId: string;
                } | undefined;
                dshInstanceId?: string | undefined;
                logicalSessionId?: string | undefined;
                logicalAnchorId?: string | undefined;
                legacySessionId?: string | undefined;
                legacyAnchorId?: string | undefined;
            };
        };
        state: "pending" | "sent";
    }>;
    restoreGraphReference(agent: Agent, referenceId: string): Promise<void>;
    addReference(agent: Agent, request: AddReferenceRequest): Promise<{
        revision: number;
        setId: string;
        referenceId: string;
        created: boolean;
    }>;
    fenceReferenceOperation(agent: Agent, request: FenceReferenceOperationRequest): Promise<{
        state: import("../host/store.ts").ReferenceOperationState;
        fenceRevision: number;
    }>;
    discardPendingOperation(agent: Agent, request: DiscardPendingOperationRequest): Promise<void>;
    updateComment(agent: Agent, request: UpdateCommentRequest): Promise<void>;
    removeReference(agent: Agent, request: RemoveReferenceRequest): Promise<void>;
    deleteReferenceLink(agent: Agent, request: DeleteReferenceLinkRequest): Promise<{
        revision: number;
        deleted: boolean;
        scope: "pending" | "sent";
    }>;
    reuseReference(agent: Agent, request: ReuseReferenceRequest): Promise<{
        revision: number;
        setId: string;
        referenceId: string;
        created: boolean;
    }>;
    readSentSet(agent: Agent, setId: string): Promise<import("../domain/model.ts").ReferenceSet | null>;
    listSentForSession(agent: Agent): Promise<readonly import("../domain/model.ts").ReferenceSet[]>;
    waitRevision(agent: Agent, afterRevision: number, signal: AbortSignal): Promise<{
        revision: number;
        pending: import("../domain/model.ts").ReferenceSet | null;
    }>;
    watchPending(agent: Agent, signal: AbortSignal): AsyncGenerator<{
        revision: number;
        pending: import("../domain/model.ts").ReferenceSet | null;
    }, void, unknown>;
    readAdmission(agent: Agent, clientSubmissionId: string): import("../host/store.ts").AdmissionRecord | null;
    submitAnnotated(agent: Agent, request: SubmitAnnotatedRequest, signal: AbortSignal): Promise<import("../host/submit-annotated.ts").SubmissionResult>;
    submitPlainClaim(agent: Agent, request: SubmitPlainClaimRequest, signal: AbortSignal): Promise<import("../host/submit-annotated.ts").SubmissionResult>;
    retryBacklink(agent: Agent, request: RetryBacklinkRequest): Promise<import("../host/store.ts").BacklinkJob | {
        revision: number;
        job: import("../host/store.ts").BacklinkJob;
    }>;
}
//# sourceMappingURL=service.d.ts.map