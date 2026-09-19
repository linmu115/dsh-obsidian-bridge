import s from '@deepseek-ai/schemastery';
import type { Context } from './context-types.ts';
export * from './public/host-api.ts';
export { SourcePreparationError } from './host/source-registry.ts';
export type { SourcePreparationErrorCode } from './host/source-registry.ts';
export declare const name = "dsh-annotation-core";
export interface Config {
    profileId: string;
}
export declare const Config: s<Schemastery.ObjectS<{
    profileId: s<string, string>;
}>, Schemastery.ObjectT<{
    profileId: s<string, string>;
}>>;
export declare const inject: readonly string[];
export declare function apply(ctx: Context, config: Config): Promise<void>;
//# sourceMappingURL=index.d.ts.map