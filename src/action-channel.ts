import type { BorrowedBridgeTransport, BridgeActionHandler, ObsidianBridgeLifecycle } from "./api.ts";
import { createBridgeHttpClient, type BridgeHttpClient, type BridgeHttpClientOptions } from "./transport.ts";
import { startReferencePolling, type ReferencePollingHandle } from "./reference/bridge/reference-polling.ts";

/** One cursor and acknowledgement authority per host or surface runtime. */
export class BridgeActionChannel {
  private readonly transport: BridgeHttpClient;
  readonly borrowedTransport: BorrowedBridgeTransport;
  private handlers = new Map<string, BridgeActionHandler>();
  private polling: ReferencePollingHandle | undefined;
  private readonly detach: () => void;
  constructor(lifecycle: ObsidianBridgeLifecycle, private options: BridgeHttpClientOptions & { role: "controller" | "surface"; profileId?: string }) {
    this.transport = createBridgeHttpClient(options);
    const { dispose: _dispose, nextActions: _next, acknowledgeAction: _ack, acknowledgeDeepLink: _ackNavigation, ...borrowed } = this.transport;
    this.borrowedTransport = Object.freeze(borrowed);
    this.detach = lifecycle.mountWhenReady("bridge:actions", () => {
      this.polling = startReferencePolling(this.transport, async (action, signal) => {
        if ("profileId" in action && action.profileId !== (options.profileId ?? "web")) return "ignored";
        if (action.dshInstanceId !== undefined && action.dshInstanceId !== options.dshInstanceId) return "ignored";
        if (action.type === "deep-link" && action.targetSurfaceId !== undefined && action.targetSurfaceId !== options.surfaceId) return "ignored";
        if (options.role === "controller" && action.type !== "reference-delete-request") return "ignored";
        if (action.type === "reference-capture" && options.surfaceId === undefined) return "ignored";
        const owners = [...this.handlers.values()].filter(handler => handler.accepts(action));
        if (owners.length > 1) throw new Error(`Multiple Bridge action owners for ${action.type}`);
        if (!owners[0]) return "retry";
        const result = await owners[0].handle(action, signal);
        return result === false ? "retry" : result;
      }, {
        ephemeralNavigation: action => options.role === "surface" && action.type === "deep-link" && action.setId === undefined
          && (action.dshInstanceId === undefined || action.dshInstanceId === options.dshInstanceId)
          && (action.targetSurfaceId === undefined || action.targetSurfaceId === options.surfaceId)
          && [...this.handlers.values()].filter(handler => handler.accepts(action)).length === 1,
        isVisible: () => typeof document === "undefined" || document.visibilityState !== "hidden",
        onError: error => console.warn("[dsh-obsidian-bridge] action transport unavailable", error),
        onActionError: (error, action) => console.warn("[dsh-obsidian-bridge] action failed", { actionId: action.actionId, error }),
      });
      const unregisterHealth = lifecycle.registerHealthSource?.("actions", this.polling);
      const polling = this.polling;
      return () => { polling.stop(); unregisterHealth?.(); if (this.polling === polling) this.polling = undefined; };
    });
  }
  registerActionHandler = (name: string, handler: BridgeActionHandler): (() => void) => {
    if (this.handlers.has(name)) throw new Error(`Bridge action handler already registered: ${name}`);
    this.handlers.set(name, handler); this.retryActions();
    return () => { if (this.handlers.get(name) === handler) this.handlers.delete(name); };
  };
  retryActions = (): void => { this.polling?.retry(); };
  dispose(): void { this.detach(); this.polling?.stop(); this.handlers.clear(); this.transport.dispose(); }
}
