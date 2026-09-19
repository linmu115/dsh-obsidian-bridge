import type { Context } from '@deepseek-ai/cordis';
import type { ReferenceItem } from '../domain/model.ts';
import type { DshMessageCapture, DshMessageReferenceSource } from '../protocol/index.ts';
/** Structural subset of the optional host capability; Engine owns the full DTO and all range rules. */
export interface UpstreamHost {
    readonly protocolVersion: 1;
    directory(workspaceId?: string, after?: string): Promise<{
        items: {
            id: string;
            title: string;
        }[];
        nextCursor: string | null;
    }>;
    capture(input: {
        operationId: string;
        sourceNativeSessionId: string;
        targetNativeSessionId: string;
        anchorId: string;
        selectedText: string;
        expectedSourceVersionId?: string;
    }): Promise<{
        referenceId: string;
        sourceTitle: string;
        sourceVersionId: string;
        cutoffEventId: string;
        selectedText: string;
    }>;
    inspect(targetNativeSessionId: string, referenceId: string): Promise<{
        selectedText: string;
        sourceVersionId: string;
        cutoffEventId: string;
    }>;
    bind(targetNativeSessionId: string, referenceId: string, targetMessageId: string | null): Promise<unknown>;
    describe?(targetNativeSessionId: string, referenceId: string): Promise<unknown>;
    status?(targetNativeSessionId: string, referenceId: string): Promise<{
        referenceId: string;
        state: 'pending' | 'sent' | 'revoked';
    }>;
    settleRead?(targetNativeSessionId: string, referenceId: string, requestId: string, delivery: 'returned' | 'failed'): Promise<unknown>;
    read(input: {
        targetNativeSessionId: string;
        referenceId: string;
        executionId: string;
        requestId?: string;
        userRequestId?: string;
        cursor?: string;
        query?: string;
        view?: 'selected-turn';
        maxBytes: number;
        totalBytes: number;
    }): Promise<unknown>;
    endExecution?(targetNativeSessionId: string, executionId: string): Promise<unknown>;
}
export declare function upstreamHost(ctx: Context): UpstreamHost;
export declare function upstreamOf(item: ReferenceItem): {
    kind: "fixed-upstream";
    referenceId: string;
    sourceTitle: string;
    sourceVersionId: string;
    cutoffEventId: string;
    targetSessionId: string;
} | undefined;
export declare function captureUpstream(ctx: Context, targetSessionId: string, profileId: string, capture: DshMessageCapture, operationId: string): Promise<DshMessageReferenceSource>;
export declare function inspectUpstream(ctx: Context, item: ReferenceItem): Promise<void>;
/** Resolve the saved immutable reference through the target-scoped host, never a fresh capture. */
export declare function describeGraphUpstream(ctx: Context, targetSessionId: string, profileId: string, referenceId: string): Promise<{
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
export declare function prepareInitialUpstream(ctx: Context, item: ReferenceItem, executionId: string, maxBytes: number, totalBytes: number): Promise<{
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
//# sourceMappingURL=upstream.d.ts.map