import {assertMaintenanceSessionAvailable} from "../session-availability.ts";
import { resolveMaintenanceLocation } from "./bridge/maintenance-location.ts";
import type { Context as CordisContext } from "@deepseek-ai/cordis";
import type { AnnotationCoreClient } from "dsh-annotation-core/client-api";
import type { ObsidianBridgeLifecycle } from "../api.ts";

import { BridgeHttpError, bridgeSurfaceIdFromUrl } from "./bridge/http-client.ts";
import { createReferenceDeleteActionHandler } from "./bridge/reference-delete-actions.ts";
import type { OpenNoteAction } from "./protocol.ts";
import { consumeObsidianReferenceCapture } from "./client/annotation-consumer.ts";


type SessionOpeningCore = AnnotationCoreClient & {
  openAnnotationInSession?: (sessionId: string, setId: string, referenceId?: string) => Promise<boolean>;
};
type Context = CordisContext & {
  annotationCore: SessionOpeningCore;
  obsidianBridgeLifecycle: ObsidianBridgeLifecycle;
  sessions: {
    list: { getSnapshot(): { current?: string }; subscribe?(listener: () => void): () => void };
    open(sessionId: string): void;
  };
};



function openSourceAction(notePath: string, blockId?: string): OpenNoteAction {
  return {
    protocolVersion: 1,
    type: "open-note",
    actionId: crypto.randomUUID(),
    notePath,
    ...(blockId === undefined ? {} : { blockId }),
  };
}

export function apply(ctx: Context): void {
  const surfaceId = typeof location === "undefined" ? undefined : bridgeSurfaceIdFromUrl(location.href);
  const identity = ctx.obsidianBridgeLifecycle.runtimeIdentity;
  const profileId = identity?.profileId ?? "web";
  const instance = identity?.dshInstanceId;
  const instanceScope = instance === undefined ? {} : { dshInstanceId: instance };
  const bridge = ctx.obsidianBridgeLifecycle.transport!;
  const deletionHandler = (transport:typeof bridge)=>createReferenceDeleteActionHandler(ctx.annotationCore, transport, profileId, {
    ...instanceScope,
    resolveSession: async action => {
      if (action.type !== "reference-delete-request") return undefined;
      const resolved = await resolveMaintenanceLocation(action);
      await assertMaintenanceSessionAvailable(resolved?.logicalSessionId??action.logicalSessionId);
      return resolved?.sessionId ?? (action.logicalSessionId ? undefined : action.sessionId);
    },
  });
  const unregisterSource = ctx.annotationCore.registerSourceAdapter("obsidian-note", {
    async openSource(item) {
      if (item.sourceType !== "obsidian-note") throw new TypeError("Expected an Obsidian reference");
      await (ctx.obsidianBridgeLifecycle.forVault?.(item.locator.vaultId)??bridge).openNote(openSourceAction(item.locator.notePath, item.locator.blockId));
    },
  });
  const unregisterAttachment = ctx.obsidianBridgeLifecycle.registerActionHandler!("references:client", {
      accepts: action => action.type === "reference-capture" || (action.type === "reference-delete-request" && action.profileId === profileId) || (action.type === "deep-link" && action.setId !== undefined),
      handle: async (action, signal, route) => {
        const actionBridge=route?.transport??bridge;
        signal.throwIfAborted();
        if (action.type === "reference-delete-request") {
          return await deletionHandler(actionBridge)(action) ? "handled" : "retry";
        }
        if (action.type === "reference-capture") {
          // The companion also checks its persisted Web Viewer identity. Do
          // not mutate Core from a standalone page, including with old servers.
          if (surfaceId === undefined) return "ignored";
          if(route&&action.source.locator.vaultId!==route.vaultId)throw new Error("Reference capture Vault identity mismatch");
          const sessionId = ctx.sessions.list.getSnapshot().current;
          if (!sessionId) return "retry";
          if (action.dshInstanceId !== undefined && action.dshInstanceId !== instance) return "ignored";
          const target = await resolveMaintenanceLocation({ sessionId });
          await assertMaintenanceSessionAvailable(target?.logicalSessionId);
          if (target !== undefined && target.sessionId !== sessionId) throw new Error("Capture resolver changed the receiving session identity");
          try { await consumeObsidianReferenceCapture({
            signal,
            capture: action,
            sessionId,
            profileId,
            logicalTarget: { ...instanceScope, legacySessionId: sessionId,
              ...(target?.logicalSessionId ? { logicalSessionId: target.logicalSessionId } : {}) },
            annotationCore: ctx.annotationCore,
            bridge:actionBridge,
          }); } catch (error) {
            if (error instanceof BridgeHttpError && (error.code === "idempotency-conflict" || error.status === 404 || error.status === 410)) return "cancelled";
            throw error;
          }
          return "handled";
        }
        if (action.type === "deep-link" && action.setId !== undefined) {
          if (action.targetSurfaceId !== undefined && action.targetSurfaceId !== surfaceId) return "ignored";
          if (action.dshInstanceId !== undefined && action.dshInstanceId !== instance) return "ignored";
          const resolved = await resolveMaintenanceLocation(action);
          await assertMaintenanceSessionAvailable(resolved?.logicalSessionId??action.logicalSessionId);
          if (action.logicalSessionId && resolved === undefined) return "retry";
          const targetSessionId = resolved?.sessionId ?? action.sessionId;
          await ctx.sessions.open(targetSessionId);
          if (typeof ctx.annotationCore.openAnnotationInSession === "function") {
            return await ctx.annotationCore.openAnnotationInSession(targetSessionId, action.setId, action.referenceId) ? "handled" : "retry";
          }
          ctx.annotationCore.openAnnotation(action.setId, action.referenceId);
          return "handled";
        }
        return "ignored";
      },
  });
      let previousSession = ctx.sessions.list.getSnapshot().current;
      const unsubscribe = ctx.sessions.list.subscribe?.(() => {
        const current = ctx.sessions.list.getSnapshot().current;
        if (current && current !== previousSession) ctx.obsidianBridgeLifecycle.retryActions?.();
        previousSession = current;
      });
      const visibility = () => { if (document.visibilityState !== "hidden") ctx.obsidianBridgeLifecycle.retryActions?.(); };
      if (typeof document !== "undefined") document.addEventListener("visibilitychange", visibility);
  ctx.effect(() => async () => {
    unregisterAttachment();
    unregisterSource();
    unsubscribe?.();
    if (typeof document !== "undefined") document.removeEventListener("visibilitychange", visibility);
  }, "dsh-obsidian-reference-adapter: client");
}
