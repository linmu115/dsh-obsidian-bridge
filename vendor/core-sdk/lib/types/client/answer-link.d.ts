import type { ReferenceSet } from '../domain/model.ts';
export interface AnnotationAnswerTarget {
    readonly setId: string;
    readonly number: number;
}
export interface AnnotationSessionTarget {
    readonly logicalSessionId?: string;
    readonly logicalAnchorId?: string;
    readonly sessionId: string;
    readonly anchorId: string;
}
export type AnnotationSessionTargetResolver = (target: {
    readonly logicalSessionId: string;
    readonly logicalAnchorId?: string;
    readonly legacySessionId: string;
    readonly legacyAnchorId: string;
}) => Promise<{
    readonly sessionId: string;
    readonly anchorId?: string;
} | undefined>;
/** Resolve once at navigation time; historical native IDs remain a non-blocking fallback. */
export declare function resolveAnnotationSessionTarget(target: AnnotationSessionTarget, resolver?: AnnotationSessionTargetResolver): Promise<{
    readonly sessionId: string;
    readonly anchorId: string;
}>;
/** Parse only the versioned, same-document fragment emitted by the core prompt. */
export declare function parseAnnotationAnswerLink(href: string): AnnotationAnswerTarget | undefined;
export declare function resolveAnnotationAnswerLink(href: string, sets: readonly ReferenceSet[]): {
    readonly set: ReferenceSet;
    readonly referenceId: string;
    readonly number: number;
} | undefined;
//# sourceMappingURL=answer-link.d.ts.map