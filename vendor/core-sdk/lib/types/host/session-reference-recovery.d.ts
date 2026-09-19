import type { Agent } from '@deepseek-ai/dsh-agent';
import type { AnnotationStore } from './store.ts';
/** Message content and its verified snapshot, not a recycled native ID, prove ownership. */
export declare function restoreSessionReferences(store: AnnotationStore, agent: Agent): Promise<void>;
//# sourceMappingURL=session-reference-recovery.d.ts.map