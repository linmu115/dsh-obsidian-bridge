---
{
  "id": "EXT-maintenance",
  "kind": "dependency",
  "title": "外部依赖：Session Maintenance",
  "status": "current",
  "summary": "仅保留 Bridge 所需的会话身份、固定来源、结构真源和接口定位，不归入 Bridge 内部实现。",
  "sources": [
    {
      "path": "../../../../worktrees/session-context-graph-20260913/dsh-session-maintenance/docs/project/project.yaml"
    },
    {
      "path": "../../../dsh-annotation-core/docs/project/records/modules/annotation-core/context.md",
      "role": "linked-authority"
    },
    {
      "path": "../../../dsh-session-sticker-board/docs/project/records/modules/sticker-board/integrations/maintenance.md",
      "role": "linked-authority"
    },
    {
      "path": "../../../obsidian-deepharness-bridge/docs/project/records/modules/obsidian-companion/integrations/maintenance.md",
      "role": "linked-authority"
    },
    {
      "path": "../../../dsh-annotation-core/docs/project/records/modules/annotation-core/integrations/maintenance-directory.md",
      "role": "linked-authority"
    },
    {
      "path": "../../../../worktrees/session-context-graph-20260913/dsh-obsidian-session-reference-suite/docs/project/records/migration/current-entrypoints.md",
      "role": "linked-authority"
    }
  ],
  "relations": [
    {
      "relation": "references",
      "to": {
        "record_id": "IF-extension",
        "project_id": "0d05f813-7097-47d9-9e88-3d523bb537d6"
      },
      "reason": "业务结构合同在独立地图"
    },
    {
      "relation": "references",
      "to": {
        "record_id": "IF-graph",
        "project_id": "0d05f813-7097-47d9-9e88-3d523bb537d6"
      },
      "reason": "固定来源与图关系合同"
    },
    {
      "relation": "references",
      "to": {
        "record_id": "IF-native-context",
        "project_id": "0d05f813-7097-47d9-9e88-3d523bb537d6"
      },
      "reason": "实际原生生效合同"
    }
  ]
}
---

# 外部依赖：Session Maintenance

Session Maintenance 是独立项目，ID 为 0d05f813-7097-47d9-9e88-3d523bb537d6。它是独立可选协作者；会话真源、稳定身份和已迁入业务结构在该地图维护。

本组合具体消费方：[Core 固定来源与原生上下文](../../../../../../dsh-annotation-core/docs/project/records/modules/annotation-core/context.md) → IF-graph / IF-native-context；[Sticker 会话与贴纸](../../../../../../dsh-session-sticker-board/docs/project/records/modules/sticker-board/integrations/maintenance.md)及[Companion 知识关联](../../../../../../obsidian-deepharness-bridge/docs/project/records/modules/obsidian-companion/integrations/maintenance.md) → IF-extension。反向消费是 [Maintenance 读取 Core 轻量目录](../../../../../../dsh-annotation-core/docs/project/records/modules/annotation-core/integrations/maintenance-directory.md)。

这里只保存边界和定位，不展开对方的两类 Adapter、Engine 或内部存储。历史 EXT-harness-adapters / EXT-business-adapters 身份及后继仍可检索。

**当前状态（2026-09-20 批）**：本批在未安装 Maintenance 的独立实例上完成安装与验收，Bridge 的连接、断开与引用接收不要求 Maintenance 在线；下面描述的公开扩展页与实例范围协作是可选能力，本批未安装、未验收，其消费方说明已归档（原 [[INT-suite-extension-pages]]）。

## 公开扩展页与有效范围（当前实现）

新增接入由 [[INT-suite-extension-pages]] 维护，分别消费 Maintenance 的页面栏目注册与实例有效范围合同。有效绑定仍在 Bridge，Maintenance 保存登记／回执并承载集中 UI。两组插件分别安装和缺席/晚加载已有上一阶段合成覆盖，见 [桥整合与双侧绑定的分阶段验证（历史）](../../../../../../../worktrees/session-context-graph-20260913/dsh-obsidian-session-reference-suite/docs/project/records/migration/current-entrypoints.md#VER-vault-binding-implementation)；新单桥产品另行验收。范围是 Maintenance 分类工作区，保存后下次启动生效，当前 run 按快照完成写入。通过各业务 Adapter 保存恢复对应历史类型，不接管 Core 运行时引用。
