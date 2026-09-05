# Changelog

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
