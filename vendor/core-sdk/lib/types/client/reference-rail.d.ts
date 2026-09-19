import type { ReferenceItem, ReferenceSet } from '../domain/model.ts';
import type { ReferenceSessionStore } from './composer-binding.tsx';
export interface ReferenceRailProps {
    readonly layout: 'default' | 'narrow';
    readonly store: ReferenceSessionStore;
    readonly open: (set: ReferenceSet, referenceId?: string, anchor?: DOMRect) => void;
    readonly remove: (referenceId: string) => Promise<void>;
    readonly jump?: ((item: ReferenceItem) => Promise<void>) | undefined;
}
export declare function ReferenceRail({ layout, store, open, remove, jump }: ReferenceRailProps): import("react").JSX.Element | null;
//# sourceMappingURL=reference-rail.d.ts.map