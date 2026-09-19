import type { Context } from '@deepseek-ai/cordis';
import { type Agent } from '@deepseek-ai/dsh-agent';
import { type UserMessage, type LlmResolvedModelInfo } from '@deepseek-ai/dsh-llm';
import type { ReferenceBudgetOptions } from '../domain/budget.ts';
export declare function submissionBudgetScope(agent: Agent, allowContextCheckpoints?: boolean): string;
/** Count the proposed request, including provider-owned media representations, before reading a source. */
export declare function submissionReferenceBudget(ctx: Context, agent: Agent, message: UserMessage, selection: {
    provider: string;
    model: string;
} | undefined, model: LlmResolvedModelInfo | undefined, signal?: AbortSignal): Promise<ReferenceBudgetOptions>;
//# sourceMappingURL=submission-budget.d.ts.map