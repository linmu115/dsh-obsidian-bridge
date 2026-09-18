# Vault binding and routed Bridge — 2026-09-18

Version: 0.4.0-rc2.2. Protocol: 0.4.0-rc2.1.

The existing Lifecycle package/service now discovers local candidates, publishes a secret-free stable DSH identity, and creates one controller or surface runtime per explicitly bound Vault. Instance identity is durably saved in the current DSH storage domain (`dsh_obsidian_bridge_identity_v1`); trusted configured/Maintenance identities must agree. Ports and display names do not define identity. Public discovery never publishes authenticated Viewer URLs.

Each runtime pins Vault ID, binding revision, DSH boot/profile and instance. Binding changes and a closed Vault dispose only that route. Callers use `forVault(vaultId)`; unscoped operations reject ambiguity. Sources remain the single Core `obsidian-note` type and route refresh/open/commit/discard/delete through their locator Vault. Core still owns reference state and compensation. Shared action dispatch/readiness includes route context; no consumer owns another cursor.

Binding changes are sent to the Companion CAS writer after a fresh identity probe. The Bridge health panel lists binding/connection state and exposes bind/rebind/unbind. An optional Maintenance business page projects this state and submits the same CAS operations, validates owner identity, changes projection revisions when content changes and bounds serialized snapshots below the shared limit. Maintenance knowledge capability is advertised only while the matching ready service is present; Core/SM absence keeps the Bridge running. Managed session access checks availability and distinguishes workspace exclusion, deletion, offline and mapping-pending.

Validation uses temporary storage/registries and synthetic loopback servers. The real Companion control/data server test covers two Vaults, management handshake, CAS bind, independent controller/Viewer leases, scoped requests, old token rejection after unbind and continued operation of the second Vault. Actual RC2 DomainFacility contract validation plus durable-file restart verifies identity storage. Focused tests cover same-name source routing, binding revision/boot fences, ambiguous targets, optional Core fibers, pending queue behavior, session availability and business-page CAS.

No real instance/Vault was installed, restarted, or changed. No push. Builds ran in place. Runtime behavior against a live DSH+Obsidian desktop was not exercised; the native health controls are covered structurally and the linked-note controls through jsdom. Large Maintenance projections show a bounded subset and direct users to the complete DSH panel; write routing always retains full Vault identities.

Final local validation: TypeScript checks and in-place declaration/browser/host builds passed; 20 test files / 100 tests passed. The optional Node discovery implementation is bundled into the host artifact.
