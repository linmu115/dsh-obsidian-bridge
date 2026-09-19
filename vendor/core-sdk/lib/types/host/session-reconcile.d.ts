import type { Context } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
import type { InputAcceptance } from '../public/host-api.ts';
import type { Session, SessionSeq } from '@deepseek-ai/dsh-session';
import type { BacklinkOutbox } from './backlink-outbox.ts';
import { type AnnotationStore } from './store.ts';
export interface SettlementResult {
    readonly userObserved: true;
    readonly contextObserved: boolean;
}
export interface SubmissionSettlement {
    readonly promise: Promise<SettlementResult>;
    /** Arm the idle failure only after `agent.send()` has synchronously accepted the wake. */
    afterSend(): void;
}
export type SettlementErrorCode = 'idle' | 'flush' | 'disposed' | 'aborted' | 'unconfirmed';
export declare class SettlementError extends Error {
    readonly code: SettlementErrorCode;
    readonly userObserved: boolean;
    readonly contextObserved: boolean;
    constructor(code: SettlementErrorCode, message: string, userObserved?: boolean, contextObserved?: boolean, options?: ErrorOptions);
}
/** Read exact saved receipt identities without starting or retrying execution. */
export declare function submissionAcceptance(ctx: Context, agent: Agent, userMessageId: string, contextMessageId?: string): InputAcceptance;
export declare function scanSubmissionEvents(session: Session, userMessageId: string, contextMessageId?: string): {
    userObserved: boolean;
    contextObserved: boolean;
    userSeq?: SessionSeq;
};
/** Per-message settlement barrier over the public session event and flush APIs. */
export declare class SessionSettlementTracker {
    readonly ctx: Context;
    private readonly waiters;
    private closed;
    constructor(ctx: Context);
    begin(agent: Agent, input: {
        readonly userMessageId: string;
        readonly contextMessageId?: string;
        readonly signal?: AbortSignal;
    }): SubmissionSettlement;
    private observe;
    private checkReceipt;
    private armIdle;
    private succeed;
    private fail;
    private cleanup;
    disposeAgent(agent: Agent): void;
    close(): void;
}
/** Restart/HMR adoption of admissions whose Remote response or flush was interrupted. */
export declare class StartupSubmissionReconciler {
    readonly ctx: Context;
    readonly store: AnnotationStore;
    readonly outbox: BacklinkOutbox;
    readonly now: () => number;
    constructor(ctx: Context, store: AnnotationStore, outbox: BacklinkOutbox, now?: () => number);
    start(): void;
    reconcile(agent: Agent): Promise<void>;
    private reconcileAdmission;
    private finalize;
    private recordFailure;
    private failTerminal;
}
//# sourceMappingURL=session-reconcile.d.ts.map