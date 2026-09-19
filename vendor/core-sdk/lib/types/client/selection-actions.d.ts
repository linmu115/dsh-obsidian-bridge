import type { DshMessageCapture } from '../protocol/index.ts';
/** A consumer contributes an action, never another DOM selection listener. */
export interface SelectionAction {
    readonly id: string;
    readonly label: string | (() => string);
    readonly order?: number;
    readonly iconPath?: string;
    available?(capture: DshMessageCapture): boolean;
    run(capture: DshMessageCapture): Promise<unknown>;
}
export declare class SelectionActions {
    private readonly actions;
    private snapshot;
    private readonly listeners;
    getSnapshot: () => readonly SelectionAction[];
    subscribe: (notify: () => void) => (() => void);
    register(action: SelectionAction): () => void;
    private changed;
}
//# sourceMappingURL=selection-actions.d.ts.map