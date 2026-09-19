import { SelectionActions, type SelectionAction } from './selection-actions.ts';
import { Service } from '@deepseek-ai/cordis';
import type * as React from 'react';
import type { Context } from '../context-types.ts';
import type { ReferenceItem } from '../domain/model.ts';
import type { DshMessageCapture, DshMessageReferenceSource, ReferenceSource, SourceType } from '../protocol/index.ts';
import type { AnnotationCoreClient, AnnotationCoreFeature, ClientSourceAdapter, PlainComposerPort } from '../public/client-api.ts';
import type { ComposerBinding } from './composer-binding.tsx';
import { AnnotationDialogController } from './reference-dialog.tsx';
import { ClientSourceRegistry } from './source-registry.ts';
export interface ClientConfig {
    readonly profileId: string;
}
export declare class AnnotationCoreClientService extends Service implements AnnotationCoreClient {
    readonly config: ClientConfig;
    private readonly lifetime;
    private readonly nativeComposers;
    private crossSessionTask;
    private readonly graphPrepareTasks;
    private readonly graphReferenceTasks;
    registerNativeComposer(sessionId: string): () => void;
    openCrossSessionReference(input: DshMessageCapture): Promise<void>;
    addCrossSessionReference(target: string, input: DshMessageCapture, options?: {
        operationId?: string;
    }): Promise<{
        setId: string;
        referenceId: string;
        created: boolean;
    }>;
    private addCrossSessionReferenceToComposer;
    prepareGraphReferences(target: string, referenceIds: readonly string[]): Promise<{
        preparedCount: number;
    }>;
    private openTargetComposer;
    resolveReferenceLink(sessionId: string, referenceId: string): Promise<import("../client.tsx").ReferenceLinkSummary | null>;
    readonly version = "0.3.4";
    readonly features: readonly AnnotationCoreFeature[];
    readonly selectionActions: SelectionActions;
    registerSelectionAction(action: SelectionAction): () => void;
    readonly sources: ClientSourceRegistry;
    private readonly highlights;
    readonly dialog: AnnotationDialogController;
    private readonly sent;
    private readonly sentSummaries;
    private readonly sentListeners;
    constructor(ctx: Context, config: ClientConfig);
    private resolveDshAnchor;
    openDshSource(item: ReferenceItem): Promise<void>;
    private remote;
    readPendingState(sessionId: string): Promise<{
        revision: number;
        pendingCount: number;
    }>;
    createDshMessageSource(input: DshMessageCapture): Promise<DshMessageReferenceSource>;
    addReference(sessionId: string, source: ReferenceSource, options?: {
        operationId?: string;
        referenceId?: string;
        signal?: AbortSignal;
        beforeCommit?: () => void;
    }): Promise<{
        setId: string;
        referenceId: string;
        created: boolean;
    }>;
    fenceReferenceOperation(sessionId: string, operationId: string): Promise<{
        state: "canceled" | "committed" | "failed";
        fenceRevision: number;
    }>;
    discardPendingOperation(sessionId: string, operationId: string, options?: {
        notifySource?: boolean;
    }): Promise<void>;
    updateComment(sessionId: string, referenceId: string, comment: string): Promise<void>;
    removeReference(sessionId: string, referenceId: string): Promise<void>;
    deleteReferenceLink(sessionId: string, setId: string, referenceId: string): Promise<{
        deleted: boolean;
        scope: 'pending' | 'sent';
    }>;
    reuseReference(referenceId: string, targetSessionId: string): Promise<{
        setId: string;
        referenceId: string;
    }>;
    retryBacklink(setId: string, referenceId: string): Promise<void>;
    bindComposer(input: {
        sessionId: string;
        layout: 'default' | 'narrow';
        plainPort?: PlainComposerPort;
    }): ComposerBinding;
    private dialogSet;
    private refreshDialogPending;
    renderGlobalDialog(): React.ReactNode;
    renderConversationNode(input: {
        sessionId: string;
        node: unknown;
        layout: 'default' | 'narrow';
    }): {
        key: string;
        node: React.ReactNode;
    } | undefined;
    handleAnswerLink(sessionId: string, href: string): boolean;
    openAnnotation(setId: string, referenceId?: string): void;
    openAnnotationInSession(sessionId: string, setId: string, referenceId?: string): Promise<boolean>;
    private rememberSent;
    private forgetSent;
    private sentKey;
    private subscribeSent;
    private emitSent;
    private prefetchSent;
    private openSent;
    registerSourceAdapter(type: SourceType, adapter: ClientSourceAdapter): () => void;
    sourceAdapter(item: ReferenceItem): ClientSourceAdapter | undefined;
}
//# sourceMappingURL=service.d.ts.map