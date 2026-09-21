---
{
  "id": "REQ-long-session-consolidated",
  "kind": "requirement",
  "title": "本次长会话确认的最终需求与替代关系",
  "status": "current",
  "sources": [
    {
      "path": "../../../../worktrees/session-context-graph-20260913/dsh-obsidian-session-reference-suite/docs/project/records/migration/current-entrypoints.md",
      "role": "linked-authority"
    }
  ]
}
---

# 本次长会话确认的最终需求与替代关系

本记录汇总 2026-09-18 本任务用户确认；具体合同继续在提供方维护，过程与原话见 [Vault 单实例绑定、公开扩展页与动态端口的需求收敛（历史）](../../../../../../worktrees/session-context-graph-20260913/dsh-obsidian-session-reference-suite/docs/project/records/migration/current-entrypoints.md#HIST-vault-instance-binding)。旧建议保留历史，但与本记录冲突时以最新确认为准。

## 安装与业务边界

- 当前桥接功能收口到 DSH 和 Obsidian 侧各一个插件：分别为 `dsh-obsidian-bridge` 与 `obsidian-deepharness-bridge`。这是当前产品边界，未来专门操作功能也在这两个现有桥插件内追加。

- DSH 侧只提供一个 `dsh-obsidian-bridge` 桥插件：收拢旧 Suite 的运行装配、Adapter、Lifecycle、实例/Vault 绑定、多 Vault 路由及未来专用通道。Suite 旧文档已归档，当前说明由各独立项目维护，Protocol 为内部库；仓库数量不等于安装项数量。
- Core 独立，自己负责上下文引用、引用样式/UI/气泡、上下文组织和注入、提交/撤销/恢复。Core + Bridge 支持跨 Obsidian 引用；Core + ThoughtDAG 支持跨会话引用及会话贴纸。
- 普通 Sticker 独立，同时使用 Core、Bridge、BetterSidebar。普通贴纸独有的笔记关联继续留在 Sticker；撤回“把笔记关联迁入桥”的建议。Bridge 暴露通用双向引用通道，Sticker 自行适配。
- 第一阶段只整合已有引用、回链、定位、解除能力，保留现有 Maintenance 接入；不把新双向操作能力混入重构验收。
- 未来专门操作通道由 DSH 与 Obsidian 两侧现有 Bridge 内部模块协作，不另增桥安装项。Obsidian Companion 是现有 Obsidian 侧 `obsidian-deepharness-bridge` / DeepHarness Bridge 的旧称。笔记、模板和样式片段的 CLI 路线已形成 .3 版本并部署生效，面板接口仍未实现；插件业务依后续修订仅保留重载；纯笔记操作不必进入 Core 引用流程或依赖 Maintenance。
- 2026-09-18 本次用户批注修订：复用绑定和路由，提供直接操作权限；不需要逐 Vault 识别、声明或协商操作能力，不以能力目录、查询或逐项启用为前置。保留目标身份、绑定归属和请求鉴权，实际不支持的操作返回明确错误。此要求替代 R09 / VB11 及操作管道草案中原有能力识别方案。
- 用户追加：桥插件交付面向 DSH 的操作 skill，指导 DSH 优先使用绑定 Vault 的官方 CLI，显式指定并核验目标，不依赖当前活动 Vault。路线见 [[DEC-obsidian-operation-route]]；用户进一步要求“必须要有 cli”，不可静默回退。skill、目标封装与 CLI 工具已形成 .3 候选；已实现和实际部署边界见 [[IMP-obsidian-cli]]、[官方 CLI、候选代码与真实桥重载验证（历史）](../../../../../../worktrees/session-context-graph-20260913/dsh-obsidian-session-reference-suite/docs/project/records/migration/current-entrypoints.md#VER-obsidian-cli)。
- 实施前用户修订：插件业务仅重载已有插件；LLM 自行通过本地工程工具生成、构建插件。桥不承担插件构建、安装、卸载或启停，替代此前插件注册及完整管理构想；用户已要求开始实现下一步。

## 绑定、发现与同步范围

- 仓库明确为 Obsidian Vault，实例为拥有独立会话存储的 DSH 实例。一 Vault 绑定一个实例，一个实例可绑定多个 Vault。双侧 Bridge 拥有绑定及路由；Maintenance 仅提供可选管理入口。
- 绑定使用稳定实例身份；Launcher 每次启动端口可能不同，以当前 boot、profile、实际 origin 重新发现核验，不能把端口当绑定身份。手动配对或自登记不能破坏原动态连接能力。
- 每个实例共用一份 Maintenance 分类工作区同步范围，所有绑定 Vault 共用；不是 DSH 文件夹工作区，也不是 Codex 项目导入名单。保存后下次启动生效，当前运行继续用启动快照。
- 取消同步保留旧链接并提示当前实例未同步；不删除引用、不自动切换实例。重新同步先核验映射；删除与未同步分开表达。改绑只改变后续目标，历史保持原实例/工作区/会话/Vault 身份。
- 新增“选择文件夹并绑定”：选择根目录后校验 Vault、Obsidian 侧插件和身份，再走正式绑定。已实现额外 live 路径证明防止复制 Vault 同 ID 误绑；需目标 Vault 在线且插件已启用，旧 Companion、离线和外部实例绑定会明确拒绝，不自动安装插件或覆盖配置。

## Maintenance 页面与可解耦性

- 主导航“扩展数据”改为“扩展”；里面每个插件各有自己的栏目；Obsidian 系列内“扩展数据”和“插件信息”并列。插件信息不能再成为外层新增的扩展数据栏目。
- Maintenance 公开业务 Adapter/信息页注册接口，允许插件构建自己的栏目，数据目录只是其中一个栏目。宿主格式 Adapter 与业务历史类型 Adapter 分开。
- “同步”中 Maintenance 工作区同步与 Codex 项目同步为并列子栏目；切换保留草稿、不自动保存。
- 仅装 Maintenance、仅装 Obsidian 插件系列均正常处理另一方缺席。业务 Adapter 维护各自历史消息类型，不接管 Core 当前引用运行状态。

## 开发与验收约定

优先正式命令/API启动停止、后端检查；Browser Use用于真实网页验证。不得以健康200、源码测试或GPT浏览器单端成功替代完整验收。令牌/正文不写报告；更新先备份；保留并发用户配置。用户明确禁用 ui-ux-pro-max，不再加载。停止命令不可用时不能用强杀、删锁或改数据库代替。


## 2026-09-18 再次验收后的明确修订

每个Adapter固定维护“扩展数据”页；其他子页必须由该Adapter或其业务提供方实际注册，Maintenance不得因公共信息页API存在就给所有Adapter生成“插件信息与接入”。本次现有注册中仅Obsidian拥有该信息页，GPT兼容插件和ThoughtDAG只显示数据页；未来自定义提供方注册的页面按自身标题及namespace/provider身份生成子栏目，多实例归入同一栏目。

扩展的Adapter选择位于内容顶部一级导航，Adapter内部子目录紧随其后；同步的Maintenance/Codex位于内容顶部同级导航。均使用平直文字与选中底线，不使用气泡/圆角分段按钮。正文位于导航之外，占用整块内容区域，切换的是整页正文；不得把完整子页嵌在大卡片方框内切换。已有选择、未保存草稿和未完成操作回执跨子栏目切换保留。
