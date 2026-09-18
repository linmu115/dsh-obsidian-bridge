# Single Bridge plugin package — 0.4.1-rc2.1

The product is now `dsh-obsidian-bridge`. The repository directory retains its old name to avoid breaking local source links. The published package, host plugin name, browser ModuleLoader ID and Typert package/descriptors agree on the new name. Its bundle patch loads only the Bridge node; it does not wrap or install Core, ordinary Sticker or Maintenance.

## Public surface and packaging

- Public entries: root, `/client`, `/api`, `/transport`, `/typert`, `/protocol`, `/protocol/data`, `/protocol/binding`, `/cordis.patch.yml`.
- Build output is `dist`. Runtime transport, lifecycle, data and binding protocol implementations are bundled. Protocol is a development dependency only, with no runtime peer requirement.
- Public declarations inline Protocol and the required Core protocol shapes, so consumers do not require retired package types. Host declarations continue to use actual host Cordis/Schemastery/Typert and Zod types.
- The package files allowlist excludes old `lib`; existing old build files are retained locally rather than recursively deleting them.
- No Lifecycle wrapper, Reference Adapter receiver, Suite group or second poll owner is introduced. Service key `obsidianBridgeLifecycle`, storage domain `dsh_obsidian_bridge_identity_v1`, identity URL and existing routed runtime APIs are preserved.

## Ownership and migration

Core owns reference runtime state, styles/UI, bubbles, context assembly/injection, commit and compensation. Bridge retains only existing Core source registration and handoff orchestration plus Obsidian transport, binding and location. Core + Bridge therefore handles Obsidian references without ordinary Sticker; ordinary Sticker remains a separate business plugin. Core absence leaves the bridge available; source registration follows optional Core fiber lifetime. Maintenance remains optional.

Installation migration must remove the old Suite group and old Lifecycle/Adapter runtime nodes, carry trusted instance/profile configuration into the single new Bridge node, and keep independently requested Core/Sticker nodes once each. Preserve the actual instance storage root and Obsidian data.json. Package rename alone is not a binding migration, and old unscoped work must not be reassigned. The root task owns configuration migration; this change does not install or restart anything.

## Validation

- TypeScript no-emit validation passes.
- Host ESM, ModuleLoader browser JS and bundled public declarations build successfully.
- 21 test files / 102 tests pass, including identity persistence, explicit binding, multi-Vault routing, real Companion HTTP binding/lease fences, shared queue retry/ack, Core compensation and optional Maintenance availability.
- `published-package.test.ts` physically copies the published runtime into an OS temporary fixture, links only named host dependencies, and verifies that Core, Sticker, Maintenance and all four retired packages cannot resolve. Root/API/transport/Typert/protocol entries import successfully, the browser ModuleLoader factory executes, and a consumer of public declarations typechecks. Browser-safe exports are recursively checked for Node-only imports.
- `optional-core-fiber.test.ts` uses real Cordis fibers: host and surface remain alive without Core/SM; late Core registers exactly one source and action handler; uninstall/reinstall cleans up and reattaches once. No Sticker service is installed in these fixtures.
- `npm pack --ignore-scripts --dry-run --json` confirms the new package identity and a manifest containing `dist`, the single-node patch and documentation, with no old `lib` or source runtime payload.

These checks validate package isolation and the existing runtime mechanisms with synthetic identities and temporary directories. They do not replace real DSH/Obsidian acceptance, which remains pending. No real session, Vault, binding, data.json or installed profile was changed.
