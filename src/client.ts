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
  private stopped = false;
  private refreshWork: Promise<void> | undefined;
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
    const initialRouting = this.runtime.reconcile(config.vaults??[]);
    void initialRouting.catch(()=>undefined);
    let timer:ReturnType<typeof setTimeout>|undefined;
    const refresh=async()=>{try{await this.refreshVaults();}catch{if(!this.stopped)await this.runtime.reconcile([]);}finally{if(!this.stopped)timer=setTimeout(()=>{void refresh();},5000);}};
    timer=setTimeout(()=>{void refresh();},5000);
    ctx.effect(()=>async()=>{
      this.stopped=true;if(timer)clearTimeout(timer);
      // Unmount remote descriptors first so pending RPCs can settle, then close
      // route resources. One disposer expresses this required ordering.
      try{await config.dispose();}finally{
        await Promise.allSettled([initialRouting,this.refreshWork]);
        await this.runtime.dispose();
      }
    },"obsidian bridge: surface routes and remote");
    ctx.inject(["sessions", "annotationCore"], injected => mountReferences(injected as Parameters<typeof mountReferences>[0]));
    ctx.inject(['slots' as never], scope => {
      scope.effect(() => registerBridgeSettings(scope.get('slots' as never) as unknown as BridgeSettingsSlots, this), 'obsidian bridge: settings');
    });
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
  refreshVaults=():Promise<void>=>{
    if(this.stopped)return Promise.reject(new Error('Bridge client stopped'));
    return this.refreshWork??=(async()=>{
      const fresh=await this.config.refresh();
      if(this.stopped)return;
      if(fresh.identity?.bootId!==this.config.identity?.bootId)throw new Error("Host Bridge boot changed; reload the viewer");
      if(fresh.cli)this.config.cli=fresh.cli;
      this.config.referenceLocationResolverAvailable=fresh.referenceLocationResolverAvailable ?? true;
      await this.runtime.reconcile(fresh.vaults??[]);
    })().finally(()=>{this.refreshWork=undefined;});
  };
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
    if(ctx.fiber.uid===null){await config.dispose();return;}
    new BridgeLifecycleClientService(ctx, config);
  } catch (error) {
    await config.dispose();
    throw error;
  }
}
