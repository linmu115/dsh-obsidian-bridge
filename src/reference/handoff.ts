import type { AnnotationCoreClient } from "dsh-annotation-core/client-api";
import type { ReferenceHandoffInput, ReferenceHandoffResult } from "../api.ts";

/** Core owns the durable operation fence and all compensation. */
export async function handoffReference(core: Pick<AnnotationCoreClient, "addReference" | "discardPendingOperation"> | undefined, input: ReferenceHandoffInput): Promise<ReferenceHandoffResult> {
  if (!core) throw new Error("Annotation Core is unavailable; reference handoff cannot start");
  input.assertCurrent();
  const prepared = await input.prepare();
  input.assertCurrent();
  try {
    const result = await core.addReference(input.sessionId, prepared.source, { operationId: input.operationId, referenceId: prepared.referenceId });
    if (result.referenceId !== prepared.referenceId) throw new Error("Core returned a different reference identity");
    await input.commit(result);
    return result;
  } catch (error) {
    await core.discardPendingOperation(input.sessionId, input.operationId);
    throw error;
  }
}
