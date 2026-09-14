# Session main graph compatibility release

Lifecycle `0.3.3-rc2.12` accepts Annotation Core `0.3.12-rc2.8` while retaining the earlier supported versions. The development archive and lockfile now resolve the exact Core candidate from `artifacts/session-main-graph-20260914`.

This is a compatibility release for strict resolution of the 19-plugin RC2 profile. Bridge lifecycle behavior, protocol 3, and the Vault companion are unchanged. Sticker, Reference Adapter, and Session Reference Suite need to accept this Lifecycle version in their own peer ranges; no other installed package consumes Lifecycle or Sidechat.

Validation on 2026-09-15: offline install with scripts disabled, `pnpm typecheck`, all 4 test files / 34 tests, build, and package creation passed. Artifacts are prepared locally only; no live profile, Engine, or Vault was changed.
