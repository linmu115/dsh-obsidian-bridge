import type { AnnotationDirectoryEntry, AnnotationDirectoryQuery } from '../public/host-api.ts';
import type { SessionAggregate } from './store.ts';
export declare class AnnotationDirectoryChangedError extends Error {
    constructor();
}
export declare function referenceDirectorySessions(profileId: string, items: readonly {
    nativeSessionId: string;
    sourceRevision: number;
}[], input: AnnotationDirectoryQuery): {
    items: {
        nativeSessionId: string;
        sourceRevision: number;
    }[];
    nextCursor: string | null;
};
/** Legacy aggregates initially retain their last acknowledged export revision. */
export declare function referenceDirectoryRevision(aggregate: SessionAggregate): number;
/** Store mutations preserve these readonly collection identities when changing internal jobs only. */
export declare function referenceDirectoryChanged(before: SessionAggregate, after: SessionAggregate): boolean;
/** Select pointers first, then copy only the requested page. No snapshot/journal traversal. */
export declare function referenceDirectoryEntries(aggregate: SessionAggregate, input: AnnotationDirectoryQuery): {
    nativeSessionId: string;
    sourceRevision: number;
    items: AnnotationDirectoryEntry[];
    nextCursor: string | null;
};
//# sourceMappingURL=reference-directory.d.ts.map