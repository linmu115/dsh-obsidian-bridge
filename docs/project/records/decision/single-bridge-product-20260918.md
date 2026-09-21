---
{
  "id": "DEC-single-bridge-product",
  "kind": "decision",
  "title": "单一桥产品与独立引用业务组合",
  "date": "2026-09-18",
  "status": "current",
  "summary": "当前桥接功能收口到 DSH 侧 dsh-obsidian-bridge 与 Obsidian 侧 obsidian-deepharness-bridge 各一个插件；Suite 不安装，业务插件保持独立。",
  "sources": [
    {
      "path": "../../../../worktrees/session-context-graph-20260913/dsh-obsidian-session-reference-suite/docs/2026-09-18-dsh-obsidian-confirmed-requirements.md",
      "heading": "R12：桥接层合为一个用户安装插件"
    },
    {
      "path": "../../../../worktrees/session-context-graph-20260913/dsh-obsidian-session-reference-suite/docs/changes/2026-09-18-single-bridge-product.md"
    },
    {
      "path": "../../../../worktrees/session-context-graph-20260913/dsh-obsidian-session-reference-suite/docs/project/records/migration/current-entrypoints.md",
      "role": "linked-authority"
    }
  ],
  "relations": [
    {
      "relation": "supersedes",
      "to": {
        "record_id": "REQ-suite-boundary",
        "project_id": "dd46311f-d98d-49ff-ae13-fef0a8a6f9c3"
      },
      "reason": "取代原七成员/六部署成员和 Suite 运行父组的安装解释，需求记录保留身份并更新"
    },
    {
      "relation": "clarifies",
      "to": {
        "record_id": "DEC-selection-ownership-20260918"
      },
      "reason": "Core 运行引用、来源提供方与普通贴纸三项业务依赖"
    }
  ]
}
---

# 单一桥产品与独立引用业务组合

2026-09-18 当前地图回查任务再次明确：**当前桥接功能被收口到 DSH 和 Obsidian 侧各一个插件上。** DSH 侧为 `dsh-obsidian-bridge`，Obsidian 侧为 `obsidian-deepharness-bridge`（显示名 DeepHarness Bridge，旧称 Companion）。“单桥”指每个宿主各一个桥插件，两侧通过协议连接；Companion 不构成第三个插件。未来专门操作通道也在这两个现有插件内追加，不增加操作桥安装项。该要求不合并 Core、普通 Sticker、ThoughtDAG 或可选 Maintenance 的独立业务职责。

用户明确要求桥接层在安装形态上合为一个插件，不能以内部模块合并和 Suite wrapper 代替。当前产品是 `dsh-obsidian-bridge@0.4.1-rc2.3`，统一实例/Vault 绑定、路由、共享引用交接和桥维护；专用操作通道也归该插件，CLI 已提供；未覆盖的 Plugin API 执行器仍后置。

Suite 文档已归档，当前说明分别由独立维护项目承接；旧 Adapter 退役，Protocol 是内部依赖。旧 Lifecycle 仓库停止维护，源码迁到独立 Bridge；兼容 service key 保留，但不增加用户安装项。Profile 中 Core、Bridge、Sticker 独立加载各一次，靠 Cordis 处理服务缺席、晚加载和卸载。

| 业务组合 | 责任 |
| --- | --- |
| Core + Bridge | 跨 Obsidian 引用；Bridge 管来源、传输、定位、绑定，Core 管引用运行与提交 |
| Core + ThoughtDAG | 跨会话引用和会话贴纸；ThoughtDAG 管会话来源关系 |
| 普通 Sticker + Core + Bridge + Better Sidebar | 普通贴纸界面与笔记关联；调用 Core 和桥，不拥有会话贴纸 |
| 可选 Maintenance + 各业务 Adapter | 保存恢复各历史类型、分类范围和信息页；不接管 Core 运行时引用 |

Core 自己负责引用状态、上下文组织与注入、引用 UI/样式/气泡，以及提交、撤销和恢复。缺少业务依赖显示不可用/等待，不造成启动报错。已托管数据不因可选 Maintenance 缺席而退回旧副本写入。

依据为本轮用户直接确认；可展开的原始消息已挂接至 [Vault 单实例绑定、公开扩展页与动态端口的需求收敛（历史）](../../../../../../worktrees/session-context-graph-20260913/dsh-obsidian-session-reference-suite/docs/project/records/migration/current-entrypoints.md#HIST-vault-instance-binding) 的安装形态、业务组合及 Core 职责章节。实现与验收状态见 [单桥产品、地图与安装验收边界（历史）](../../../../../../worktrees/session-context-graph-20260913/dsh-obsidian-session-reference-suite/docs/project/records/migration/current-entrypoints.md#VER-single-bridge-delivery)，不能将此决定当作部署完成证明。
