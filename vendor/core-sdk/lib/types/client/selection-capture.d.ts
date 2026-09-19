/** rc.2 DOM selection capture. The DOM attributes are compatibility hooks. */
export declare const ASSISTANT_KIND = "assistant-step";
export declare const USER_KINDS: Set<string>;
export type MessageRole = 'user' | 'assistant';
export interface SelectionSnapshot {
    /** Full selected text. Core performs context-budget admission; producer never truncates. */
    readonly text: string;
    readonly anchorId: string;
    readonly messageId?: string;
    readonly occurrence: number;
    readonly role: MessageRole;
    readonly rect: {
        readonly left: number;
        readonly top: number;
        readonly width: number;
        readonly height?: number;
    };
    readonly range: Range;
    readonly sessionId: string;
}
export interface SelectionState {
    readonly selection: SelectionSnapshot | null;
}
export declare function roleForMessageKind(kind: string): MessageRole | undefined;
export declare function isEligibleSelection(input: {
    readonly blank: boolean;
    readonly sameMessage: boolean;
    readonly kind: string;
    readonly streaming: boolean;
    readonly excluded: boolean;
    readonly hasSession: boolean;
    readonly hasAnchor: boolean;
}): boolean;
export declare function occurrenceOf(anchor: HTMLElement, range: Range, text: string): number;
export declare function captureSelection(currentSessionId: string): SelectionSnapshot | null;
export interface SelectionController {
    getSnapshot(): SelectionState;
    subscribe(listener: () => void): () => void;
    clear(): void;
    dispose(): void;
}
export declare function createSelectionController(getSessionId: () => string): SelectionController;
//# sourceMappingURL=selection-capture.d.ts.map