import type { Context } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
/** Optional versioned Host contract; credentials and execution scope never enter model arguments. */
export interface NativeContextHost {
    readonly protocolVersion: 1;
    readonly capabilities: {
        readonly nativeSurface: true;
        readonly tools: true;
    };
    request<T = unknown>(nativeSessionId: string, operation: string, input: object, signal?: AbortSignal): Promise<T>;
}
export interface NativeMaterial {
    materialId: string;
    eventSeq: number;
    referenceIds: string[];
    kind: 'initial' | 'read' | 'search' | 'requests';
    bytes: number;
    contentHash: string;
    ranges: {
        referenceId: string;
        eventId: string;
        start: number;
        end: number;
    }[];
    sourceEventSeqs?: number[];
}
export interface NativeReleasePlan {
    operationId: string;
    materialIds: string[];
    state: string;
}
export declare function nativeContextHost(ctx: Context): NativeContextHost | undefined;
export declare function isNativeContextAgent(agent: Agent): boolean;
export declare function requireNativeContextAgent(agent: Agent | undefined): Agent;
//# sourceMappingURL=native-context-contract.d.ts.map