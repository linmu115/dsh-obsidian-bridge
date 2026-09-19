import type { AddReferenceInput, CompleteReferenceCommitInput, CreateReferenceSetInput, ReferenceItem, ReferenceSet, ReferenceSetState, ReuseReferenceInput } from './model.ts';
export declare class ReferenceRevisionConflictError extends Error {
    readonly expected: number;
    readonly actual: number;
    constructor(expected: number, actual: number);
}
export declare class ReferenceConflictError extends Error {
    readonly referenceId: string;
    constructor(referenceId: string);
}
export declare class ReferenceStateError extends Error {
    readonly expected: ReferenceSetState | readonly ReferenceSetState[];
    readonly actual: ReferenceSetState;
    constructor(expected: ReferenceSetState | readonly ReferenceSetState[], actual: ReferenceSetState);
}
export declare function createPendingReferenceSet(input: CreateReferenceSetInput): ReferenceSet;
export interface AddReferenceResult {
    readonly disposition: 'added' | 'existing';
    readonly set: ReferenceSet;
    readonly item: ReferenceItem;
}
export declare function addReference(set: ReferenceSet, input: AddReferenceInput, expectedRevision: number): AddReferenceResult;
export declare function updateReferenceComment(set: ReferenceSet, referenceId: string, userComment: string, expectedRevision: number): ReferenceSet;
export declare function removeReference(set: ReferenceSet, referenceId: string, expectedRevision: number): ReferenceSet;
export declare function beginReferenceCommit(set: ReferenceSet, expectedRevision: number): ReferenceSet;
export declare function markReferenceCommitFailed(set: ReferenceSet, expectedRevision: number): ReferenceSet;
export declare function restoreFailedReferenceCommit(set: ReferenceSet, expectedRevision: number): ReferenceSet;
export declare function completeReferenceCommit(set: ReferenceSet, input: CompleteReferenceCommitInput): ReferenceSet;
export declare function reuseReference(sourceSet: ReferenceSet, sourceReferenceId: string, input: ReuseReferenceInput): ReferenceSet;
//# sourceMappingURL=state-machine.d.ts.map