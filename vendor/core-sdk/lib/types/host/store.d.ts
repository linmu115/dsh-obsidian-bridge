import { type ReferenceCommitReceipt } from './reference-commit-receipt.ts';
import { type SubmittedMessage } from './submitted-message.ts';
import type { Context } from '@deepseek-ai/cordis';
import type { Domain, KvTable } from '@deepseek-ai/dsh-storage-domain';
import { z } from 'zod';
import type { ReferenceItem, ReferenceLinkSummary, ReferenceSet } from '../domain/model.ts';
import type { ReferenceSource } from '../protocol/index.ts';
import type { AnnotationReferenceDirectory } from '../public/host-api.ts';
export declare const ReferenceItemSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    referenceId: z.ZodString;
    number: z.ZodNumber;
    selectedText: z.ZodString;
    userComment: z.ZodString;
    backlinkState: z.ZodLiteral<"not-required">;
    sourceType: z.ZodLiteral<"dsh-message">;
    locator: z.ZodObject<{
        profileId: z.ZodString;
        sessionId: z.ZodString;
        messageId: z.ZodOptional<z.ZodString>;
        anchorId: z.ZodString;
        role: z.ZodEnum<{
            user: "user";
            assistant: "assistant";
        }>;
        occurrence: z.ZodNumber;
        selectedTextHash: z.ZodString;
        upstream: z.ZodOptional<z.ZodObject<{
            kind: z.ZodLiteral<"fixed-upstream">;
            referenceId: z.ZodString;
            sourceTitle: z.ZodString;
            sourceVersionId: z.ZodString;
            cutoffEventId: z.ZodString;
            targetSessionId: z.ZodString;
        }, z.core.$strict>>;
        dshInstanceId: z.ZodOptional<z.ZodString>;
        logicalSessionId: z.ZodOptional<z.ZodString>;
        logicalAnchorId: z.ZodOptional<z.ZodString>;
        legacySessionId: z.ZodOptional<z.ZodString>;
        legacyAnchorId: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    initialContext: z.ZodOptional<z.ZodObject<{
        kind: z.ZodLiteral<"selected-turn">;
        sourceVersionId: z.ZodString;
        cutoffEventId: z.ZodString;
        items: z.ZodArray<z.ZodObject<{
            eventId: z.ZodString;
            role: z.ZodString;
            text: z.ZodString;
            offset: z.ZodNumber;
            complete: z.ZodBoolean;
        }, z.core.$strict>>;
        turnComplete: z.ZodBoolean;
        omittedIntermediateItems: z.ZodOptional<z.ZodNumber>;
        detailsCursor: z.ZodOptional<z.ZodString>;
        nextCursor: z.ZodNullable<z.ZodString>;
        hasMore: z.ZodBoolean;
        disclosureRequestId: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>, z.ZodObject<{
    referenceId: z.ZodString;
    number: z.ZodNumber;
    selectedText: z.ZodString;
    userComment: z.ZodString;
    backlinkState: z.ZodEnum<{
        pending: "pending";
        failed: "failed";
        written: "written";
    }>;
    sourceType: z.ZodLiteral<"obsidian-note">;
    locator: z.ZodObject<{
        vaultId: z.ZodString;
        notePath: z.ZodString;
        heading: z.ZodOptional<z.ZodString>;
        blockId: z.ZodString;
        occurrence: z.ZodNumber;
        selectedTextHash: z.ZodString;
    }, z.core.$strict>;
    snapshot: z.ZodObject<{
        markdown: z.ZodString;
        documentHash: z.ZodString;
        capturedAt: z.ZodNumber;
        freshness: z.ZodEnum<{
            captured: "captured";
            refreshed: "refreshed";
            offline: "offline";
        }>;
    }, z.core.$strict>;
}, z.core.$strict>], "sourceType">;
export declare const ReferenceSetSchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<1>;
    setId: z.ZodString;
    profileId: z.ZodString;
    sessionId: z.ZodString;
    state: z.ZodEnum<{
        pending: "pending";
        committing: "committing";
        sent: "sent";
        failed: "failed";
    }>;
    revision: z.ZodNumber;
    items: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        referenceId: z.ZodString;
        number: z.ZodNumber;
        selectedText: z.ZodString;
        userComment: z.ZodString;
        backlinkState: z.ZodLiteral<"not-required">;
        sourceType: z.ZodLiteral<"dsh-message">;
        locator: z.ZodObject<{
            profileId: z.ZodString;
            sessionId: z.ZodString;
            messageId: z.ZodOptional<z.ZodString>;
            anchorId: z.ZodString;
            role: z.ZodEnum<{
                user: "user";
                assistant: "assistant";
            }>;
            occurrence: z.ZodNumber;
            selectedTextHash: z.ZodString;
            upstream: z.ZodOptional<z.ZodObject<{
                kind: z.ZodLiteral<"fixed-upstream">;
                referenceId: z.ZodString;
                sourceTitle: z.ZodString;
                sourceVersionId: z.ZodString;
                cutoffEventId: z.ZodString;
                targetSessionId: z.ZodString;
            }, z.core.$strict>>;
            dshInstanceId: z.ZodOptional<z.ZodString>;
            logicalSessionId: z.ZodOptional<z.ZodString>;
            logicalAnchorId: z.ZodOptional<z.ZodString>;
            legacySessionId: z.ZodOptional<z.ZodString>;
            legacyAnchorId: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
        initialContext: z.ZodOptional<z.ZodObject<{
            kind: z.ZodLiteral<"selected-turn">;
            sourceVersionId: z.ZodString;
            cutoffEventId: z.ZodString;
            items: z.ZodArray<z.ZodObject<{
                eventId: z.ZodString;
                role: z.ZodString;
                text: z.ZodString;
                offset: z.ZodNumber;
                complete: z.ZodBoolean;
            }, z.core.$strict>>;
            turnComplete: z.ZodBoolean;
            omittedIntermediateItems: z.ZodOptional<z.ZodNumber>;
            detailsCursor: z.ZodOptional<z.ZodString>;
            nextCursor: z.ZodNullable<z.ZodString>;
            hasMore: z.ZodBoolean;
            disclosureRequestId: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
    }, z.core.$strict>, z.ZodObject<{
        referenceId: z.ZodString;
        number: z.ZodNumber;
        selectedText: z.ZodString;
        userComment: z.ZodString;
        backlinkState: z.ZodEnum<{
            pending: "pending";
            failed: "failed";
            written: "written";
        }>;
        sourceType: z.ZodLiteral<"obsidian-note">;
        locator: z.ZodObject<{
            vaultId: z.ZodString;
            notePath: z.ZodString;
            heading: z.ZodOptional<z.ZodString>;
            blockId: z.ZodString;
            occurrence: z.ZodNumber;
            selectedTextHash: z.ZodString;
        }, z.core.$strict>;
        snapshot: z.ZodObject<{
            markdown: z.ZodString;
            documentHash: z.ZodString;
            capturedAt: z.ZodNumber;
            freshness: z.ZodEnum<{
                captured: "captured";
                refreshed: "refreshed";
                offline: "offline";
            }>;
        }, z.core.$strict>;
    }, z.core.$strict>], "sourceType">>;
    createdAt: z.ZodNumber;
    committedAt: z.ZodOptional<z.ZodNumber>;
    userMessageId: z.ZodOptional<z.ZodString>;
    userAnchorId: z.ZodOptional<z.ZodString>;
    userTextHash: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type ReferenceOperationState = 'canceled' | 'committed' | 'failed';
export interface ReferenceOperationRecord {
    readonly operationId: string;
    readonly state: ReferenceOperationState;
    readonly fenceRevision: number;
    readonly referenceId?: string | undefined;
    readonly setId?: string | undefined;
    readonly sourceDigest?: string | undefined;
    readonly createdReference?: boolean | undefined;
    readonly createdAt: number;
    readonly updatedAt: number;
}
export type AdmissionState = 'prepared' | 'enqueued' | 'durable' | 'failed';
export type AdmissionKind = 'annotated' | 'plain';
export interface AdmissionRecord {
    readonly clientSubmissionId: string;
    readonly requestDigest: string;
    readonly kind: AdmissionKind;
    readonly userMessage?: SubmittedMessage | undefined;
    readonly state: AdmissionState;
    readonly setId?: string | undefined;
    readonly referenceRevision?: number | undefined;
    readonly userMessageId?: string | undefined;
    readonly contextMessageId?: string | undefined;
    readonly userTextHash?: string | undefined;
    readonly lastError?: string | undefined;
    readonly createdAt: number;
    readonly updatedAt: number;
}
export interface SubmissionJournalEntry {
    readonly userMessageId: string;
    readonly clientSubmissionId: string;
    readonly requestDigest: string;
    readonly setId?: string | undefined;
    readonly contextMessageId?: string | undefined;
    readonly contextDigest?: string | undefined;
    readonly userTextHash?: string | undefined;
    readonly preparedSet?: ReferenceSet | undefined;
    readonly createdAt: number;
}
export interface FlushReconciliationRecord {
    readonly userMessageId: string;
    readonly userObserved: boolean;
    readonly contextObserved: boolean;
    readonly flushState: 'pending' | 'durable' | 'failed';
    readonly lastError?: string | undefined;
    readonly updatedAt: number;
}
export interface BacklinkJob {
    readonly setId: string;
    readonly referenceId: string;
    readonly state: 'pending' | 'written' | 'failed';
    readonly attempts: number;
    readonly lastError?: string | undefined;
    readonly receipt?: ReferenceCommitReceipt | undefined;
    readonly createdAt: number;
    readonly updatedAt: number;
}
export interface PendingDiscardJob {
    readonly referenceId: string;
    readonly state: 'pending';
    readonly item: ReferenceItem;
    readonly attempts: number;
    readonly lastError?: string | undefined;
    readonly createdAt: number;
    readonly updatedAt: number;
}
export interface CommittedDeleteJob {
    readonly generation?: number;
    readonly setId: string;
    readonly referenceId: string;
    readonly state: 'pending';
    readonly item: ReferenceItem;
    readonly deletedAt: number;
    readonly attempts: number;
    readonly lastError?: string | undefined;
    readonly createdAt: number;
    readonly updatedAt: number;
}
export interface DeletedReferenceRecord {
    readonly setId: string;
    readonly referenceId: string;
    readonly scope: 'pending' | 'sent';
    readonly sourceType: ReferenceItem['sourceType'];
    readonly deletedAt: number;
    /** Ordinary draft removal cancels capture; absent means an explicit relation deletion. */
    readonly disposition?: 'discard' | undefined;
}
export interface SessionAggregate {
    readonly schemaVersion: 1;
    readonly profileId: string;
    readonly sessionId: string;
    readonly revision: number;
    /** Last aggregate revision that changed the bounded public reference directory. */
    readonly directoryRevision?: number | undefined;
    readonly pending?: ReferenceSet | undefined;
    readonly sentSets: readonly ReferenceSet[];
    readonly operations: Readonly<Record<string, ReferenceOperationRecord>>;
    readonly admissions: Readonly<Record<string, AdmissionRecord>>;
    readonly submissionJournal: Readonly<Record<string, SubmissionJournalEntry>>;
    readonly flushReconciliations: Readonly<Record<string, FlushReconciliationRecord>>;
    readonly backlinkJobs: Readonly<Record<string, BacklinkJob>>;
    readonly pendingDiscardJobs: Readonly<Record<string, PendingDiscardJob>>;
    readonly committedDeleteJobs: Readonly<Record<string, CommittedDeleteJob>>;
    readonly deletedReferences: Readonly<Record<string, DeletedReferenceRecord>>;
    /** Authority-backed read grants; these are not fabricated submission receipts. */
    readonly restoredGraphReferences?: Readonly<Record<string, ReferenceItem>>;
}
export declare const SessionAggregateSchema: z.ZodType<SessionAggregate>;
export declare const annotationCoreDomainSpec: {
    name: string;
    version: number;
    tables: {
        sessions: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, SessionAggregate>;
    };
};
export declare class AggregateRevisionConflictError extends Error {
    readonly expected: number;
    readonly actual: number;
    constructor(expected: number, actual: number);
}
export declare class ReferenceOperationFencedError extends Error {
    readonly operationId: string;
    readonly fenceRevision: number;
    constructor(operationId: string, fenceRevision: number);
}
export declare class AdmissionConflictError extends Error {
    readonly clientSubmissionId: string;
    constructor(clientSubmissionId: string);
}
export declare class UnresolvedAdmissionError extends Error {
    readonly clientSubmissionId: string;
    constructor(clientSubmissionId: string);
}
export declare class AnnotationStoreDisposedError extends Error {
    constructor();
}
export interface AnnotationStoreOptions {
    readonly profileId: string;
}
type SessionTable = KvTable<string, SessionAggregate>;
export declare class AnnotationStore {
    readonly table: SessionTable;
    readonly options: AnnotationStoreOptions;
    readonly referenceDirectory: AnnotationReferenceDirectory;
    private readonly directoryListeners;
    private readonly tails;
    private readonly waiters;
    private disposed;
    constructor(table: SessionTable, options: AnnotationStoreOptions);
    static memoryTable(): SessionTable;
    private key;
    /** Internal synchronous view. Never mutate or return its nested values without cloning. */
    private readStored;
    read(sessionId: string): SessionAggregate;
    readPending(sessionId: string): {
        revision: number;
        pending: ReferenceSet | undefined;
    };
    readPendingState(sessionId: string): {
        revision: number;
        pendingCount: number;
    };
    addReference(sessionId: string, input: {
        expectedRevision: number;
        operationId: string;
        setId: string;
        referenceId: string;
        source: ReferenceSource;
        userComment?: string;
        createdAt: number;
    }): Promise<{
        revision: number;
        setId: string;
        referenceId: string;
        created: boolean;
    }>;
    fenceReferenceOperation(sessionId: string, input: {
        expectedRevision: number;
        operationId: string;
        now?: number;
    }): Promise<{
        state: ReferenceOperationState;
        fenceRevision: number;
    }>;
    discardPendingOperation(sessionId: string, input: {
        expectedRevision: number;
        operationId: string;
        now?: number;
        notifySource?: boolean;
    }): Promise<{
        revision: number;
        pendingCount: number;
    }>;
    updateComment(sessionId: string, input: {
        expectedRevision: number;
        referenceId: string;
        comment: string;
    }): Promise<{
        revision: number;
        pendingCount: number;
    }>;
    removeReference(sessionId: string, input: {
        expectedRevision: number;
        referenceId: string;
        now?: number;
    }): Promise<{
        revision: number;
        pendingCount: number;
    }>;
    deleteReferenceLink(sessionId: string, input: {
        expectedRevision: number;
        setId: string;
        referenceId: string;
        deletedAt: number;
    }): Promise<{
        revision: number;
        deleted: boolean;
        scope: 'pending' | 'sent';
    }>;
    readDeletedReference(sessionId: string, referenceId: string): DeletedReferenceRecord | undefined;
    restoreGraphReference(sessionId: string, source: ReferenceSource): Promise<void>;
    listRestoredGraphSets(sessionId: string): readonly ReferenceSet[];
    /** Apply a positive authoritative revocation without inventing an outbound delete job. */
    reconcileRevokedGraphReference(sessionId: string, referenceId: string): Promise<void>;
    resolveReferenceLink(sessionId: string, referenceId: string): ReferenceLinkSummary | null;
    listPendingDiscardJobs(sessionId: string): readonly PendingDiscardJob[];
    recordPendingDiscardFailure(sessionId: string, input: {
        expectedRevision: number;
        referenceId: string;
        error: string;
        updatedAt: number;
    }): Promise<{
        revision: number;
        job: PendingDiscardJob;
    }>;
    completePendingDiscard(sessionId: string, input: {
        expectedRevision: number;
        referenceId: string;
    }): Promise<{
        revision: number;
        removed: boolean;
    }>;
    listCommittedDeleteJobs(sessionId: string): readonly CommittedDeleteJob[];
    recordCommittedDeleteFailure(sessionId: string, input: {
        expectedRevision: number;
        setId: string;
        referenceId: string;
        error: string;
        updatedAt: number;
    }): Promise<{
        revision: number;
        job: CommittedDeleteJob;
    }>;
    completeCommittedDelete(sessionId: string, input: {
        expectedRevision: number;
        expectedGeneration?: number;
        setId: string;
        referenceId: string;
    }): Promise<{
        revision: number;
        removed: boolean;
    }>;
    /** Persist cleanup for a backlink acknowledged after its relation was deleted. */
    reconcileDeletedBacklink(sessionId: string, input: {
        expectedRevision: number;
        setId: string;
        item: ReferenceItem;
        updatedAt: number;
    }): Promise<boolean>;
    reuseReference(sessionId: string, input: {
        expectedRevision: number;
        sourceReferenceId: string;
        operationId: string;
        setId: string;
        referenceId: string;
        createdAt: number;
    }): Promise<{
        revision: number;
        setId: string;
        referenceId: string;
        created: boolean;
    }>;
    lockPendingForSubmission(sessionId: string, input: {
        expectedRevision: number;
        setId: string;
        referenceRevision: number;
    }): Promise<{
        revision: number;
        set: ReferenceSet;
    }>;
    markPendingCommitFailed(sessionId: string, input: {
        expectedRevision: number;
        setId: string;
    }): Promise<{
        revision: number;
        set: ReferenceSet;
    }>;
    restorePendingCommit(sessionId: string, input: {
        expectedRevision: number;
        setId: string;
    }): Promise<{
        revision: number;
        set: ReferenceSet;
    }>;
    completePendingCommit(sessionId: string, input: {
        expectedRevision: number;
        setId: string;
        committedAt: number;
        userMessageId: string;
        userAnchorId: string;
        userTextHash: string;
    }): Promise<{
        revision: number;
        set: ReferenceSet;
    }>;
    prepareAdmission(sessionId: string, input: {
        expectedRevision: number;
        clientSubmissionId: string;
        requestDigest: string;
        kind: AdmissionKind;
        setId?: string;
        referenceRevision?: number;
        createdAt: number;
    }): Promise<{
        revision: number;
        record: AdmissionRecord;
        created: boolean;
    }>;
    readAdmission(sessionId: string, clientSubmissionId: string): AdmissionRecord | undefined;
    beginAnnotatedAdmission(sessionId: string, input: {
        expectedRevision: number;
        clientSubmissionId: string;
        requestDigest: string;
        setId: string;
        referenceRevision: number;
        createdAt: number;
    }): Promise<{
        revision: number;
        record: AdmissionRecord;
        set: ReferenceSet | undefined;
        created: boolean;
    }>;
    beginPlainAdmission(sessionId: string, input: {
        expectedRevision: number;
        clientSubmissionId: string;
        requestDigest: string;
        createdAt: number;
    }): Promise<{
        revision: number;
        record: AdmissionRecord;
        created: boolean;
    }>;
    recordEnqueuedSubmission(sessionId: string, input: {
        userMessage?: SubmittedMessage;
        expectedRevision: number;
        clientSubmissionId: string;
        requestDigest: string;
        userMessageId: string;
        contextMessageId?: string;
        contextDigest?: string;
        userTextHash?: string;
        preparedSet?: ReferenceSet;
        createdAt: number;
    }): Promise<{
        revision: number;
        admission: AdmissionRecord;
        journal: SubmissionJournalEntry | undefined;
        created: boolean;
    }>;
    readSubmissionJournal(sessionId: string, userMessageId: string): SubmissionJournalEntry | undefined;
    failAdmissionAndRestorePending(sessionId: string, input: {
        expectedRevision: number;
        clientSubmissionId: string;
        error: string;
        updatedAt: number;
    }): Promise<{
        revision: number;
        admission: AdmissionRecord;
        pending: ReferenceSet | undefined;
    }>;
    finalizeDurableSubmission(sessionId: string, input: {
        expectedRevision: number;
        clientSubmissionId: string;
        userMessageId: string;
        userObserved: boolean;
        contextObserved: boolean;
        committedAt: number;
    }): Promise<{
        revision: number;
        admission: AdmissionRecord;
        sent: ReferenceSet | undefined;
    }>;
    listBacklinkJobs(sessionId: string): readonly BacklinkJob[];
    recordBacklinkResult(sessionId: string, input: {
        expectedRevision: number;
        setId: string;
        referenceId: string;
        receipt?: ReferenceCommitReceipt;
        error?: string;
        updatedAt: number;
    }): Promise<{
        revision: number;
        job: BacklinkJob;
    }>;
    sessionIds(): readonly string[];
    recordSubmissionJournal(sessionId: string, input: {
        expectedRevision: number;
        userMessageId: string;
        clientSubmissionId: string;
        requestDigest: string;
        setId?: string;
        contextMessageId?: string;
        contextDigest?: string;
        preparedSet?: ReferenceSet;
        createdAt: number;
    }): Promise<{
        revision: number;
        record: SubmissionJournalEntry;
        created: boolean;
    }>;
    recordFlushReconciliation(sessionId: string, input: {
        expectedRevision: number;
        userMessageId: string;
        userObserved: boolean;
        contextObserved: boolean;
        flushState: FlushReconciliationRecord['flushState'];
        lastError?: string;
        updatedAt: number;
    }): Promise<{
        revision: number;
        record: FlushReconciliationRecord;
    }>;
    enqueueBacklink(sessionId: string, input: {
        expectedRevision: number;
        setId: string;
        referenceId: string;
        createdAt: number;
    }): Promise<{
        revision: number;
        job: BacklinkJob;
        created: boolean;
    }>;
    retryBacklink(sessionId: string, input: {
        expectedRevision: number;
        setId: string;
        referenceId: string;
        updatedAt?: number;
    }): Promise<{
        revision: number;
        job: BacklinkJob;
    }>;
    findSentReference(referenceId: string): {
        sessionId: string;
        set: ReferenceSet;
        item: ReferenceItem;
    } | undefined;
    /** Rehydrate a verified persisted submission; never fabricate an admission or resend a backlink. */
    restoreSentSnapshot(sessionId: string, snapshot: ReferenceSet, deleted?: readonly DeletedReferenceRecord[]): Promise<void>;
    readSentSet(sessionId: string, setId: string): ReferenceSet | undefined;
    listSentForSession(sessionId: string): readonly ReferenceSet[];
    waitRevision(sessionId: string, afterRevision: number, signal?: AbortSignal): Promise<{
        revision: number;
        pending: ReferenceSet | undefined;
    }>;
    close(): void;
    private pendingSummary;
    private assertOpen;
    private mutate;
    private notify;
}
export interface OpenAnnotationStore {
    readonly store: AnnotationStore;
    readonly table: SessionTable;
    readonly domain: Domain<typeof annotationCoreDomainSpec>;
    close(): Promise<void>;
}
export declare function openAnnotationStore(ctx: Context, profileId: string): Promise<OpenAnnotationStore>;
export {};
//# sourceMappingURL=store.d.ts.map