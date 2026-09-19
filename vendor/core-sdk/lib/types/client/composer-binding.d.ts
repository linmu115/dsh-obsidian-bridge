import type { EncodedImageAttachment } from '@deepseek-ai/dsh-attachment';
import { type SubmissionAttachment } from '../protocol/submission-attachments.ts';
import type { SubmitOutcome } from '@deepseek-ai/dsh-client-ui-input-trigger/client';
import type * as React from 'react';
import type { ReferenceItem, ReferenceSet } from '../domain/model.ts';
import type { EmbeddedComposerHandle, EmbeddedComposerSnapshot, PlainComposerPort } from '../public/client-api.ts';
import type { AnnotationCoreRemoteNamespace } from '../remote/client.ts';
export type ReferenceLoadStatus = 'loading' | 'ready' | 'blocked';
export interface ReferenceSessionSnapshot {
    readonly status: ReferenceLoadStatus;
    readonly revision: number;
    readonly pending: ReferenceSet | null;
    readonly error?: string;
}
export declare class ReferenceSessionStore {
    readonly remote: AnnotationCoreRemoteNamespace;
    private snapshot;
    private readonly listeners;
    private readonly abort;
    private readonly initial;
    private disposed;
    private polling;
    private retryTimer;
    private readonly authorityTimer;
    private readonly authorityRefresh;
    constructor(remote: AnnotationCoreRemoteNamespace);
    getSnapshot: () => ReferenceSessionSnapshot;
    subscribe: (listener: () => void) => (() => void);
    ready(): Promise<void>;
    private publish;
    private start;
    private poll;
    private startPoll;
    private recover;
    refresh(): Promise<ReferenceSessionSnapshot>;
    dispose(): void;
}
export interface ComposerBindingOptions {
    readonly sessionId: string;
    readonly layout: 'default' | 'narrow';
    readonly remote: AnnotationCoreRemoteNamespace;
    readonly store?: ReferenceSessionStore;
    readonly plainPort?: PlainComposerPort;
    readonly onOpen?: (set: ReferenceSet, referenceId?: string, anchor?: DOMRect) => void;
    readonly onJump?: (item: ReferenceItem) => Promise<void>;
    readonly onReferences?: (set: ReferenceSet | null) => void;
    readonly onDispose?: () => void;
    readonly onRemove?: (referenceId: string) => Promise<void>;
}
export declare class ComposerBinding implements EmbeddedComposerHandle {
    readonly options: ComposerBindingOptions;
    private visibleDraft;
    private snapshot;
    private localRevision;
    private commitState;
    private error;
    private readonly listeners;
    private readonly ownStore;
    private readonly unsubscribeStore;
    private readonly unsubscribePlain;
    private uncertain;
    private disposed;
    readonly store: ReferenceSessionStore;
    constructor(options: ComposerBindingOptions);
    private buildSnapshot;
    getSnapshot: () => EmbeddedComposerSnapshot;
    subscribe: (listener: () => void) => (() => void);
    private emit;
    setVisibleDraft(text: string): void;
    submit(): Promise<void>;
    submitClaim(text: string, images: readonly (SubmissionAttachment | EncodedImageAttachment)[]): Promise<SubmitOutcome>;
    private submitCore;
    private identityFor;
    private beginCommit;
    private finishCommit;
    private fail;
    renderReferenceRail(): React.ReactNode;
    dispose(): void;
}
export declare function createComposerBinding(options: ComposerBindingOptions): ComposerBinding;
//# sourceMappingURL=composer-binding.d.ts.map