import { z } from 'zod';
/** Only the bounded material used by this submission, not another source-session snapshot. */
export declare const PreparedUpstreamContextSchema: z.ZodObject<{
    kind: z.ZodLiteral<"selected-turn">;
    sourceVersionId: z.ZodString;
    cutoffEventId: z.ZodString;
    items: z.ZodArray<z.ZodObject<{
        eventId: z.ZodString;
        role: z.ZodString;
        text: z.ZodString;
        offset: z.ZodNumber;
        complete: z.ZodBoolean;
    }, z.core.$strict>>;
    turnComplete: z.ZodBoolean;
    omittedIntermediateItems: z.ZodOptional<z.ZodNumber>;
    detailsCursor: z.ZodOptional<z.ZodString>;
    nextCursor: z.ZodNullable<z.ZodString>;
    hasMore: z.ZodBoolean;
    disclosureRequestId: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type PreparedUpstreamContext = z.infer<typeof PreparedUpstreamContextSchema>;
//# sourceMappingURL=upstream-context.d.ts.map