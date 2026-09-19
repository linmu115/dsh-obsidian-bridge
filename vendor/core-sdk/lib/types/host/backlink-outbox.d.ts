import type { AnnotationStore, BacklinkJob } from './store.ts';
import type { HostSourceRegistry } from './source-registry.ts';
export declare class BacklinkOutbox {
    readonly store: AnnotationStore;
    readonly sources: HostSourceRegistry;
    readonly now: () => number;
    readonly onCleanup?: ((sessionId: string) => void) | undefined;
    private readonly active;
    constructor(store: AnnotationStore, sources: HostSourceRegistry, now?: () => number, onCleanup?: ((sessionId: string) => void) | undefined);
    kick(sessionId: string): void;
    runPending(sessionId: string): Promise<void>;
    retry(sessionId: string, setId: string, referenceId: string): Promise<BacklinkJob>;
    private runOne;
    private commit;
    private record;
    private cleanupDeleted;
}
//# sourceMappingURL=backlink-outbox.d.ts.map