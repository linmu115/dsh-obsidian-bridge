## 0.4.1-rc2.9 — 2026-09-22

- Open privileged JavaScript eval and plugin install/uninstall/enable/disable through the bound official CLI. Treat all eval as a write for durable request receipts.
- Add config:dir and fs:list/stat/read/write/append/mkdir/remove using the native Obsidian Adapter through CLI eval; preserve Unicode and literal source code, support paginated reads and chunked text deployment.
- Allow hidden Vault paths while preserving traversal/junction checks for structured file commands. Eval and plugin code explicitly have process privileges and are not path-sandboxed.
- No new plugin dependencies or Companion update; guide, project map and acceptance scope updated. See docs/RELEASE-20260922.md.

## 0.4.1-rc2.2 — 2026-09-18

- Add “选择文件夹并绑定” to the optional Maintenance plugin information page. Open a Windows native folder picker with cancellation and a 60-second limit.
- Read only the selected Vault root and Bridge installation, then match a live Companion location proof to its canonical path and Vault/publisher/boot identity before the existing CAS binding protocol runs.
- Reject copied Vault identities, offline or conflicting discoveries, changed publishers and foreign bindings. Selecting a Vault already bound to this instance succeeds without writing.
- Keep Maintenance optional and preserve the existing explicit rebind/unbind controls. See [folder binding report](docs/changes/2026-09-18-vault-folder-binding.md).

## 0.4.1-rc2.1 — 2026-09-18

- Publish one plugin as `dsh-obsidian-bridge`, with its own single-node bundle patch and matching host, ModuleLoader and Typert package identities.
- Bundle protocol runtime and public declarations into `dist`; expose `/protocol`, `/protocol/data`, `/protocol/binding`, `/api` and `/transport` without requiring any retired bridge packages.
- Preserve the `obsidianBridgeLifecycle` service, durable identity storage and identity URL. Core, Sticker and Maintenance remain independent capabilities.
- Verify public exports in a physical isolated fixture containing only this bridge and host dependencies, including no-Core startup/late-Core registration regressions.

See [single bridge package report](docs/changes/2026-09-18-single-bridge-package.md).

## 0.4.0-rc2.1 — 2026-09-18

## 0.4.0-rc2.2 — 2026-09-18

- Persist DSH instance identity, discover local Vault candidates, and route independent bound runtimes by Vault identity/revision/boot.
- Keep source transactions and queue ownership in the integrated Bridge; preserve Core compensation and optional Maintenance availability checks.
- Add binding controls to the Bridge health panel and an optional Maintenance business page using the Companion CAS writer.

Consolidate existing reference transport, sources, delivery, navigation and health into Bridge; provide borrowed transport, action registration and Core-compensated handoff.

See [integration report](docs/changes/2026-09-18-bridge-consolidation.md).

# Changelog

## 0.3.3-rc2.3 — 2026-09-13

- Accept Core 0.3.12-rc2.1 alongside the previous RC2 peers.
- Build with the Core 0.3.12-rc2.1 protocol while preserving the existing data formats.
- Keep existing runtime behavior; P2 session stickers and Obsidian data migration are not part of this release.
- Validation and its limits are recorded in docs/changes/2026-09-13-upstream-core-compatibility.md.

## 0.3.3-rc2.2 — 2026-09-12

Complete instance scope across durable capture, authenticated Core deletion, persisted reference ownership and Sticker backlink transport/matching. Legacy unscoped data remains unchanged. See deployment evidence for the tested combination.


## 0.3.3-rc2.1 — DSH 0.1.5-rc.2 (2026-09-12)

29 tests passed. Host publishes runtimeIdentity to clients. Distinct controller IDs prevent one DSH instance invalidating another. Scoped data clients require instance-routing-v1 and a matching handshake identity.


## 0.3.2 - Unreleased

- Make shutdown idempotent and awaitable, cancel bounded control requests, and guard late status, lease, and attachment results against shutdown and Bridge boot changes.
- Export the browser-neutral shared data transport at `./transport`; preserve annotation v2, sticker v1, and lifecycle v3 contracts while adding cancellation and full-response timeouts.
- Deliver the host-selected loopback origin through a typed Remote configuration endpoint before browser lifecycle startup.
- Expose additive component health, subscriptions, and targeted retry through the lifecycle service.

## 0.3.1 - 2026-09-04

- Rebuild the unchanged lifecycle v3 controller against the Cordis version
  used by DSH 0.1.2-rc.1.
- Preserve bridge attach/detach, controller leases, reconnect, and targeted
  Web Viewer ownership without adding an older Harness compatibility path.
- Resolve the protocol development dependency from the public full commit
  `cfb069a5a09dacfb2e4f64a26036dfe514225132`, so a clean checkout no longer
  depends on the private sibling-worktree layout.
## Unreleased — 2026-09-19

- Remove the Bridge's “Obsidian 连接和同步” tab registration from BetterSidebar. Connection, synchronization, binding services and the optional Maintenance business page remain available.
