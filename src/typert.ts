import type { InvocationDescriptor, TypertRemoteContribution } from "@deepseek-ai/dsh-typert-protocol";
import type { TypertContribution } from "@deepseek-ai/dsh-typert-registry/types";
import { z } from "zod";
export const LIFECYCLE_REMOTE_DESCRIPTORS: readonly InvocationDescriptor[] = [{
  id: "dsh-obsidian-bridge-lifecycle#obsidianBridgeLifecycle/getBridgeConfig",
  service: "obsidianBridgeLifecycle", namespace: "obsidianBridgeLifecycle", method: "getBridgeConfig",
  invocation: { kind: "direct" }, parameters: [],
  result: { mode: "strict", typeSymbol: "dsh-obsidian-bridge-lifecycle#BridgeConfig", schema: z.object({ origin: z.string().url() }).strict() },
}];
export const TYPERT: TypertContribution = {
  package: "dsh-obsidian-bridge-lifecycle", face: "host", schemas: [], invocations: LIFECYCLE_REMOTE_DESCRIPTORS,
  model: { services: [{ key: "obsidianBridgeLifecycle", exportName: "BridgeLifecycleService", members: [], types: [], tags: [], description: "Bridge lifecycle and host configuration." }], events: [], objects: [] },
};
export const LIFECYCLE_REMOTE: TypertRemoteContribution = { package: "dsh-obsidian-bridge-lifecycle", descriptors: LIFECYCLE_REMOTE_DESCRIPTORS };
export default TYPERT;
