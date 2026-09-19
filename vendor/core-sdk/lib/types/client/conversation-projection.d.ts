interface ConversationLocation {
    readonly kind: string;
    readonly [key: string]: unknown;
}
interface SessionEventLike {
    readonly type: string;
    readonly seq: number;
    readonly data: unknown;
}
interface ConversationMatch {
    readonly event: SessionEventLike;
    readonly location: ConversationLocation;
}
interface ConversationNodeContext<State> {
    readonly key: string;
    readonly id: string;
    readonly state?: State;
}
interface ConversationNodeDefinition<State> {
    readonly kind: string;
    readonly target: 'chat';
    match(event: SessionEventLike): {
        readonly id: string;
        readonly role: 'start';
    } | null;
    start(context: ConversationNodeContext<State>, match: ConversationMatch): State;
    update(context: ConversationNodeContext<State>): State;
    publication(): 'immediate';
    buildViewNode(context: ConversationNodeContext<State>): ChatConversationViewNode | null;
}
interface ChatConversationViewNode {
    readonly key: string;
    readonly kind: string;
    readonly id: string;
    readonly target: 'chat';
    readonly anchorSeq: number;
    readonly location: ConversationLocation;
    readonly visibility: 'visible';
    readonly data: AnnotationConversationData;
}
export interface AnnotationConversationData {
    readonly contextMessageId: string;
    readonly setId: string;
    readonly targetUserMessageId: string;
    readonly count: number;
    readonly genericContextKey: string;
}
export interface AnnotationConversationState extends AnnotationConversationData {
    readonly seq: number;
    readonly sourceLocation: ConversationLocation;
}
export declare const annotationConversationDefinition: ConversationNodeDefinition<AnnotationConversationState>;
export { suppressGenericAnnotationRow } from './anchor-suppression.ts';
//# sourceMappingURL=conversation-projection.d.ts.map