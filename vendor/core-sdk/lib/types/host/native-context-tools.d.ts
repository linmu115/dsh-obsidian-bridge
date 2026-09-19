import type { Context } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
import { type NativeContextHost } from './native-context-contract.ts';
import { NativeSurfaceController } from './native-context-surface.ts';
import type { UpstreamToolBudgets } from './upstream-budget.ts';
export declare const NATIVE_CONTEXT_TOOL_NAMES: string[];
export declare function nativeExecutionId(agent: Agent): string;
/** A large stored document is never returned verbatim to the model. Cursor binds graph and context revisions. */
export declare function nativeContextPage(result: unknown, input: Record<string, unknown>, maxBytes?: number): {
    items: any[];
    hasMore: boolean;
    nextCursor: string | null;
    meaning?: string;
    protocolVersion: number;
    ownerSessionId: any;
    objectId: any;
    revision: any;
    graphRevision: any;
    section: string;
    counts: {
        [k: string]: number;
    };
    snapshot: string;
    measurement: string;
    coverageTruncated: boolean;
};
export declare function nativeContextToolDefinitions(host: NativeContextHost, controller: NativeSurfaceController, budgets: UpstreamToolBudgets): import("@deepseek-ai/dsh-tools").ToolDefinition[];
/** Scoped registrations participate in normal DSH policy, cancellation, presentation and disposal. No managed export. */
export declare function registerNativeContextTools(ctx: Context, budgets: UpstreamToolBudgets): void;
/** Graph-activated references have their own authority; never manufacture a user submission receipt. */
export declare function nativeActivatedSource(ctx: Context, agent: Agent, referenceId: string, signal: AbortSignal): Promise<{
    referenceId: string;
    sourceVersionId: string;
    cutoffEventId: string;
    enabled: boolean;
    authorityState: string;
    activation?: unknown;
} | undefined>;
//# sourceMappingURL=native-context-tools.d.ts.map