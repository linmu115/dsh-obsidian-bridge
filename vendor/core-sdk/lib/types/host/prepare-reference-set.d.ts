import type { PreparedReferenceDocument, ReferenceBudgetOptions, SourceBudgetDetail } from '../domain/budget.ts';
import type { ReferenceSet } from '../domain/model.ts';
import type { HostSourceRegistry } from './source-registry.ts';
export type PrepareResult = {
    readonly kind: 'ready';
    readonly set: ReferenceSet;
    readonly estimatedTokens: number;
    readonly limit: number;
    readonly documents: readonly PreparedReferenceDocument[];
    readonly budgetBasis?: ReferenceBudgetOptions['basis'];
} | {
    readonly kind: 'needs-confirmation';
    readonly reason: 'online-refresh-failed';
    readonly referenceIds: readonly string[];
} | {
    readonly kind: 'blocked';
    readonly reason: 'source-changed' | 'source-missing' | 'over-budget';
    readonly details: readonly SourceBudgetDetail[];
};
export interface PrepareReferenceSetOptions {
    readonly budget?: ReferenceBudgetOptions;
    readonly useSavedSnapshotFor?: ReadonlySet<string>;
    readonly signal?: AbortSignal;
    readonly upstreamExecutionId?: string;
}
export declare function prepareReferenceSet(set: ReferenceSet, registry: HostSourceRegistry, options?: PrepareReferenceSetOptions): Promise<PrepareResult>;
//# sourceMappingURL=prepare-reference-set.d.ts.map