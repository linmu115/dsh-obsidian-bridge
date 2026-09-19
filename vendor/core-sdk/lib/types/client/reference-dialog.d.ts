import type { ReferenceSet } from '../domain/model.ts';
import type { ClientSourceRegistry } from './source-registry.ts';
export interface AnnotationDialogSnapshot {
    readonly open: boolean;
    readonly set?: ReferenceSet;
    readonly focusReferenceId?: string;
    readonly anchor?: DOMRect;
    readonly editable: boolean;
}
export declare class AnnotationDialogController {
    private snapshot;
    private readonly listeners;
    getSnapshot: () => AnnotationDialogSnapshot;
    subscribe: (listener: () => void) => (() => void);
    private emit;
    open(set: ReferenceSet, focusReferenceId?: string, anchor?: DOMRect): void;
    replace(set: ReferenceSet): void;
    close(): void;
}
export interface ReferenceDialogProps {
    readonly controller: AnnotationDialogController;
    readonly sources: ClientSourceRegistry;
    readonly updateComment: (referenceId: string, comment: string) => Promise<void>;
    readonly remove: (referenceId: string) => Promise<void>;
    readonly deleteLink: (setId: string, referenceId: string) => Promise<void>;
    readonly reuse: (referenceId: string) => Promise<void>;
    readonly retryBacklink: (setId: string, referenceId: string) => Promise<void>;
}
export declare function ReferenceDialog({ controller, sources, updateComment, remove, deleteLink, reuse, retryBacklink }: ReferenceDialogProps): import("react").ReactPortal | null;
//# sourceMappingURL=reference-dialog.d.ts.map