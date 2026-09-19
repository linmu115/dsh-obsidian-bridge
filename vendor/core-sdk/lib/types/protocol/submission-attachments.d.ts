import type { EncodedImageAttachment } from '@deepseek-ai/dsh-attachment';
/** Ordered RC2 command attachments. Receipts are resolved only by their receiving Agent. */
export type SubmissionAttachment = ({
    readonly type: 'image';
} & EncodedImageAttachment) | {
    readonly type: 'file';
    readonly receiptId: string;
};
/** Legacy callers retain their original digest; native RC2 callers use the ordered contract. */
export declare function submissionAttachmentFields(items: readonly (SubmissionAttachment | EncodedImageAttachment)[]): {
    images?: readonly EncodedImageAttachment[];
    attachments?: readonly SubmissionAttachment[];
};
//# sourceMappingURL=submission-attachments.d.ts.map