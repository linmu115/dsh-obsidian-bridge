import type { Context } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
import type { SubmissionResult } from './submit-annotated.ts';
/** Optional presentation owner. Never changes admission, budget or reference ordering. */
export declare function withSubmissionProgress(ctx: Context, agent: Agent, input: {
    clientSubmissionId: string;
    text: string;
}, signal: AbortSignal, submit: () => Promise<SubmissionResult>): Promise<SubmissionResult>;
//# sourceMappingURL=submission-progress.d.ts.map