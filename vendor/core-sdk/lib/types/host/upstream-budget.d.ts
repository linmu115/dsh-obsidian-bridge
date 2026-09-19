import type { Agent } from '@deepseek-ai/dsh-agent';
export interface NativeUpstreamUsage {
    readonly executionId: string;
    readonly modelContextWindow: number;
    readonly inputTokens: number;
    readonly outputTokens: number;
}
/** One UTF-8 byte per token is deliberately conservative; this is not a tokenizer. */
export declare function upstreamHeadroom(contextWindow: number | undefined, request: unknown, maxTokens?: number): number;
/** The model never chooses its execution ID or allowance. Simultaneous calls reserve before awaiting. */
export declare class UpstreamToolBudgets {
    private readonly nativeUsageFor?;
    private readonly initialBytesFor?;
    private readonly turns;
    constructor(nativeUsageFor?: ((sessionId: string) => NativeUpstreamUsage | undefined) | undefined, initialBytesFor?: ((agent: Agent) => number) | undefined);
    reserve(agent: Agent, requested?: number): {
        executionId: string;
        bytes: number;
        totalBytes: number;
        settle(value?: string): void;
    };
    end(sessionId: string): string | undefined;
}
//# sourceMappingURL=upstream-budget.d.ts.map