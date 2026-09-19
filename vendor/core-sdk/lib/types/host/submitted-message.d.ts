import { z } from 'zod';
/** Durable submission evidence contains admitted refs, never browser upload receipts or encoded bytes. */
export declare const SubmittedMessageSchema: z.ZodObject<{
    id: z.ZodString;
    role: z.ZodLiteral<"user">;
    source: z.ZodObject<{
        kind: z.ZodLiteral<"user">;
        rpcId: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    content: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        type: z.ZodLiteral<"text">;
        text: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"image">;
        attachment: z.ZodObject<{
            attachmentId: z.ZodString;
            mediaType: z.ZodEnum<{
                "image/png": "image/png";
                "image/jpeg": "image/jpeg";
                "image/webp": "image/webp";
                "image/gif": "image/gif";
            }>;
            bytes: z.ZodNumber;
            width: z.ZodNumber;
            height: z.ZodNumber;
            name: z.ZodOptional<z.ZodString>;
            originalDimensions: z.ZodOptional<z.ZodObject<{
                width: z.ZodNumber;
                height: z.ZodNumber;
            }, z.core.$strict>>;
        }, z.core.$strict>;
    }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"file">;
        attachment: z.ZodObject<{
            attachmentId: z.ZodString;
            name: z.ZodString;
            bytes: z.ZodNumber;
        }, z.core.$strict>;
    }, z.core.$strict>], "type">>;
}, z.core.$strict>;
export type SubmittedMessage = z.infer<typeof SubmittedMessageSchema>;
//# sourceMappingURL=submitted-message.d.ts.map