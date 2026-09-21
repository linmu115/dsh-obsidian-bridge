---
{
  "id": "INT-suite-extension-pages",
  "kind": "implementation",
  "title": "Obsidian 系列接入公开扩展页与实例范围",
  "status": "current",
  "progress": "implemented",
  "gap": "已有前阶段实现和合成验证；新单桥产品回归与真实部署另行验收。",
  "summary": "插件贡献自己的栏目，Maintenance 汇总展示；有效绑定由 Bridge 确认，各 Vault 共用实例同步范围。",
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
  ]
}
---

# Obsidian 系列接入公开扩展页与实例范围

此页描述已实现的可选消费。提供方的唯一合同见 [Maintenance 扩展注册与实例范围设计](../../../../../../../worktrees/session-context-graph-20260913/dsh-session-maintenance/docs/superpowers/specs/2026-09-18-extension-pages-and-instance-scope.md)；有效配对、动态端点和多 Vault 路由见 [[IF-vault-binding]]。

Obsidian 系列贡献绑定仓库、连接状态、数据目录及同步栏目。数据目录是可复用栏目，页面可以聚合多个插件和 namespace；各插件只注册自己的贡献，由 Maintenance 汇总，旧 Suite 已归档，无运行父组。具体贡献代码跟随其能力提供方，不能为了 UI 将绑定真源移入 Maintenance。

用户从 Maintenance 改绑时，操作经过 Bridge 的同一修订检查，获得确认后才保存生效登记。Companion 设置页也调用这个入口。维护页不可用不会阻止独立 Bridge 配对，Bridge 不在线也不使 Maintenance 的会话维护及其他扩展停止运行。

所有绑定同一实例的 Vault 使用相同有效分类范围。策略保存后下次启动生效，当前 run 按启动快照完成写入；取消勾选并在新运行生效后保留历史引用并显示当前实例未同步，恢复后按原身份核验；不自动导航到其他实例。列表缓存按范围修订失效，提交动作再次检查。无 Maintenance 的独立模式使用原生实例目录，已托管对象继续遵守原写入责任。

改接口时核对 Bridge 内部引用模块、Sticker 的关联笔记、Companion 会话选择，以及当前由 ThoughtDAG 提供的会话贴纸。Core 保持通用来源与引用身份职责；不因多 Vault 将其变成连接管理器。前阶段状态、CAS、页面预算、幂等与缺席/晚加载等合成验证见 [桥整合与双侧绑定的分阶段验证（历史）](../../../../../../../worktrees/session-context-graph-20260913/dsh-obsidian-session-reference-suite/docs/project/records/migration/current-entrypoints.md#VER-vault-binding-implementation)；新包和真实应用检查见 [单桥产品、地图与安装验收边界（历史）](../../../../../../../worktrees/session-context-graph-20260913/dsh-obsidian-session-reference-suite/docs/project/records/migration/current-entrypoints.md#VER-single-bridge-delivery)。
