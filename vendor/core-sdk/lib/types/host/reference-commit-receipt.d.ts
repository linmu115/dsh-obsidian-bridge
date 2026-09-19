import { z } from 'zod';
/** Internal outbox acknowledgements; the external Obsidian protocol is unchanged. */
export declare const ReferenceCommitReceiptSchema: z.ZodUnion<readonly [z.ZodObject<{
    referenceId: z.ZodString;
    commitDigest: z.ZodString;
    notePath: z.ZodString;
    blockId: z.ZodString;
    revision: z.ZodString;
    writtenAt: z.ZodNumber;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"maintenance-reference">;
    referenceId: z.ZodString;
    targetMessageId: z.ZodString;
    writtenAt: z.ZodNumber;
}, z.core.$strict>]>;
export type ReferenceCommitReceipt = z.infer<typeof ReferenceCommitReceiptSchema>;
//# sourceMappingURL=reference-commit-receipt.d.ts.map