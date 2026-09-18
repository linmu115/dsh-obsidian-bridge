import {dshInstanceIdentitySchema,vaultIdentitySchema,changeVaultBindingRequestSchema,vaultBindingSnapshotSchema} from "dsh-obsidian-bridge-protocol/binding";
import type { InvocationDescriptor, TypertRemoteContribution } from "@deepseek-ai/dsh-typert-protocol";
import type { TypertContribution } from "@deepseek-ai/dsh-typert-registry/types";
import { z } from "zod";
export const LIFECYCLE_REMOTE_DESCRIPTORS: readonly InvocationDescriptor[] = [{
  id: "dsh-obsidian-bridge#obsidianBridgeLifecycle/getBridgeConfig",
  service: "obsidianBridgeLifecycle", namespace: "obsidianBridgeLifecycle", method: "getBridgeConfig",
  invocation: { kind: "direct" }, parameters: [],
  result: { mode: "strict", typeSymbol: "dsh-obsidian-bridge#BridgeConfig", schema: z.object({ origin: z.string().url(), identity:dshInstanceIdentitySchema.optional(),vaults:vaultIdentitySchema.array().optional(), runtimeIdentity: z.object({ dshInstanceId: z.string().min(1).optional(), profileId: z.string().min(1) }).strict().optional() }).strict() },
}, {
 id:"dsh-obsidian-bridge#obsidianBridgeLifecycle/changeVaultBinding",service:"obsidianBridgeLifecycle",namespace:"obsidianBridgeLifecycle",method:"changeVaultBinding",invocation:{kind:"direct"},
 parameters:[{name:"vaultId",wire:"vaultId",source:"json",codec:{mode:"strict",typeSymbol:"string",schema:z.string().min(1)}},{name:"input",wire:"input",source:"json",codec:{mode:"strict",typeSymbol:"dsh-obsidian-bridge#ChangeVaultBindingRequest",schema:changeVaultBindingRequestSchema}}],
 result:{mode:"strict",typeSymbol:"dsh-obsidian-bridge#VaultBindingSnapshot",schema:vaultBindingSnapshotSchema},
}];
export const TYPERT: TypertContribution = {
  package: "dsh-obsidian-bridge", face: "host", schemas: [], invocations: LIFECYCLE_REMOTE_DESCRIPTORS,
  model: { services: [{ key: "obsidianBridgeLifecycle", exportName: "BridgeLifecycleService", members: [], types: [], tags: [], description: "Bridge lifecycle and host configuration." }], events: [], objects: [] },
};
export const LIFECYCLE_REMOTE: TypertRemoteContribution = { package: "dsh-obsidian-bridge", descriptors: LIFECYCLE_REMOTE_DESCRIPTORS };
export default TYPERT;
