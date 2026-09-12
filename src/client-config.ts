import type { BridgeRuntimeIdentity } from "./api.ts";
import { LIFECYCLE_REMOTE } from "./typert.ts";
import { normalizeBridgeOrigin } from "./control-client.ts";
export async function mountBridgeConfig(ctx: { get(name: string): unknown }): Promise<{ origin: string; runtimeIdentity?: BridgeRuntimeIdentity; dispose(): Promise<void> }> {
  const remote = ctx.get("remote") as { $mount(contribution: typeof LIFECYCLE_REMOTE): Promise<() => Promise<void>> };
  const dispose = await remote.$mount(LIFECYCLE_REMOTE);
  try {
    const namespace = ctx.get("remote.obsidianBridgeLifecycle") as {
      getBridgeConfig(): Promise<{ ok: true; value: { origin: string; runtimeIdentity?: BridgeRuntimeIdentity } } | { ok: false; error: { message: string } }>;
    };
    const result = await namespace.getBridgeConfig();
    if (!result.ok) throw new Error(result.error.message);
    return { origin: normalizeBridgeOrigin(result.value.origin), ...(result.value.runtimeIdentity === undefined ? {} : { runtimeIdentity: result.value.runtimeIdentity }), dispose };
  } catch (error) {
    await dispose();
    throw error;
  }
}
