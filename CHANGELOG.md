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
