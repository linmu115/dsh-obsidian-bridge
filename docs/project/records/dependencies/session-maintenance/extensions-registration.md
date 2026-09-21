---
{
  "id": "INT-suite-extension-pages",
  "kind": "implementation",
  "title": "Obsidian 系列接入公开扩展页与实例范围",
  "status": "current",
  "progress": "",
  "gap": "",
  "summary": "说明已归档；当前说明见 INT-maintenance-offline-binding",
  "sources": [
    {
      "path": "../../../../worktrees/session-context-graph-20260913/dsh-session-maintenance/docs/superpowers/specs/2026-09-18-extension-pages-and-instance-scope.md"
    },
    {
      "path": "../../../../worktrees/session-context-graph-20260913/dsh-obsidian-session-reference-suite/docs/2026-09-18-vault-instance-binding-design.md"
    },
    {
      "path": "../../../../worktrees/session-context-graph-20260913/dsh-obsidian-session-reference-suite/docs/project/records/migration/current-entrypoints.md",
      "role": "linked-authority"
    }
  ],
  "relations": [
    {
      "relation": "consumes",
      "to": {
        "project_id": "0d05f813-7097-47d9-9e88-3d523bb537d6",
        "record_id": "IF-extension-pages"
      },
      "reason": "Bridge 贡献绑定、状态、数据目录和管理栏目"
    },
    {
      "relation": "consumes",
      "to": {
        "project_id": "0d05f813-7097-47d9-9e88-3d523bb537d6",
        "record_id": "IF-instance-workspace-scope"
      },
      "reason": "读取实例运行时分类范围快照并在操作时复核"
    },
    {
      "relation": "consumes",
      "to": {
        "record_id": "IF-vault-binding"
      },
      "reason": "管理页使用与 Obsidian 设置页相同的绑定入口"
    },
    {
      "relation": "implements",
      "to": {
        "record_id": "REQ-vault-instance-binding"
      },
      "reason": "可选维护集成与双侧独立运行"
    }
  ],
  "documentation": {
    "state": "archived",
    "reason": "0.4.1-rc2.8 源码不再注册 Maintenance 业务扩展页：src/index.ts 已无 maintenanceBusinessPages 引用，仅 src/vault-folder.ts 的类型仍被 obsidian-cli.ts 使用；绑定与连接入口改由本插件设置页的 settings.section 槽提供。本批独立实例未安装、未验收该协作路径。",
    "evidence": "已对照当前 src/index.ts（无 maintenanceBusinessPages/registerBridgeBusinessPage 调用）、src/client.ts 的 slots 注册、src/binding-settings.tsx 与 tests/binding-settings.test.ts；安装与验收边界见 records/verification/rc28-install-and-acceptance-20260920.md",
    "archived_at": "2026-09-21T07:33:30.827689+00:00",
    "archive_path": "archive/records/a25f33631d39-0d086d203ceb.md",
    "sha256": "b121aaef258a4117bf122edf5ab501d2dcf5e7abdfa76723d0e625c48744dbc7",
    "original_path": "records/dependencies/session-maintenance/extensions-registration.md",
    "original_line": 56,
    "original_end_line": 67,
    "map_version": {
      "git_head": "9d21bf1d7028b3ddb3bc8b31f5cad259c9e291f8",
      "branch": "codex/independent-plugins-20260920",
      "dirty": true
    },
    "successor": "INT-maintenance-offline-binding",
    "current_gap": false
  }
}
---
这份说明已归档，不代表相关功能退役或需求撤销。

原因：0.4.1-rc2.8 源码不再注册 Maintenance 业务扩展页：src/index.ts 已无 maintenanceBusinessPages 引用，仅 src/vault-folder.ts 的类型仍被 obsidian-cli.ts 使用；绑定与连接入口改由本插件设置页的 settings.section 槽提供。本批独立实例未安装、未验收该协作路径。

当前说明：[[INT-maintenance-offline-binding]]。

需要旧正文时显式查看历史；默认查询只返回本提示和替代定位。
