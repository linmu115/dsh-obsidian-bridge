import type { Context } from '@deepseek-ai/cordis';
import type { AnnotationStore } from './store.ts';
/** Offline or unknown identities never imply deletion. Only a positive authority tombstone does. */
export declare function reconcileGraphRevocations(ctx: Context, store: AnnotationStore, sessionId: string, pendingOnly?: boolean, referenceIds?: readonly string[]): Promise<void>;
//# sourceMappingURL=graph-reference-recovery.d.ts.map