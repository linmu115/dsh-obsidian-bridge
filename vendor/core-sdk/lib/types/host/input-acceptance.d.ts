import type { Agent } from '@deepseek-ai/dsh-agent';
import type { Context } from '@deepseek-ai/cordis';
import type { InputAcceptance, InputAcceptanceProvider } from '../public/host-api.ts';
/** Optional plugin-owned receipts; the ordinary RC1 path remains durable user events. */
export declare class InputAcceptanceRegistry {
    private readonly providers;
    private readonly listeners;
    register(provider: InputAcceptanceProvider): () => void;
    subscribe(listener: () => void): () => void;
    private notify;
    preview(agent: Agent, messages: readonly Parameters<Agent['send']>[0][], signal: AbortSignal): Promise<void>;
    read(ctx: Context, agent: Agent, ids: readonly string[]): InputAcceptance;
    activeInputIds(agent: Agent): readonly string[];
}
export declare function acceptanceRegistry(ctx: Context): InputAcceptanceRegistry | undefined;
//# sourceMappingURL=input-acceptance.d.ts.map