import type { ReferenceItem } from '../domain/model.ts';
import type { SourceType } from '../protocol/index.ts';
import type { ClientSourceAdapter } from '../public/client-api.ts';
export declare class ClientSourceRegistry {
    private readonly adapters;
    register(type: SourceType, adapter: ClientSourceAdapter): () => void;
    get(type: SourceType): ClientSourceAdapter | undefined;
    forItem(item: ReferenceItem): ClientSourceAdapter | undefined;
}
//# sourceMappingURL=source-registry.d.ts.map