import type { ReferenceItem, ReferenceSet } from './model.ts';
export declare const FALLBACK_CONTEXT_WINDOW = 65536;
export declare const REFERENCE_BUDGET_RATIO = 0.2;
export type SourceBudgetIssue = 'over-budget' | 'source-changed' | 'source-missing' | 'adapter-unavailable' | 'protocol-mismatch';
export interface PreparedReferenceDocument {
    readonly key: string;
    readonly vaultId: string;
    readonly notePath: string;
    readonly documentHash: string;
    readonly markdown: string;
    readonly referenceIds: readonly string[];
}
export interface SourceBudgetDetail {
    readonly referenceId: string;
    readonly sourceType: ReferenceItem['sourceType'];
    readonly estimatedTokens: number;
    readonly totalEstimatedTokens: number;
    readonly limit: number;
    readonly overBy: number;
    readonly issue: SourceBudgetIssue;
    readonly notePath?: string;
    readonly message?: string;
}
export interface ReferenceBudgetOptions {
    readonly contextWindow?: number;
    readonly countTokens?: (text: string) => number;
    readonly maxTokens?: number;
    readonly includeEnvelope?: boolean;
    readonly basis?: 'model-metadata' | 'new-thread' | 'verified-thread' | 'conservative';
    readonly validateScope?: () => Promise<void>;
}
export interface ReferenceBudgetResult {
    readonly contextWindow: number;
    readonly estimatedTokens: number;
    readonly limit: number;
    readonly overBudget: boolean;
    readonly documents: readonly PreparedReferenceDocument[];
    readonly details: readonly SourceBudgetDetail[];
}
export declare function collectReferenceDocuments(set: ReferenceSet): readonly PreparedReferenceDocument[];
export declare function estimateUtf8Tokens(text: string): number;
export declare function calculateReferenceBudget(set: ReferenceSet, options?: ReferenceBudgetOptions): ReferenceBudgetResult;
//# sourceMappingURL=budget.d.ts.map