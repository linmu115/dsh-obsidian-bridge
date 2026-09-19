import type { Session } from '@deepseek-ai/dsh-session';
import type { NativeContextHost } from './native-context-contract.ts';
/** Only failure to query the optional Host may degrade an otherwise unrelated chat. */
export declare class NativeContextHostUnavailable extends Error {
}
/** Only tool-owned, persisted metadata is used; arbitrary strings and user-authored JSON are never classifiers. */
export declare function nativeMaterialMeta(kind: 'read' | 'search' | 'requests', args: unknown, output: unknown): {
    nativeContext: {
        protocolVersion: number;
        plugin: string;
        kind: "search" | "read" | "requests";
        referenceIds: string[];
        ranges: {
            referenceId: string;
            eventId: string;
            start: any;
            end: any;
        }[];
    };
} | undefined;
declare module '@deepseek-ai/dsh-llm' {
    interface MessageSourceMap {
        'dsh-native-context-release': {
            kind: 'dsh-native-context-release';
            protocolVersion: 1;
            plugin: string;
            operationIds: string[];
            materialIds: string[];
            originalEventSeq: number;
            setId: string;
            targetUserMessageId: string;
        };
    }
}
/** Durable Engine intent + native replacement evidence permit safe retry after either side restarts. */
export declare class NativeSurfaceController {
    private readonly host;
    private readonly registered;
    private readonly issues;
    constructor(host: NativeContextHost);
    registrationState(session: Session): {
        unregisteredMaterials: number;
        state: "ready" | "registration-pending";
        reason?: string;
    };
    hasRetainedMaterials(session: Session): boolean;
    private registerMaterials;
    synchronize(session: Session, executionId: string, signal: AbortSignal, applyPending?: boolean): Promise<void>;
}
//# sourceMappingURL=native-context-surface.d.ts.map