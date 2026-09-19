export interface AnnotationConversationNodeProps {
    readonly count: number;
    readonly getCount?: () => number;
    readonly subscribeCount?: (listener: () => void) => () => void;
    readonly open: () => void;
    readonly genericContextKey?: string;
}
export declare function AnnotationConversationNode({ count, getCount, subscribeCount, open, genericContextKey }: AnnotationConversationNodeProps): import("react").JSX.Element | null;
//# sourceMappingURL=conversation-node.d.ts.map