export interface TargetPage {
    items: {
        id: string;
        title: string;
    }[];
    nextCursor: string | null;
}
export interface CrossSessionPickerPort {
    list(workspaceId?: string, after?: string): Promise<TargetPage>;
    select(sessionId: string): Promise<void>;
}
export declare function CrossSessionPicker({ port, close }: {
    port: CrossSessionPickerPort;
    close: () => void;
}): import("react").JSX.Element;
/** The modal owns no transcript or draft state and survives source-page navigation. */
export declare function chooseCrossSession(port: CrossSessionPickerPort, signal?: AbortSignal): Promise<void>;
//# sourceMappingURL=cross-session-picker.d.ts.map