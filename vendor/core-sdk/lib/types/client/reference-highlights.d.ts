import type { ReferenceItem, ReferenceSet } from '../domain/model.ts';
export declare class ReferenceHighlightStore {
    readonly sets: Map<string, ReferenceSet>;
    private listeners;
    update(key: string, set: ReferenceSet | null): void;
    subscribe: (listener: () => void) => () => void;
}
/** Rebuild ranges from durable locators, never wrap or rewrite message DOM. */
export declare function referenceRange(root: HTMLElement, text: string, occurrence: number): Range | null;
export declare function ReferenceHighlights({ store, currentSession, subscribeSession, resolveAnchor }: {
    store: ReferenceHighlightStore;
    currentSession(): string | undefined;
    subscribeSession(listener: () => void): () => void;
    resolveAnchor(item: ReferenceItem): string;
}): null;
//# sourceMappingURL=reference-highlights.d.ts.map