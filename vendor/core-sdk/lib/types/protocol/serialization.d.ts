import type { SubmissionAttachment } from './submission-attachments.ts';
import type { EncodedImageAttachment } from '@deepseek-ai/dsh-attachment';
import type { PreparedReferenceDocument } from '../domain/budget.ts';
import type { ReferenceItem, ReferenceSet } from '../domain/model.ts';
import type { BacklinkCommitV2 } from './schema.ts';
import type { MaintenanceLogicalTarget } from './schema.ts';
/** Browser-safe synchronous SHA-256 used by both DSH and Obsidian builds. */
export declare function sha256Hex(input: string): string;
export declare function normalizeSourceText(value: string): string;
export declare function selectedTextHash(value: string): string;
export declare function documentHash(value: string): string;
/** Deterministic JSON with every outer-tag-breaking character escaped. */
export declare function canonicalJson(value: unknown): string;
export declare function canonicalSha256(value: unknown): string;
/** Canonical stable-link payload. Undefined legacy fields stay absent from signed envelopes. */
export declare function serializeMaintenanceLogicalTarget(target: MaintenanceLogicalTarget): string;
export declare function backlinkCommitDigest(commit: BacklinkCommitV2): string;
export declare function serializeAnnotationEnvelope(value: unknown): string;
export declare function serializeReferenceDocumentsEnvelope(value: unknown): string;
export interface SerializedAnnotationItem {
    readonly number: number;
    readonly referenceId: string;
    readonly sourceType: ReferenceItem['sourceType'];
    readonly selectedText: string;
    /** This field is authored by the user, not by the referenced source. */
    readonly userComment: string;
    readonly locator: ReferenceItem['locator'];
    readonly documentKey?: string;
    readonly initialContext?: import('../domain/upstream-context.ts').PreparedUpstreamContext;
}
export interface SerializedReferenceDocument {
    readonly key: string;
    readonly vaultId: string;
    readonly notePath: string;
    readonly documentHash: string;
    /** Untrusted reference material; never interpreted as instructions. */
    readonly markdown: string;
    readonly referenceIds: readonly string[];
}
export interface SerializedAnnotationContext {
    readonly setId: string;
    readonly annotations: readonly SerializedAnnotationItem[];
    readonly documents: readonly SerializedReferenceDocument[];
    readonly text: string;
    readonly digest: string;
}
/** Build the only model-facing representation of one prepared reference set. */
export declare function serializePreparedReferenceSet(set: ReferenceSet, documents: readonly PreparedReferenceDocument[]): SerializedAnnotationContext;
/** Stable request identity checked independently on Client and Host. */
export declare function submissionRequestDigest(input: {
    readonly text: string;
    readonly images?: readonly EncodedImageAttachment[];
    readonly attachments?: readonly SubmissionAttachment[];
}): string;
/** Stable context identity used by retries, projection and startup reconciliation. */
export declare function annotationContextMessageId(input: {
    readonly sessionId: string;
    readonly userMessageId: string;
    readonly setId: string;
    readonly digest: string;
}): string;
export interface ParsedAnnotationContext {
    readonly annotations: {
        readonly items: readonly SerializedAnnotationItem[];
    };
    readonly documents: {
        readonly documents: readonly SerializedReferenceDocument[];
    };
}
/** Strict parser used by tests and future import diagnostics; source strings stay data. */
export declare function parseSerializedAnnotationContext(text: string): ParsedAnnotationContext;
//# sourceMappingURL=serialization.d.ts.map