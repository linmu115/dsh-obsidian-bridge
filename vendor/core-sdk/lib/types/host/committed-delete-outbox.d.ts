import type { HostSourceRegistry } from './source-registry.ts';
import type { AnnotationStore } from './store.ts';
export interface CommittedDeleteOutboxOptions {
    readonly now?: () => number;
    readonly retryDelayMs?: number;
}
/** Delivers committed-reference cleanup after Core has durably removed the relation. */
export declare class CommittedDeleteOutbox {
    readonly store: AnnotationStore;
    readonly sources: HostSourceRegistry;
    private readonly active;
    private readonly timers;
    private readonly now;
    private readonly retryDelayMs;
    private disposed;
    constructor(store: AnnotationStore, sources: HostSourceRegistry, options?: CommittedDeleteOutboxOptions);
    start(): void;
    kickAll(): void;
    kick(sessionId: string): void;
    runPending(sessionId: string): Promise<void>;
    dispose(): void;
    private runOne;
    private deliver;
    private complete;
    private recordFailure;
    private scheduleRetry;
    private clearTimer;
}
//# sourceMappingURL=committed-delete-outbox.d.ts.map