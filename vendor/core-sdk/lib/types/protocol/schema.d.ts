import { z } from 'zod';
export declare const ANNOTATION_PROTOCOL_VERSION: 2;
export declare const Sha256DigestSchema: z.ZodString;
export declare const OccurrenceSchema: z.ZodNumber;
/** Stable Maintenance identity plus the native IDs needed by older DSH builds. */
export declare const MaintenanceLogicalTargetSchema: z.ZodObject<{
    dshInstanceId: z.ZodOptional<z.ZodString>;
    logicalSessionId: z.ZodOptional<z.ZodString>;
    logicalAnchorId: z.ZodOptional<z.ZodString>;
    legacySessionId: z.ZodOptional<z.ZodString>;
    legacyAnchorId: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const DshMessageCaptureSchema: z.ZodObject<{
    selectedText: z.ZodString;
    sourceSessionId: z.ZodString;
    messageId: z.ZodOptional<z.ZodString>;
    anchorId: z.ZodString;
    role: z.ZodEnum<{
        user: "user";
        assistant: "assistant";
    }>;
    occurrence: z.ZodNumber;
    expectedSourceVersionId: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const DshMessageLocatorSchema: z.ZodObject<{
    profileId: z.ZodString;
    sessionId: z.ZodString;
    messageId: z.ZodOptional<z.ZodString>;
    anchorId: z.ZodString;
    role: z.ZodEnum<{
        user: "user";
        assistant: "assistant";
    }>;
    occurrence: z.ZodNumber;
    selectedTextHash: z.ZodString;
    upstream: z.ZodOptional<z.ZodObject<{
        kind: z.ZodLiteral<"fixed-upstream">;
        referenceId: z.ZodString;
        sourceTitle: z.ZodString;
        sourceVersionId: z.ZodString;
        cutoffEventId: z.ZodString;
        targetSessionId: z.ZodString;
    }, z.core.$strict>>;
    dshInstanceId: z.ZodOptional<z.ZodString>;
    logicalSessionId: z.ZodOptional<z.ZodString>;
    logicalAnchorId: z.ZodOptional<z.ZodString>;
    legacySessionId: z.ZodOptional<z.ZodString>;
    legacyAnchorId: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const ObsidianNoteLocatorSchema: z.ZodObject<{
    vaultId: z.ZodString;
    notePath: z.ZodString;
    heading: z.ZodOptional<z.ZodString>;
    blockId: z.ZodString;
    occurrence: z.ZodNumber;
    selectedTextHash: z.ZodString;
}, z.core.$strict>;
export declare const SourceSnapshotSchema: z.ZodObject<{
    markdown: z.ZodString;
    documentHash: z.ZodString;
    capturedAt: z.ZodNumber;
    freshness: z.ZodEnum<{
        captured: "captured";
        refreshed: "refreshed";
        offline: "offline";
    }>;
}, z.core.$strict>;
export declare const DshMessageReferenceSourceSchema: z.ZodObject<{
    sourceType: z.ZodLiteral<"dsh-message">;
    selectedText: z.ZodString;
    locator: z.ZodObject<{
        profileId: z.ZodString;
        sessionId: z.ZodString;
        messageId: z.ZodOptional<z.ZodString>;
        anchorId: z.ZodString;
        role: z.ZodEnum<{
            user: "user";
            assistant: "assistant";
        }>;
        occurrence: z.ZodNumber;
        selectedTextHash: z.ZodString;
        upstream: z.ZodOptional<z.ZodObject<{
            kind: z.ZodLiteral<"fixed-upstream">;
            referenceId: z.ZodString;
            sourceTitle: z.ZodString;
            sourceVersionId: z.ZodString;
            cutoffEventId: z.ZodString;
            targetSessionId: z.ZodString;
        }, z.core.$strict>>;
        dshInstanceId: z.ZodOptional<z.ZodString>;
        logicalSessionId: z.ZodOptional<z.ZodString>;
        logicalAnchorId: z.ZodOptional<z.ZodString>;
        legacySessionId: z.ZodOptional<z.ZodString>;
        legacyAnchorId: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
}, z.core.$strict>;
export declare const ObsidianNoteReferenceSourceSchema: z.ZodObject<{
    sourceType: z.ZodLiteral<"obsidian-note">;
    selectedText: z.ZodString;
    locator: z.ZodObject<{
        vaultId: z.ZodString;
        notePath: z.ZodString;
        heading: z.ZodOptional<z.ZodString>;
        blockId: z.ZodString;
        occurrence: z.ZodNumber;
        selectedTextHash: z.ZodString;
    }, z.core.$strict>;
    snapshot: z.ZodObject<{
        markdown: z.ZodString;
        documentHash: z.ZodString;
        capturedAt: z.ZodNumber;
        freshness: z.ZodEnum<{
            captured: "captured";
            refreshed: "refreshed";
            offline: "offline";
        }>;
    }, z.core.$strict>;
}, z.core.$strict>;
export declare const ReferenceSourceSchema: z.ZodUnion<readonly [z.ZodObject<{
    sourceType: z.ZodLiteral<"dsh-message">;
    selectedText: z.ZodString;
    locator: z.ZodObject<{
        profileId: z.ZodString;
        sessionId: z.ZodString;
        messageId: z.ZodOptional<z.ZodString>;
        anchorId: z.ZodString;
        role: z.ZodEnum<{
            user: "user";
            assistant: "assistant";
        }>;
        occurrence: z.ZodNumber;
        selectedTextHash: z.ZodString;
        upstream: z.ZodOptional<z.ZodObject<{
            kind: z.ZodLiteral<"fixed-upstream">;
            referenceId: z.ZodString;
            sourceTitle: z.ZodString;
            sourceVersionId: z.ZodString;
            cutoffEventId: z.ZodString;
            targetSessionId: z.ZodString;
        }, z.core.$strict>>;
        dshInstanceId: z.ZodOptional<z.ZodString>;
        logicalSessionId: z.ZodOptional<z.ZodString>;
        logicalAnchorId: z.ZodOptional<z.ZodString>;
        legacySessionId: z.ZodOptional<z.ZodString>;
        legacyAnchorId: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    sourceType: z.ZodLiteral<"obsidian-note">;
    selectedText: z.ZodString;
    locator: z.ZodObject<{
        vaultId: z.ZodString;
        notePath: z.ZodString;
        heading: z.ZodOptional<z.ZodString>;
        blockId: z.ZodString;
        occurrence: z.ZodNumber;
        selectedTextHash: z.ZodString;
    }, z.core.$strict>;
    snapshot: z.ZodObject<{
        markdown: z.ZodString;
        documentHash: z.ZodString;
        capturedAt: z.ZodNumber;
        freshness: z.ZodEnum<{
            captured: "captured";
            refreshed: "refreshed";
            offline: "offline";
        }>;
    }, z.core.$strict>;
}, z.core.$strict>]>;
export declare const ObsidianReferenceCaptureV2Schema: z.ZodObject<{
    type: z.ZodLiteral<"reference-capture">;
    dshInstanceId: z.ZodOptional<z.ZodString>;
    actionId: z.ZodString;
    referenceId: z.ZodString;
    source: z.ZodObject<{
        sourceType: z.ZodLiteral<"obsidian-note">;
        selectedText: z.ZodString;
        locator: z.ZodObject<{
            vaultId: z.ZodString;
            notePath: z.ZodString;
            heading: z.ZodOptional<z.ZodString>;
            blockId: z.ZodString;
            occurrence: z.ZodNumber;
            selectedTextHash: z.ZodString;
        }, z.core.$strict>;
        snapshot: z.ZodObject<{
            markdown: z.ZodString;
            documentHash: z.ZodString;
            capturedAt: z.ZodNumber;
            freshness: z.ZodEnum<{
                captured: "captured";
                refreshed: "refreshed";
                offline: "offline";
            }>;
        }, z.core.$strict>;
    }, z.core.$strict>;
    annotationProtocolVersion: z.ZodLiteral<2>;
}, z.core.$strict>;
export declare const ReferenceClaimV2Schema: z.ZodObject<{
    dshInstanceId: z.ZodOptional<z.ZodString>;
    logicalSessionId: z.ZodOptional<z.ZodString>;
    logicalAnchorId: z.ZodOptional<z.ZodString>;
    legacySessionId: z.ZodOptional<z.ZodString>;
    legacyAnchorId: z.ZodOptional<z.ZodString>;
    type: z.ZodLiteral<"reference-claim">;
    referenceId: z.ZodString;
    profileId: z.ZodString;
    sessionId: z.ZodString;
    setId: z.ZodString;
    annotationProtocolVersion: z.ZodLiteral<2>;
}, z.core.$strict>;
export declare const ReferenceRefreshRequestV2Schema: z.ZodObject<{
    type: z.ZodLiteral<"reference-refresh">;
    referenceId: z.ZodString;
    knownDocumentHash: z.ZodString;
    annotationProtocolVersion: z.ZodLiteral<2>;
}, z.core.$strict>;
export declare const ReferenceRefreshResultV2Schema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"unchanged">;
    source: z.ZodObject<{
        sourceType: z.ZodLiteral<"obsidian-note">;
        selectedText: z.ZodString;
        locator: z.ZodObject<{
            vaultId: z.ZodString;
            notePath: z.ZodString;
            heading: z.ZodOptional<z.ZodString>;
            blockId: z.ZodString;
            occurrence: z.ZodNumber;
            selectedTextHash: z.ZodString;
        }, z.core.$strict>;
        snapshot: z.ZodObject<{
            markdown: z.ZodString;
            documentHash: z.ZodString;
            capturedAt: z.ZodNumber;
            freshness: z.ZodEnum<{
                captured: "captured";
                refreshed: "refreshed";
                offline: "offline";
            }>;
        }, z.core.$strict>;
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"refreshed">;
    source: z.ZodObject<{
        sourceType: z.ZodLiteral<"obsidian-note">;
        selectedText: z.ZodString;
        locator: z.ZodObject<{
            vaultId: z.ZodString;
            notePath: z.ZodString;
            heading: z.ZodOptional<z.ZodString>;
            blockId: z.ZodString;
            occurrence: z.ZodNumber;
            selectedTextHash: z.ZodString;
        }, z.core.$strict>;
        snapshot: z.ZodObject<{
            markdown: z.ZodString;
            documentHash: z.ZodString;
            capturedAt: z.ZodNumber;
            freshness: z.ZodEnum<{
                captured: "captured";
                refreshed: "refreshed";
                offline: "offline";
            }>;
        }, z.core.$strict>;
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"offline">;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"blocked">;
    reason: z.ZodEnum<{
        "note-missing": "note-missing";
        "block-missing": "block-missing";
        "selection-changed": "selection-changed";
        ambiguous: "ambiguous";
    }>;
}, z.core.$strict>], "kind">;
export declare const ReferenceDiscardV2Schema: z.ZodObject<{
    type: z.ZodLiteral<"reference-discard">;
    referenceId: z.ZodString;
    annotationProtocolVersion: z.ZodLiteral<2>;
}, z.core.$strict>;
export declare const ReferenceDeleteRequestV2Schema: z.ZodObject<{
    dshInstanceId: z.ZodOptional<z.ZodString>;
    logicalSessionId: z.ZodOptional<z.ZodString>;
    logicalAnchorId: z.ZodOptional<z.ZodString>;
    legacySessionId: z.ZodOptional<z.ZodString>;
    legacyAnchorId: z.ZodOptional<z.ZodString>;
    type: z.ZodLiteral<"reference-delete-request">;
    actionId: z.ZodString;
    referenceId: z.ZodString;
    profileId: z.ZodString;
    sessionId: z.ZodString;
    setId: z.ZodString;
    requestedAt: z.ZodNumber;
    annotationProtocolVersion: z.ZodLiteral<2>;
}, z.core.$strict>;
export declare const ReferenceDeleteCommitV2Schema: z.ZodObject<{
    dshInstanceId: z.ZodOptional<z.ZodString>;
    logicalSessionId: z.ZodOptional<z.ZodString>;
    logicalAnchorId: z.ZodOptional<z.ZodString>;
    legacySessionId: z.ZodOptional<z.ZodString>;
    legacyAnchorId: z.ZodOptional<z.ZodString>;
    type: z.ZodLiteral<"reference-delete-commit">;
    referenceId: z.ZodString;
    profileId: z.ZodString;
    sessionId: z.ZodString;
    setId: z.ZodString;
    deletedAt: z.ZodNumber;
    annotationProtocolVersion: z.ZodLiteral<2>;
}, z.core.$strict>;
export declare const BacklinkCommitV2Schema: z.ZodObject<{
    dshInstanceId: z.ZodOptional<z.ZodString>;
    logicalSessionId: z.ZodOptional<z.ZodString>;
    logicalAnchorId: z.ZodOptional<z.ZodString>;
    legacySessionId: z.ZodOptional<z.ZodString>;
    legacyAnchorId: z.ZodOptional<z.ZodString>;
    type: z.ZodLiteral<"backlink-commit">;
    referenceId: z.ZodString;
    setId: z.ZodString;
    profileId: z.ZodString;
    sessionId: z.ZodString;
    userMessageId: z.ZodString;
    userAnchorId: z.ZodString;
    userTextHash: z.ZodString;
    annotationProtocolVersion: z.ZodLiteral<2>;
}, z.core.$strict>;
export declare const BacklinkReceiptV2Schema: z.ZodObject<{
    referenceId: z.ZodString;
    commitDigest: z.ZodString;
    notePath: z.ZodString;
    blockId: z.ZodString;
    revision: z.ZodString;
    writtenAt: z.ZodNumber;
}, z.core.$strict>;
export type SourceType = 'dsh-message' | 'obsidian-note';
export type MaintenanceLogicalTarget = z.infer<typeof MaintenanceLogicalTargetSchema>;
export type DshMessageCapture = z.infer<typeof DshMessageCaptureSchema>;
export type DshMessageLocator = z.infer<typeof DshMessageLocatorSchema>;
export type ObsidianNoteLocator = z.infer<typeof ObsidianNoteLocatorSchema>;
export type SourceSnapshot = z.infer<typeof SourceSnapshotSchema>;
export type DshMessageReferenceSource = z.infer<typeof DshMessageReferenceSourceSchema>;
export type ObsidianNoteReferenceSource = z.infer<typeof ObsidianNoteReferenceSourceSchema>;
export type ReferenceSource = z.infer<typeof ReferenceSourceSchema>;
export type ObsidianReferenceCaptureV2 = z.infer<typeof ObsidianReferenceCaptureV2Schema>;
export type ReferenceClaimV2 = z.infer<typeof ReferenceClaimV2Schema>;
export type ReferenceRefreshRequestV2 = z.infer<typeof ReferenceRefreshRequestV2Schema>;
export type ReferenceRefreshResultV2 = z.infer<typeof ReferenceRefreshResultV2Schema>;
export type ReferenceDiscardV2 = z.infer<typeof ReferenceDiscardV2Schema>;
export type ReferenceDeleteRequestV2 = z.infer<typeof ReferenceDeleteRequestV2Schema>;
export type ReferenceDeleteCommitV2 = z.infer<typeof ReferenceDeleteCommitV2Schema>;
export type BacklinkCommitV2 = z.infer<typeof BacklinkCommitV2Schema>;
export type BacklinkReceiptV2 = z.infer<typeof BacklinkReceiptV2Schema>;
//# sourceMappingURL=schema.d.ts.map