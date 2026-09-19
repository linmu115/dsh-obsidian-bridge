import type { Context } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
import type { ReferenceSet } from '../domain/model.ts';
import { type AnnotationStore } from './store.ts';
import type { HostSourceRegistry } from './source-registry.ts';
/** Read submitted snapshots and the calling execution's exact prepared batch. */
export declare function availableReferenceSets(store: AnnotationStore, agent: Agent): readonly ReferenceSet[];
/** Count already admitted material once for this user turn, including envelope escaping. */
export declare function currentInitialUpstreamBytes(store: AnnotationStore, agent: Agent): number;
/** Register read-only tools in the normal DSH policy and result pipeline. */
export declare function registerReferenceTools(ctx: Context, store: AnnotationStore, sources: HostSourceRegistry): void;
//# sourceMappingURL=reference-tools.d.ts.map