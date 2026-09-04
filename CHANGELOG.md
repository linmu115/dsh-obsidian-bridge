# Changelog

## 0.3.1 - 2026-09-04

- Rebuild the unchanged lifecycle v3 controller against the Cordis version
  used by DSH 0.1.2-rc.1.
- Preserve bridge attach/detach, controller leases, reconnect, and targeted
  Web Viewer ownership without adding an older Harness compatibility path.
- Resolve the protocol development dependency from the public full commit
  `cfb069a5a09dacfb2e4f64a26036dfe514225132`, so a clean checkout no longer
  depends on the private sibling-worktree layout.
