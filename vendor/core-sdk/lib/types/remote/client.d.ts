import type { Context } from '@deepseek-ai/cordis';
import type { DshMessageCapture, DshMessageReferenceSource } from '../protocol/index.ts';
import type { RemoteFailure, RemoteResult } from '@deepseek-ai/dsh-typert-protocol';
import type { AdmissionRecord } from '../host/store.ts';
import type { SubmissionResult } from '../host/submit-annotated.ts';
import type { ReferenceLinkSummary, ReferenceSet } from '../domain/model.ts';
import type { AddReferenceRequest, DiscardPendingOperationRequest, DeleteReferenceLinkRequest, FenceReferenceOperationRequest, RemoveReferenceRequest, RetryBacklinkRequest, ReuseReferenceRequest, SubmitAnnotatedRequest, SubmitPlainClaimRequest, UpdateCommentRequest } from './service.ts';
export { TYPERT_REMOTE } from './typert.ts';
export interface AnnotationCoreRemoteNamespace {
    upstreamDirectory(request: {
        workspaceId?: string;
        after?: string;
    }): Promise<RemoteResult<{
        items: {
            id: string;
            title: string;
        }[];
        nextCursor: string | null;
    }>>;
    captureUpstream(request: {
        capture: DshMessageCapture;
        operationId: string;
    }): Promise<RemoteResult<DshMessageReferenceSource>>;
    describeGraphReference?(referenceId: string): Promise<RemoteResult<{
        source: DshMessageReferenceSource;
        state: 'pending' | 'sent';
    }>>;
    restoreGraphReference?(referenceId: string): Promise<RemoteResult<void>>;
    readPending(): Promise<RemoteResult<{
        revision: number;
        pending: ReferenceSet | null;
    }>>;
    resolveReferenceLink(referenceId: string): Promise<RemoteResult<ReferenceLinkSummary | null>>;
    addReference(request: AddReferenceRequest): Promise<RemoteResult<{
        revision: number;
        setId: string;
        referenceId: string;
        created: boolean;
    }>>;
    fenceReferenceOperation(request: FenceReferenceOperationRequest): Promise<RemoteResult<{
        state: 'canceled' | 'committed' | 'failed';
        fenceRevision: number;
    }>>;
    discardPendingOperation(request: DiscardPendingOperationRequest): Promise<RemoteResult<void>>;
    updateComment(request: UpdateCommentRequest): Promise<RemoteResult<void>>;
    removeReference(request: RemoveReferenceRequest): Promise<RemoteResult<void>>;
    deleteReferenceLink(request: DeleteReferenceLinkRequest): Promise<RemoteResult<{
        revision: number;
        deleted: boolean;
        scope: 'pending' | 'sent';
    }>>;
    reuseReference(request: ReuseReferenceRequest): Promise<RemoteResult<{
        revision: number;
        setId: string;
        referenceId: string;
        created: boolean;
    }>>;
    readSentSet(setId: string): Promise<RemoteResult<ReferenceSet | null>>;
    listSentForSession(): Promise<RemoteResult<readonly ReferenceSet[]>>;
    waitRevision(afterRevision: number, signal?: AbortSignal): Promise<RemoteResult<{
        revision: number;
        pending: ReferenceSet | null;
    }>>;
    watchPending?(signal?: AbortSignal): AsyncIterable<{
        revision: number;
        pending: ReferenceSet | null;
    }>;
    readAdmission(clientSubmissionId: string): Promise<RemoteResult<AdmissionRecord | null>>;
    submitAnnotated(request: SubmitAnnotatedRequest, signal?: AbortSignal): Promise<RemoteResult<SubmissionResult>>;
    submitPlainClaim(request: SubmitPlainClaimRequest, signal?: AbortSignal): Promise<RemoteResult<SubmissionResult>>;
    retryBacklink(request: RetryBacklinkRequest): Promise<RemoteResult<unknown>>;
}
export declare class AnnotationRemoteFailureError extends Error {
    readonly failure: RemoteFailure;
    constructor(failure: RemoteFailure);
}
export declare function unwrapRemote<T>(result: RemoteResult<T>): T;
export declare function annotationRemote(ctx: Context): AnnotationCoreRemoteNamespace;
/** Resolve a Remote namespace from the explicitly requested Agent scope. */
export declare function annotationRemoteForSession(ctx: Context, sessionId: string): AnnotationCoreRemoteNamespace;
//# sourceMappingURL=client.d.ts.map