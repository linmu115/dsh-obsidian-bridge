import { afterEach, expect, it, vi } from "vitest";
import { apply } from "../src/reference/client.ts";

const mocks = vi.hoisted(() => ({
  polling: vi.fn(), consume: vi.fn(async () => ({})), resolve: vi.fn(async () => undefined),
}));
vi.mock("../src/reference/bridge/reference-polling.ts", () => ({ startReferencePolling: mocks.polling }));
vi.mock("../src/reference/bridge/maintenance-location.ts", () => ({ resolveMaintenanceLocation: mocks.resolve }));
vi.mock("../src/reference/client/annotation-consumer.ts", () => ({ consumeObsidianReferenceCapture: mocks.consume }));
vi.mock("../src/reference/bridge/http-client.ts", async importOriginal => ({
  ...await importOriginal<object>(), createBridgeHttpClient: () => ({ dispose: vi.fn() }),
}));
afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); });

function page(embedded: boolean, resolverAvailable?: boolean) {
  const suffix = embedded ? "#dshBridgeSurface=7b31f255-d087-4f8e-bdd6-d09a61860819" : "";
  vi.stubGlobal("location", { href: "http://127.0.0.1:51882/" + suffix });
  const current: { sessionId?: string } = { sessionId: embedded ? "obsidian-session" : "desktop-session" };
  mocks.polling.mockReturnValue({ stop: vi.fn(), retry: vi.fn() });
  apply({
    sessions: { list: { getSnapshot: () => ({ current: current.sessionId }) }, open: vi.fn() },
    annotationCore: { registerSourceAdapter: () => vi.fn() },
    obsidianBridgeLifecycle: { runtimeIdentity: { dshInstanceId: "copy", profileId: "web" }, bridgeOrigin: "http://127.0.0.1:18473",
      ...(resolverAvailable === undefined ? {} : { hasReferenceLocationResolver: () => resolverAvailable }),
      transport: {}, registerActionHandler: (_key: string, handler: {handle: unknown}) => { mocks.polling({}, handler.handle); return vi.fn(); } },
    effect: vi.fn(),
  } as never);
  const receive = mocks.polling.mock.calls.at(-1)![1] as (action: object, signal: AbortSignal) => Promise<string>;
  return { current, receive: (action = { type: "reference-capture", actionId: "action", referenceId: "reference", dshInstanceId: "copy" } as object) => receive(action, new AbortController().signal) };
}

it("ignores captures on standalone DSH before resolving a session or mutating Core, even if an old server returns one", async () => {
  const desktop = page(false);
  expect(await desktop.receive()).toBe("ignored");
  expect(mocks.resolve).not.toHaveBeenCalled();
  expect(mocks.consume).not.toHaveBeenCalled();
});

it("receives a native reference without requesting an absent optional location resolver", async () => {
  const embedded = page(true, false);
  expect(await embedded.receive()).toBe("handled");
  expect(mocks.resolve).not.toHaveBeenCalled();
  expect(mocks.consume).toHaveBeenCalledWith(expect.objectContaining({
    sessionId: "obsidian-session",
    logicalTarget: { dshInstanceId: "copy", legacySessionId: "obsidian-session" },
  }));
});

it("keeps failures of an installed resolver visible instead of falling back to native data", async () => {
  const embedded = page(true, true);
  mocks.resolve.mockRejectedValueOnce(new Error("resolver unavailable"));
  await expect(embedded.receive()).rejects.toThrow("resolver unavailable");
  expect(mocks.consume).not.toHaveBeenCalled();
});

it("does not reinterpret a logical historical target as a native session when its resolver is absent", async () => {
  const embedded = page(true, false);
  await expect(embedded.receive({ type: "deep-link", setId: "set", sessionId: "old-native", logicalSessionId: "logical" })).rejects.toThrow("会话解析服务");
  expect(mocks.resolve).not.toHaveBeenCalled();
  expect(mocks.consume).not.toHaveBeenCalled();
});

it("uses the session currently open inside Obsidian and waits when that page has no session", async () => {
  const embedded = page(true);
  expect(await embedded.receive()).toBe("handled");
  expect(mocks.consume).toHaveBeenLastCalledWith(expect.objectContaining({ sessionId: "obsidian-session" }));
  embedded.current.sessionId = "next-obsidian-session";
  expect(await embedded.receive()).toBe("handled");
  expect(mocks.consume).toHaveBeenLastCalledWith(expect.objectContaining({ sessionId: "next-obsidian-session" }));
  delete embedded.current.sessionId;
  expect(await embedded.receive()).toBe("retry");
  expect(mocks.consume).toHaveBeenCalledTimes(2);
});
