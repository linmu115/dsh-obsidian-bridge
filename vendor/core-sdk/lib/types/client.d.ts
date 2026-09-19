import type { Context } from './context-types.ts';
import './client/styles.css';
import type { ClientConfig } from './client/service.tsx';
export * from './public/client-api.ts';
export { AnnotationCoreClientService } from './client/service.tsx';
export declare const inject: readonly string[];
export declare function apply(ctx: Context, config?: ClientConfig): Promise<void>;
//# sourceMappingURL=client.d.ts.map