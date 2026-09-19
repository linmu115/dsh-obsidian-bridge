import type { HostSourceRegistry } from './source-registry.ts';
import type { AnnotationStore } from './store.ts';
export interface PendingDiscardOutboxOptions {
    readonly now?: () => number;
    readonly retryDelayMs?: number;
}
export declare class PendingDiscardOutbox {
    readonly store: AnnotationStore;
    readonly sources: HostSourceRegistry;
    private readonly active;
    private readonly timers;
    private readonly now;
    private readonly retryDelayMs;
    private disposed;
    constructor(store: AnnotationStore, sources: HostSourceRegistry, options?: PendingDiscardOutboxOptions);
    start(): void;
    kickAll(): void;
    kick(sessionId: string): void;
    runPending(sessionId: string): Promise<void>;
    dispose(): void;
    private runOne;
    private discard;
    private complete;
    private recordFailure;
    private scheduleRetry;
    private clearTimer;
}
//# sourceMappingURL=pending-discard-outbox.d.ts.map