import { Service } from '@deepseek-ai/cordis';
import { InputAcceptanceRegistry } from './input-acceptance.ts';
import type { Context } from '@deepseek-ai/cordis';
import type { ReferenceItem } from '../domain/model.ts';
import type { ReferenceCommitReceipt } from './reference-commit-receipt.ts';
import type { SourceType } from '../protocol/index.ts';
import type { AnnotationCoreHost, DeletedReferenceBinding, HostSourceAdapter, SentReferenceBinding } from '../public/host-api.ts';
export type SourcePreparationErrorCode = 'offline' | 'online-refresh-failed' | 'source-missing' | 'source-changed' | 'protocol-mismatch';
export interface HostSourceRegistryOptions {
    readonly referenceDirectory?: AnnotationCoreHost['referenceDirectory'];
    readonly listReferences?: NonNullable<AnnotationCoreHost['listReferences']>;
    readonly deleteReferenceLink?: (sessionId: string, setId: string, referenceId: string) => Promise<{
        deleted: boolean;
        scope: 'pending' | 'sent';
    }>;
}
export declare class SourcePreparationError extends Error {
    readonly code: SourcePreparationErrorCode;
    constructor(code: SourcePreparationErrorCode, message: string, options?: ErrorOptions);
}
export declare class HostSourceRegistry extends Service implements AnnotationCoreHost {
    private readonly options;
    get referenceDirectory(): import("../index.ts").AnnotationReferenceDirectory | undefined;
    readonly inputAcceptance: InputAcceptanceRegistry;
    private readonly adapters;
    private readonly adapterListeners;
    constructor(ctx: Context, options?: HostSourceRegistryOptions);
    listReferences(...args: Parameters<NonNullable<AnnotationCoreHost['listReferences']>>): readonly import("../domain/model.ts").ReferenceSet[];
    deleteReferenceLink(sessionId: string, setId: string, referenceId: string): Promise<{
        deleted: boolean;
        scope: 'pending' | 'sent';
    }>;
    registerSourceAdapter(type: SourceType, adapter: HostSourceAdapter): () => void;
    onAdapterRegistered(listener: (type: SourceType) => void): () => void;
    require(type: SourceType): HostSourceAdapter;
    get(type: SourceType): HostSourceAdapter | undefined;
    prepare(item: ReferenceItem, signal: AbortSignal): Promise<ReferenceItem>;
    prepareUpstreamContext(item: ReferenceItem, executionId: string, maxBytes: number, totalBytes: number, signal: AbortSignal): Promise<{
        kind: "selected-turn";
        sourceVersionId: string;
        cutoffEventId: string;
        items: {
            eventId: string;
            role: string;
            text: string;
            offset: number;
            complete: boolean;
        }[];
        turnComplete: boolean;
        nextCursor: string | null;
        hasMore: boolean;
        omittedIntermediateItems?: number | undefined;
        detailsCursor?: string | undefined;
        disclosureRequestId?: string | undefined;
    }>;
    endUpstreamExecution(targetSessionId: string, executionId: string): Promise<void>;
    discardPending(item: ReferenceItem): Promise<boolean>;
    commitBacklink(binding: SentReferenceBinding): Promise<ReferenceCommitReceipt | undefined>;
    deleteCommitted(binding: DeletedReferenceBinding): Promise<void>;
}
//# sourceMappingURL=source-registry.d.ts.map