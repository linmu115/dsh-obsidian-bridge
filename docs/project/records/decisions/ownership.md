---
{
  "id": "DEC-ownership",
  "kind": "decision",
  "title": "按数据种类分配唯一写入责任",
  "status": "current",
  "summary": "Vault 拥有正文，Maintenance 拥有会话和已迁入结构，Core 拥有当前引用事务。",
  "sources": [
    {
      "path": "../../../../worktrees/session-context-graph-20260913/dsh-obsidian-session-reference-suite/README.md",
      "role": "current-workspace-source"
    },
    {
      "path": "../../../../worktrees/rc2-adapt-20260912/obsidian-deepharness-bridge/README.md",
      "role": "current-workspace-source"
    },
    {
      "path": "../../../../worktrees/session-context-graph-20260913/dsh-session-maintenance/docs/extensions/plugin-data-integration.md",
      "role": "current-workspace-source"
    },
    {
      "path": "../../../obsidian-deepharness-bridge/docs/project/records/modules/obsidian-companion/integrations/maintenance.md",
      "role": "linked-authority"
    }
  ],
  "relations": [
    {
      "relation": "supports",
      "to": {
        "record_id": "NC08",
        "project_id": "ddcdd580-5275-5eef-9578-6de0e81fa887"
      },
      "reason": "避免另建历史备份"
    },
    {
      "relation": "constrains",
      "to": {
        "record_id": "INT-maintenance-directory",
        "project_id": "ddcdd580-5275-5eef-9578-6de0e81fa887"
      },
      "reason": "镜像不可接管事务"
    }
  ]
}
---

# 按数据种类分配唯一写入责任

当前组合让 Vault 管笔记正文，Maintenance 管会话以及已迁入的贴纸、知识链接和主干图，Core 管正在准备/发送的引用事务。Companion 保存身份、回执、待处理同步和 Owned 标记责任。

这样，重新打开 Viewer、建立知识关联和目录重建不需要复制整篇笔记或整份会话。镜像只用于有界阅读，不能成为新的提交或撤销接口。扩展冲突保留双方内容，调用方不能把未经确认的编辑显示为已保存。

迁移须冻结旧写入、导入并核对回执，再切换所有者；“真源已改为 Maintenance”不授权删除未迁移数据。详见 [[EXT-maintenance|外部扩展合同]] 和 [Companion 接入说明](../../../../../obsidian-deepharness-bridge/docs/project/records/modules/obsidian-companion/integrations/maintenance.md)。

这是来源中已明确的设计，不是本地图新提出的重构。
