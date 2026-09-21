import { VaultBridgeRuntime } from "./vault-runtime.ts";
import type {ChangeVaultBindingRequest} from "dsh-obsidian-bridge-protocol/binding";
import { bridgeSurfaceIdFromUrl } from "./transport.ts";
import { handoffReference } from "./reference/handoff.ts";
import type { AnnotationCoreClient } from "dsh-annotation-core/client-api";
import { apply as mountReferences } from "./reference/client.ts";
import { mountBridgeConfig } from "./client-config.ts";
import { Service, type Context } from "@deepseek-ai/cordis";
import { registerBridgeSettings, type BridgeSettingsSlots } from './binding-settings.tsx';

import type { ObsidianBridgeLifecycle, BridgeRuntimeIdentity } from "./api.ts";
import { BridgeLifecycleRuntime } from "./runtime.ts";

export const inject = ["remote"] as const;

class BridgeLifecycleClientService extends Service implements ObsidianBridgeLifecycle {
  private readonly runtime: VaultBridgeRuntime;
  readonly runtimeIdentity: BridgeRuntimeIdentity;

  constructor(private readonly owner: Context, private readonly config:Awaited<ReturnType<typeof mountBridgeConfig>>) {
    super(owner, "obsidianBridgeLifecycle");
    const ctx = owner;
    const requestOrigin = typeof location === "undefined" ? undefined : location.origin;
    if(!config.identity)throw new Error("Host Bridge does not provide a persistent instance identity");
    this.runtimeIdentity={profileId:config.identity.profileId,dshInstanceId:config.identity.instanceId};
    this.runtime = new VaultBridgeRuntime({identity:config.identity,fallbackOrigin:config.origin,role:"surface",
      ...(typeof location === "undefined" || !bridgeSurfaceIdFromUrl(location.href) ? {} : { surfaceId: bridgeSurfaceIdFromUrl(location.href)! }),
      ...(requestOrigin === undefined ? {} : { requestOrigin }),
    });
    void this.runtime.reconcile(config.vaults??[]);
    let stopped=false;let timer:ReturnType<typeof setTimeout>|undefined;
    const refresh=async()=>{try{await this.refreshVaults();}catch{await this.runtime.reconcile([]);}finally{if(!stopped)timer=setTimeout(()=>{void refresh();},5000);}};
    timer=setTimeout(()=>{void refresh();},5000);
    ctx.effect(()=>()=>{stopped=true;if(timer)clearTimeout(timer);},"obsidian bridge: surface routes");
    ctx.inject(["sessions", "annotationCore"], injected => mountReferences(injected as Parameters<typeof mountReferences>[0]));
    ctx.inject(['slots' as never], scope => {
      scope.effect(() => registerBridgeSettings(scope.get('slots' as never) as unknown as BridgeSettingsSlots, this), 'obsidian bridge: settings');
    });
    ctx.effect(() => () => this.runtime.dispose(), "dsh-obsidian-bridge: client");
  }

  handoffReference: NonNullable<ObsidianBridgeLifecycle["handoffReference"]> = input => {
    const sessions = this.owner.get("sessions" as never) as { scope?(id: string): { get(name: string): unknown } | undefined } | undefined;
    const core = (sessions?.scope?.(input.sessionId)?.get("annotationCore") ?? this.owner.get("annotationCore" as never)) as AnnotationCoreClient | undefined;
    return handoffReference(core, this.runtime.guardHandoff(input));
  };
  getInstanceIdentity=()=>this.config.identity!;
  getCliAvailability=()=>this.config.cli ?? { available: false };
  hasReferenceLocationResolver=()=>this.config.referenceLocationResolverAvailable ?? true;
  forVault=(vaultId:string)=>this.runtime.forVault(vaultId);
  listVaults=()=>this.runtime.listVaults();
  refreshVaults=async()=>{const fresh=await this.config.refresh();if(fresh.identity?.bootId!==this.config.identity?.bootId)throw new Error("Host Bridge boot changed; reload the viewer");if(fresh.cli)this.config.cli=fresh.cli;this.config.referenceLocationResolverAvailable=fresh.referenceLocationResolverAvailable ?? true;await this.runtime.reconcile(fresh.vaults??[]);};
  changeVaultBinding=async(vaultId:string,input:ChangeVaultBindingRequest)=>{const result=await this.config.changeBinding(vaultId,input);await this.refreshVaults();return result;};
  get capabilities() { return this.runtime.capabilities; }
  get transport() { return this.runtime.transport; }
  registerActionHandler: NonNullable<ObsidianBridgeLifecycle["registerActionHandler"]> = (name, handler) => this.runtime.registerActionHandler(name, handler);
  retryActions = () => this.runtime.retryActions();
  getHealth = () => this.runtime.getHealth();
  registerHealthSource: NonNullable<ObsidianBridgeLifecycle["registerHealthSource"]> = (name, source) => this.runtime.registerHealthSource(name, source);
  retry = (name?: string) => this.runtime.retry(name);
  get bridgeOrigin(): string { return this.runtime.bridgeOrigin; }
  getSnapshot = () => this.runtime.getSnapshot();
  subscribe = (listener: () => void) => this.runtime.subscribe(listener);
  mountWhenReady: ObsidianBridgeLifecycle["mountWhenReady"] = (name, mount) => this.runtime.mountWhenReady(name, mount);
  drain = (reason: string, deadlineMs?: number) => this.runtime.drain(reason, deadlineMs);
  resume = () => this.runtime.resume();
}

export async function apply(ctx: Context): Promise<void> {
  const abort = new AbortController();
  ctx.effect(() => () => abort.abort(), "dsh-obsidian-bridge: client startup");
  const config = await mountBridgeConfig(ctx);
  try {
    abort.signal.throwIfAborted();
    new BridgeLifecycleClientService(ctx, config);
    ctx.effect(() => config.dispose, "dsh-obsidian-bridge: client remote");
  } catch (error) {
    await config.dispose();
    throw error;
  }
}
