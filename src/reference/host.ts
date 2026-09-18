import {assertSessionAvailable, type SessionAvailabilityStatus} from "../session-availability.ts";
import { maintenanceLocationRequest, resolvedReferenceLocation } from "./bridge/maintenance-location.ts";
import type { Context as CordisContext } from "@deepseek-ai/cordis";
import type { AnnotationCoreHost } from "dsh-annotation-core/host-api";
import type { ObsidianBridgeLifecycle } from "../api.ts";

import { createObsidianSourceAdapter } from "./host/obsidian-source-adapter.ts";
import { createReferenceDeleteActionHandler } from "./bridge/reference-delete-actions.ts";

type Context = CordisContext & {
  annotationCoreHost: AnnotationCoreHost;
  obsidianBridgeLifecycle: ObsidianBridgeLifecycle;
};



export interface Config { profileId: string; }
export function apply(ctx: Context, config: Config): void {
  const instance = ctx.obsidianBridgeLifecycle.runtimeIdentity?.dshInstanceId;
  const instanceScope = instance === undefined ? {} : { dshInstanceId: instance };
  const bridge = ctx.obsidianBridgeLifecycle.transport!;
  const unregisterSource = ctx.annotationCoreHost.registerSourceAdapter(
    "obsidian-note",
    createObsidianSourceAdapter(bridge, ctx.obsidianBridgeLifecycle.forVault?.bind(ctx.obsidianBridgeLifecycle)),
  );
  const deleteReferenceLink = ctx.annotationCoreHost.deleteReferenceLink?.bind(ctx.annotationCoreHost);
  const unregisterAttachment = deleteReferenceLink === undefined ? () => undefined : ctx.obsidianBridgeLifecycle.registerActionHandler!(
    "references:host-deletions", {
      accepts: action => action.type === "reference-delete-request" && action.profileId === config.profileId,
      handle: async (action, _signal, route) => {
        const applyDelete = createReferenceDeleteActionHandler({ deleteReferenceLink }, route?.transport??bridge, config.profileId, {
          ...instanceScope,
          resolveSession: async action => {
            if (action.type !== "reference-delete-request") return undefined;
            const workspace=ctx.get("maintenanceInstanceWorkspace") as {sessionAvailability(logicalSessionId:string):Promise<{status:SessionAvailabilityStatus}>}|undefined;
            if(action.logicalSessionId&&workspace)assertSessionAvailable(await workspace.sessionAvailability(action.logicalSessionId));
            const resolver = ctx.get("maintenanceReferenceResolver" as never) as { resolve(input: unknown): Promise<unknown> } | undefined;
            if (resolver === undefined) return action.logicalSessionId ? undefined : action.sessionId;
            const resolved = resolvedReferenceLocation(await resolver.resolve(maintenanceLocationRequest(action)));
            return resolved?.sessionId ?? (action.logicalSessionId ? undefined : action.sessionId);
          },
        });
        return await applyDelete(action) ? "handled" : "retry";
      },
    },
  );
  ctx.effect(() => async () => {
    unregisterAttachment();
    unregisterSource();
  }, "dsh-obsidian-bridge: references: host");
}
