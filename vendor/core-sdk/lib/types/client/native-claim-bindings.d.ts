import type { ComposerBinding } from './composer-binding.tsx';
/** Native command claims may outlive the React rail that first installed them. */
export declare class NativeClaimBindings {
    private readonly bindings;
    register(input: object, sessionId: string, handle: ComposerBinding): () => void;
    submit(input: object, sessionId: string, ...args: Parameters<ComposerBinding['submitClaim']>): ReturnType<ComposerBinding['submitClaim']>;
}
//# sourceMappingURL=native-claim-bindings.d.ts.map