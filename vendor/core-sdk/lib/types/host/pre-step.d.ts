import type { Context } from '@deepseek-ai/cordis';
import type { Agent, PreStepDecision } from '@deepseek-ai/dsh-agent';
import type { UserMessage } from '@deepseek-ai/dsh-llm';
import type { AnnotationStore } from './store.ts';
export interface AnnotationPreStepPayload {
    readonly agent: Agent;
    readonly messages: UserMessage[];
    readonly turn: number;
    readonly step: number;
    readonly signal: AbortSignal;
}
/** ID-bound transformation; pending state alone can never inject or consume context. */
export declare function annotationPreStep(store: AnnotationStore, payload: AnnotationPreStepPayload, next: () => Promise<PreStepDecision>): Promise<PreStepDecision>;
export declare function registerAnnotationPreStep(ctx: Context, store: AnnotationStore): () => boolean;
//# sourceMappingURL=pre-step.d.ts.map