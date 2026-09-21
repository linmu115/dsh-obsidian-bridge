---
{
  "id": "REQ-directory-owner",
  "kind": "requirement",
  "title": "业务目录按真实所属会话组织",
  "status": "current",
  "summary": "X → Y 属于接收方 Y；references 不等于 ownership，未知归属待核验。",
  "aliases": [],
  "relations": [],
  "sources": [
    {
      "path": "../../../../worktrees/session-context-graph-20260913/dsh-session-maintenance/docs/superpowers/specs/2026-09-15-extension-ownership-and-session-reader.md",
      "role": "confirmed-requirement-source",
      "heading": "业务 Adapter 与所属会话"
    }
  ]
}
---

## 业务 Adapter 与所属会话

扩展数据显示一级业务 Adapter 面板。Obsidian 系列汇总注释、普通贴纸、独立会话贴纸、跨会话引用、Obsidian 引用和笔记关联；ThoughtDAG 汇总会话主干图及其披露记录。内部 namespace、写入方、兼容性检查、对象版本和领域操作继续独立管理。实例与 profile 使用筛选器，不能因实例或 namespace 数量增加而重复一级面板。

面板按“工作区 → 所属会话 → 业务条目”折叠浏览，沿用当前会话阅读器的 logical_workspaces / workspace_memberships 归属，包含父子工作区；不通过执行目录字符串猜测工作区，也不使用独立的项目分组覆盖它。条目只有一个所属逻辑会话，其他会话是来源或关联：

| 条目 | 所属会话 | 来源关联 |
| --- | --- | --- |
| 普通注释、贴纸 | 绑定会话 | 可选的选区来源 |
| 跨会话引用 X → Y | 接收引用并执行的 Y | X |
| 从 X 创建独立会话贴纸 Y | Y | X 的蓝色引用标记导航至 Y |
| Obsidian 引用、笔记关联 | 接收或绑定的 DSH 会话 | Vault 笔记或块 |
| 会话主干图 | ownerSessionId | 图中上游会话节点 |
| 披露记录 | 主干图所属会话 | graphObjectId 指向的主干图，作为附属记录展示 |

所属关系由对应 Adapter 解释明确字段。references 数组不是所属关系，禁止取数组第一项当所有者。没有明确归属的旧对象放入默认折叠的“待绑定／待核验”；未分配工作区的有效会话归入“未分配工作区”。移动会话后，条目自动跟随当前会话归属。索引可重建，不能为重建目录改动原对象 revision。

目录只加载元数据。展开工作区加载会话，展开会话加载条目，选择条目才加载正文。列表分页，切换筛选后取消过期请求。图的披露记录不能与图并排冒充独立主干。各成员分别显示连接、停用或不兼容状态，部分可用不等于整组可写。图结构仍在 ThoughtDAG 领域接口中修改；已有归档、撤销与恢复规则不变。
