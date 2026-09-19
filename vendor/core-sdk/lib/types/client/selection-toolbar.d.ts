import type { Context } from '../context-types.ts';
import type { DshMessageCapture } from '../protocol/index.ts';
import type { AnnotationCoreClientService } from './service.tsx';
import { type SelectionController, type SelectionSnapshot } from './selection-capture.ts';
export declare function messageCapture(selection: SelectionSnapshot): DshMessageCapture;
export declare function SelectionToolbar(props: {
    core: AnnotationCoreClientService;
    controller: SelectionController;
}): import("react").JSX.Element;
export declare function applyNativeSelection(ctx: Context, core: AnnotationCoreClientService): void;
//# sourceMappingURL=selection-toolbar.d.ts.map