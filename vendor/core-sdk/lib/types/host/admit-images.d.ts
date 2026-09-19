import type { Agent } from '@deepseek-ai/dsh-agent';
import type { FileUploads, PromptFileBinding } from '@deepseek-ai/dsh-client-file-upload';
import type { SubmissionAttachment } from '../protocol/submission-attachments.ts';
import type { AttachmentStore, EncodedImageAttachment, ImageAttachmentRef } from '@deepseek-ai/dsh-attachment';
import type { UserMessage } from '@deepseek-ai/dsh-llm';
export type SubmitImageAttachment = EncodedImageAttachment;
export declare function admitSubmissionImages(attachments: AttachmentStore, images?: readonly SubmitImageAttachment[]): Promise<readonly ImageAttachmentRef[]>;
export declare function createDirectUserMessage(input: {
    readonly attachments: AttachmentStore;
    readonly allowEmptyText?: boolean;
    readonly text: string;
    readonly images?: readonly SubmitImageAttachment[];
}): Promise<UserMessage>;
/** Resolve every receipt before persisting images; the caller commits binding after Agent acceptance. */
export declare function prepareSubmission(input: {
    readonly attachments: AttachmentStore;
    readonly fileUploads?: Pick<FileUploads, 'resolve' | 'bindPrompt'> | undefined;
    readonly agent: Agent;
    readonly requestId: string;
    readonly allowEmptyText?: boolean;
    readonly text: string;
    readonly images?: readonly SubmitImageAttachment[];
    readonly ordered?: readonly SubmissionAttachment[];
}): Promise<{
    message: UserMessage;
    binding?: PromptFileBinding;
}>;
//# sourceMappingURL=admit-images.d.ts.map