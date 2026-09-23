import type {ChangeVaultBindingRequest,VaultBindingSnapshot} from "dsh-obsidian-bridge-protocol/binding";
import type { BridgeConfiguration } from "./api.ts";
import { LIFECYCLE_REMOTE } from "./typert.ts";
import { normalizeBridgeOrigin } from "./control-client.ts";
export async function mountBridgeConfig(ctx: { get(name: string): unknown }): Promise<BridgeConfiguration & { refresh():Promise<BridgeConfiguration>; changeBinding(vaultId:string,input:ChangeVaultBindingRequest):Promise<VaultBindingSnapshot>; dispose(): Promise<void> }> {
  const remote = ctx.get("remote") as { $mount(contribution: typeof LIFECYCLE_REMOTE): Promise<() => Promise<void>> };
  const unmount = await remote.$mount(LIFECYCLE_REMOTE);
  let disposal: Promise<void> | undefined;
  const dispose = () => disposal ??= Promise.resolve().then(unmount);
  try {
    const namespace = ctx.get("remote.obsidianBridgeLifecycle") as {
      getBridgeConfig(): Promise<{ ok: true; value: BridgeConfiguration } | { ok: false; error: { message: string } }>;
    };
    const refresh=async()=>{const result=await namespace.getBridgeConfig();if(!result.ok)throw new Error(result.error.message);return {...result.value,origin:normalizeBridgeOrigin(result.value.origin)};};
    return {...await refresh(),refresh,changeBinding:async(vaultId,input)=>{
      const remote=namespace as unknown as {changeVaultBinding(vaultId:string,input:ChangeVaultBindingRequest):Promise<{ok:true;value:VaultBindingSnapshot}|{ok:false;error:{message:string}}>};
      const result=await remote.changeVaultBinding(vaultId,input);if(!result.ok)throw new Error(result.error.message);return result.value;
    },dispose};
  } catch (error) {
    await dispose();
    throw error;
  }
}
