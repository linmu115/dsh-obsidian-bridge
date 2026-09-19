import { z } from "zod";
//#region src/protocol/serialization.ts
const SHA256_INITIAL = new Uint32Array([
	1779033703,
	3144134277,
	1013904242,
	2773480762,
	1359893119,
	2600822924,
	528734635,
	1541459225
]);
const SHA256_CONSTANTS = new Uint32Array([
	1116352408,
	1899447441,
	3049323471,
	3921009573,
	961987163,
	1508970993,
	2453635748,
	2870763221,
	3624381080,
	310598401,
	607225278,
	1426881987,
	1925078388,
	2162078206,
	2614888103,
	3248222580,
	3835390401,
	4022224774,
	264347078,
	604807628,
	770255983,
	1249150122,
	1555081692,
	1996064986,
	2554220882,
	2821834349,
	2952996808,
	3210313671,
	3336571891,
	3584528711,
	113926993,
	338241895,
	666307205,
	773529912,
	1294757372,
	1396182291,
	1695183700,
	1986661051,
	2177026350,
	2456956037,
	2730485921,
	2820302411,
	3259730800,
	3345764771,
	3516065817,
	3600352804,
	4094571909,
	275423344,
	430227734,
	506948616,
	659060556,
	883997877,
	958139571,
	1322822218,
	1537002063,
	1747873779,
	1955562222,
	2024104815,
	2227730452,
	2361852424,
	2428436474,
	2756734187,
	3204031479,
	3329325298
]);
function rotateRight(value, count) {
	return value >>> count | value << 32 - count;
}
/** Browser-safe synchronous SHA-256 used by both DSH and Obsidian builds. */
function sha256Hex(input) {
	const bytes = new TextEncoder().encode(input);
	const paddedLength = Math.ceil((bytes.length + 9) / 64) * 64;
	const padded = new Uint8Array(paddedLength);
	padded.set(bytes);
	padded[bytes.length] = 128;
	const bitLength = bytes.length * 8;
	const view = new DataView(padded.buffer);
	view.setUint32(paddedLength - 8, Math.floor(bitLength / 4294967296), false);
	view.setUint32(paddedLength - 4, bitLength >>> 0, false);
	const hash = new Uint32Array(SHA256_INITIAL);
	const words = /* @__PURE__ */ new Uint32Array(64);
	for (let offset = 0; offset < paddedLength; offset += 64) {
		for (let index = 0; index < 16; index += 1) words[index] = view.getUint32(offset + index * 4, false);
		for (let index = 16; index < 64; index += 1) {
			const previous15 = words[index - 15] ?? 0;
			const previous2 = words[index - 2] ?? 0;
			const sigma0 = rotateRight(previous15, 7) ^ rotateRight(previous15, 18) ^ previous15 >>> 3;
			const sigma1 = rotateRight(previous2, 17) ^ rotateRight(previous2, 19) ^ previous2 >>> 10;
			words[index] = (words[index - 16] ?? 0) + sigma0 + (words[index - 7] ?? 0) + sigma1 >>> 0;
		}
		let a = hash[0] ?? 0;
		let b = hash[1] ?? 0;
		let c = hash[2] ?? 0;
		let d = hash[3] ?? 0;
		let e = hash[4] ?? 0;
		let f = hash[5] ?? 0;
		let g = hash[6] ?? 0;
		let h = hash[7] ?? 0;
		for (let index = 0; index < 64; index += 1) {
			const sum1 = rotateRight(e, 6) ^ rotateRight(e, 11) ^ rotateRight(e, 25);
			const choice = e & f ^ ~e & g;
			const temporary1 = h + sum1 + choice + (SHA256_CONSTANTS[index] ?? 0) + (words[index] ?? 0) >>> 0;
			const temporary2 = (rotateRight(a, 2) ^ rotateRight(a, 13) ^ rotateRight(a, 22)) + (a & b ^ a & c ^ b & c) >>> 0;
			h = g;
			g = f;
			f = e;
			e = d + temporary1 >>> 0;
			d = c;
			c = b;
			b = a;
			a = temporary1 + temporary2 >>> 0;
		}
		hash[0] = (hash[0] ?? 0) + a >>> 0;
		hash[1] = (hash[1] ?? 0) + b >>> 0;
		hash[2] = (hash[2] ?? 0) + c >>> 0;
		hash[3] = (hash[3] ?? 0) + d >>> 0;
		hash[4] = (hash[4] ?? 0) + e >>> 0;
		hash[5] = (hash[5] ?? 0) + f >>> 0;
		hash[6] = (hash[6] ?? 0) + g >>> 0;
		hash[7] = (hash[7] ?? 0) + h >>> 0;
	}
	return [...hash].map((word) => word.toString(16).padStart(8, "0")).join("");
}
function normalizeSourceText(value) {
	return value.replace(/\r\n?/g, "\n").normalize("NFC");
}
function selectedTextHash(value) {
	return `sha256:${sha256Hex(normalizeSourceText(value))}`;
}
function documentHash(value) {
	return `sha256:${sha256Hex(normalizeSourceText(value))}`;
}
function safeJsonString(value) {
	return JSON.stringify(value).replace(/[<>&\u2028\u2029]/g, (character) => {
		switch (character) {
			case "<": return "\\u003c";
			case ">": return "\\u003e";
			case "&": return "\\u0026";
			case "\u2028": return "\\u2028";
			case "\u2029": return "\\u2029";
			default: return character;
		}
	});
}
function canonicalize(value, stack, arrayItem = false) {
	if (value === null) return "null";
	switch (typeof value) {
		case "string": return safeJsonString(value);
		case "boolean": return value ? "true" : "false";
		case "number":
			if (!Number.isFinite(value)) throw new TypeError("Canonical JSON does not support non-finite numbers");
			return Object.is(value, -0) ? "0" : String(value);
		case "undefined": return arrayItem ? "null" : void 0;
		case "object": break;
		default: throw new TypeError(`Canonical JSON does not support ${typeof value}`);
	}
	const object = value;
	if (stack.has(object)) throw new TypeError("Canonical JSON does not support cyclic values");
	stack.add(object);
	try {
		if (Array.isArray(value)) return `[${value.map((item) => canonicalize(item, stack, true) ?? "null").join(",")}]`;
		const prototype = Object.getPrototypeOf(value);
		if (prototype !== Object.prototype && prototype !== null) throw new TypeError("Canonical JSON supports only plain objects and arrays");
		const entries = [];
		for (const key of Object.keys(value).sort()) {
			const serialized = canonicalize(value[key], stack);
			if (serialized !== void 0) entries.push(`${safeJsonString(key)}:${serialized}`);
		}
		return `{${entries.join(",")}}`;
	} finally {
		stack.delete(object);
	}
}
/** Deterministic JSON with every outer-tag-breaking character escaped. */
function canonicalJson(value) {
	const serialized = canonicalize(value, /* @__PURE__ */ new Set());
	if (serialized === void 0) throw new TypeError("Canonical JSON requires a serializable root value");
	return serialized;
}
function canonicalSha256(value) {
	return `sha256:${sha256Hex(canonicalJson(value))}`;
}
/** Canonical stable-link payload. Undefined legacy fields stay absent from signed envelopes. */
function serializeMaintenanceLogicalTarget(target) {
	return canonicalJson({
		...target.logicalSessionId === void 0 ? {} : { logicalSessionId: target.logicalSessionId },
		...target.logicalAnchorId === void 0 ? {} : { logicalAnchorId: target.logicalAnchorId },
		...target.legacySessionId === void 0 ? {} : { legacySessionId: target.legacySessionId },
		...target.legacyAnchorId === void 0 ? {} : { legacyAnchorId: target.legacyAnchorId }
	});
}
function backlinkCommitDigest(commit) {
	return canonicalSha256(commit);
}
function serializeAnnotationEnvelope(value) {
	return `<dsh-annotations version="1">\n${canonicalJson(value)}\n</dsh-annotations>`;
}
function serializeReferenceDocumentsEnvelope(value) {
	return `<dsh-reference-documents>\n${canonicalJson(value)}\n</dsh-reference-documents>`;
}
function escapeXmlAttribute(value) {
	return value.replace(/[&<>"']/g, (character) => {
		switch (character) {
			case "&": return "&amp;";
			case "<": return "&lt;";
			case ">": return "&gt;";
			case "\"": return "&quot;";
			case "'": return "&apos;";
			default: return character;
		}
	});
}
function documentKeyForItem(item) {
	return JSON.stringify([
		item.locator.vaultId,
		item.locator.notePath,
		item.snapshot.documentHash
	]);
}
/** Build the only model-facing representation of one prepared reference set. */
function serializePreparedReferenceSet(set, documents) {
	const annotations = set.items.map((item) => ({
		number: item.number,
		referenceId: item.referenceId,
		sourceType: item.sourceType,
		selectedText: item.selectedText,
		userComment: item.userComment,
		locator: structuredClone(item.locator),
		...item.sourceType === "obsidian-note" ? { documentKey: documentKeyForItem(item) } : {},
		...item.sourceType === "dsh-message" && item.initialContext !== void 0 ? { initialContext: structuredClone(item.initialContext) } : {}
	}));
	const serializedDocuments = documents.map((document) => ({
		key: document.key,
		vaultId: document.vaultId,
		notePath: document.notePath,
		documentHash: document.documentHash,
		markdown: document.markdown,
		referenceIds: [...document.referenceIds]
	}));
	const text = [
		`<dsh-annotations version="1" set-id="${escapeXmlAttribute(set.setId)}">`,
		canonicalJson({ items: annotations }),
		"</dsh-annotations>",
		"<dsh-reference-documents>",
		canonicalJson({ documents: serializedDocuments }),
		"</dsh-reference-documents>"
	].join("\n");
	return Object.freeze({
		setId: set.setId,
		annotations: Object.freeze(annotations),
		documents: Object.freeze(serializedDocuments),
		text,
		digest: canonicalSha256({
			schemaVersion: 1,
			setId: set.setId,
			annotations,
			documents: serializedDocuments
		})
	});
}
/** Stable request identity checked independently on Client and Host. */
function submissionRequestDigest(input) {
	if (input.attachments !== void 0) {
		if (input.images !== void 0) throw new TypeError("Specify images or attachments, not both");
		return canonicalSha256({
			schemaVersion: 2,
			text: input.text,
			attachments: input.attachments
		});
	}
	return canonicalSha256({
		text: input.text,
		images: (input.images ?? []).map((image) => ({
			mediaType: image.mediaType,
			data: image.data,
			...image.name === void 0 ? {} : { name: image.name }
		}))
	});
}
/** Stable context identity used by retries, projection and startup reconciliation. */
function annotationContextMessageId(input) {
	return `dsh-annotation:${sha256Hex(canonicalJson(input))}`;
}
/** Strict parser used by tests and future import diagnostics; source strings stay data. */
function parseSerializedAnnotationContext(text) {
	const match = /^<dsh-annotations version="1" set-id="[^"]*">\n([^\n]*)\n<\/dsh-annotations>\n<dsh-reference-documents>\n([^\n]*)\n<\/dsh-reference-documents>$/.exec(text);
	if (match === null) throw new TypeError("Invalid dsh annotation context envelope");
	return {
		annotations: JSON.parse(match[1] ?? ""),
		documents: JSON.parse(match[2] ?? "")
	};
}
//#endregion
//#region src/protocol/schema.ts
const ANNOTATION_PROTOCOL_VERSION = 2;
const NonEmptyStringSchema = z.string().min(1);
const Sha256DigestSchema = z.string().regex(/^sha256:[a-f0-9]{64}$/);
const OccurrenceSchema = z.number().int().nonnegative();
/** Stable Maintenance identity plus the native IDs needed by older DSH builds. */
const MaintenanceLogicalTargetSchema = z.object({
	dshInstanceId: NonEmptyStringSchema.optional(),
	logicalSessionId: NonEmptyStringSchema.optional(),
	logicalAnchorId: NonEmptyStringSchema.optional(),
	legacySessionId: NonEmptyStringSchema.optional(),
	legacyAnchorId: NonEmptyStringSchema.optional()
}).strict();
const MaintenanceLogicalTargetShape = MaintenanceLogicalTargetSchema.shape;
const DshMessageCaptureSchema = z.object({
	selectedText: NonEmptyStringSchema,
	sourceSessionId: NonEmptyStringSchema,
	messageId: NonEmptyStringSchema.optional(),
	anchorId: NonEmptyStringSchema,
	role: z.enum(["user", "assistant"]),
	occurrence: OccurrenceSchema,
	expectedSourceVersionId: z.string().min(1).max(256).optional()
}).strict();
const DshMessageLocatorSchema = z.object({
	...MaintenanceLogicalTargetShape,
	profileId: NonEmptyStringSchema,
	sessionId: NonEmptyStringSchema,
	messageId: NonEmptyStringSchema.optional(),
	anchorId: NonEmptyStringSchema,
	role: z.enum(["user", "assistant"]),
	occurrence: OccurrenceSchema,
	selectedTextHash: Sha256DigestSchema,
	upstream: z.object({
		kind: z.literal("fixed-upstream"),
		referenceId: z.string().min(1).max(256),
		sourceTitle: z.string().max(500),
		sourceVersionId: z.string().min(1).max(256),
		cutoffEventId: z.string().min(1).max(256),
		targetSessionId: z.string().min(1).max(256)
	}).strict().optional()
}).strict();
const ObsidianNoteLocatorSchema = z.object({
	vaultId: NonEmptyStringSchema,
	notePath: NonEmptyStringSchema,
	heading: NonEmptyStringSchema.optional(),
	blockId: NonEmptyStringSchema,
	occurrence: OccurrenceSchema,
	selectedTextHash: Sha256DigestSchema
}).strict();
const SourceSnapshotSchema = z.object({
	markdown: z.string(),
	documentHash: Sha256DigestSchema,
	capturedAt: z.number().int().nonnegative(),
	freshness: z.enum([
		"captured",
		"refreshed",
		"offline"
	])
}).strict();
const DshMessageReferenceSourceSchema = z.object({
	sourceType: z.literal("dsh-message"),
	selectedText: NonEmptyStringSchema,
	locator: DshMessageLocatorSchema
}).strict().superRefine((source, context) => {
	if (source.locator.selectedTextHash !== selectedTextHash(source.selectedText)) context.addIssue({
		code: "custom",
		path: ["locator", "selectedTextHash"],
		message: "selectedTextHash must hash the normalized selectedText"
	});
});
const ObsidianNoteReferenceSourceSchema = z.object({
	sourceType: z.literal("obsidian-note"),
	selectedText: NonEmptyStringSchema,
	locator: ObsidianNoteLocatorSchema,
	snapshot: SourceSnapshotSchema
}).strict().superRefine((source, context) => {
	if (source.locator.selectedTextHash !== selectedTextHash(source.selectedText)) context.addIssue({
		code: "custom",
		path: ["locator", "selectedTextHash"],
		message: "selectedTextHash must hash the normalized selectedText"
	});
	if (source.snapshot.documentHash !== documentHash(source.snapshot.markdown)) context.addIssue({
		code: "custom",
		path: ["snapshot", "documentHash"],
		message: "documentHash must hash the complete normalized Markdown"
	});
});
const ReferenceSourceSchema = z.union([DshMessageReferenceSourceSchema, ObsidianNoteReferenceSourceSchema]);
const ProtocolEnvelopeSchema = { annotationProtocolVersion: z.literal(2) };
const ObsidianReferenceCaptureV2Schema = z.object({
	...ProtocolEnvelopeSchema,
	type: z.literal("reference-capture"),
	dshInstanceId: NonEmptyStringSchema.optional(),
	actionId: NonEmptyStringSchema,
	referenceId: NonEmptyStringSchema,
	source: ObsidianNoteReferenceSourceSchema
}).strict();
const ReferenceClaimV2Schema = z.object({
	...ProtocolEnvelopeSchema,
	type: z.literal("reference-claim"),
	referenceId: NonEmptyStringSchema,
	profileId: NonEmptyStringSchema,
	sessionId: NonEmptyStringSchema,
	setId: NonEmptyStringSchema,
	...MaintenanceLogicalTargetShape
}).strict();
const ReferenceRefreshRequestV2Schema = z.object({
	...ProtocolEnvelopeSchema,
	type: z.literal("reference-refresh"),
	referenceId: NonEmptyStringSchema,
	knownDocumentHash: Sha256DigestSchema
}).strict();
const ReferenceRefreshResultV2Schema = z.discriminatedUnion("kind", [
	z.object({
		kind: z.literal("unchanged"),
		source: ObsidianNoteReferenceSourceSchema
	}).strict(),
	z.object({
		kind: z.literal("refreshed"),
		source: ObsidianNoteReferenceSourceSchema
	}).strict(),
	z.object({ kind: z.literal("offline") }).strict(),
	z.object({
		kind: z.literal("blocked"),
		reason: z.enum([
			"note-missing",
			"block-missing",
			"selection-changed",
			"ambiguous"
		])
	}).strict()
]);
const ReferenceDiscardV2Schema = z.object({
	...ProtocolEnvelopeSchema,
	type: z.literal("reference-discard"),
	referenceId: NonEmptyStringSchema
}).strict();
const ReferenceDeleteRequestV2Schema = z.object({
	...ProtocolEnvelopeSchema,
	type: z.literal("reference-delete-request"),
	actionId: NonEmptyStringSchema,
	referenceId: NonEmptyStringSchema,
	profileId: NonEmptyStringSchema,
	sessionId: NonEmptyStringSchema,
	setId: NonEmptyStringSchema,
	requestedAt: z.number().int().nonnegative(),
	...MaintenanceLogicalTargetShape
}).strict();
const ReferenceDeleteCommitV2Schema = z.object({
	...ProtocolEnvelopeSchema,
	type: z.literal("reference-delete-commit"),
	referenceId: NonEmptyStringSchema,
	profileId: NonEmptyStringSchema,
	sessionId: NonEmptyStringSchema,
	setId: NonEmptyStringSchema,
	deletedAt: z.number().int().nonnegative(),
	...MaintenanceLogicalTargetShape
}).strict();
const BacklinkCommitV2Schema = z.object({
	...ProtocolEnvelopeSchema,
	type: z.literal("backlink-commit"),
	referenceId: NonEmptyStringSchema,
	setId: NonEmptyStringSchema,
	profileId: NonEmptyStringSchema,
	sessionId: NonEmptyStringSchema,
	userMessageId: NonEmptyStringSchema,
	userAnchorId: NonEmptyStringSchema,
	userTextHash: Sha256DigestSchema,
	...MaintenanceLogicalTargetShape
}).strict();
const BacklinkReceiptV2Schema = z.object({
	referenceId: NonEmptyStringSchema,
	commitDigest: Sha256DigestSchema,
	notePath: NonEmptyStringSchema,
	blockId: NonEmptyStringSchema,
	revision: NonEmptyStringSchema,
	writtenAt: z.number().int().nonnegative()
}).strict();
//#endregion
//#region src/protocol/submission-attachments.ts
/** Legacy callers retain their original digest; native RC2 callers use the ordered contract. */
function submissionAttachmentFields(items) {
	if (items.length === 0) return {};
	if (!items.some((item) => "type" in item)) return { images: items };
	if (items.some((item) => !("type" in item))) throw new TypeError("Mixed legacy and ordered attachments");
	return { attachments: items };
}
//#endregion
export { ANNOTATION_PROTOCOL_VERSION, BacklinkCommitV2Schema, BacklinkReceiptV2Schema, DshMessageCaptureSchema, DshMessageLocatorSchema, DshMessageReferenceSourceSchema, MaintenanceLogicalTargetSchema, ObsidianNoteLocatorSchema, ObsidianNoteReferenceSourceSchema, ObsidianReferenceCaptureV2Schema, OccurrenceSchema, ReferenceClaimV2Schema, ReferenceDeleteCommitV2Schema, ReferenceDeleteRequestV2Schema, ReferenceDiscardV2Schema, ReferenceRefreshRequestV2Schema, ReferenceRefreshResultV2Schema, ReferenceSourceSchema, Sha256DigestSchema, SourceSnapshotSchema, annotationContextMessageId, backlinkCommitDigest, canonicalJson, canonicalSha256, documentHash, normalizeSourceText, parseSerializedAnnotationContext, selectedTextHash, serializeAnnotationEnvelope, serializeMaintenanceLogicalTarget, serializePreparedReferenceSet, serializeReferenceDocumentsEnvelope, sha256Hex, submissionAttachmentFields, submissionRequestDigest };

//# sourceMappingURL=protocol.js.map