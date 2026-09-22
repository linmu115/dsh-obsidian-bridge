---
{
  "id": "DEC-obsidian-operation-route",
  "kind": "decision",
  "title": "专门操作通道：现有两侧桥扩展与 CLI 优先",
  "date": "2026-09-18",
  "status": "current",
  "summary": "0.4.1-rc2.9 经绑定 Vault CLI 开放隐藏配置读写、插件安装卸载启停与任意 JavaScript；保留目标核验和持久请求回执，无其他业务插件依赖。",
  "relations": [
    {
      "relation": "clarifies",
      "to": {
        "record_id": "IF-obsidian-operation-channel"
      },
      "reason": "CLI 优先、操作 skill 与目标路由约束"
    },
    {
      "relation": "derived_from",
      "to": {
        "record_id": "DEC-single-bridge-product"
      },
      "reason": "专用操作功能扩展现有两侧桥，不增加插件安装项"
    }
  ],
  "sources": [
    {
      "path": "../../../../worktrees/session-context-graph-20260913/dsh-obsidian-session-reference-suite/docs/project/records/migration/current-entrypoints.md",
      "role": "linked-authority"
    }
  ]
}
---

## 2026-09-22 当前修订

用户明确开放任意 JavaScript、配置目录及插件代码写入、部署和启用；替代下文历史上的“插件仅重载”和“任意脚本未实现”限制。当前合同以 [[REQ-cli-full-access]]、[[IMP-cli-full-access]] 与 [CLI 操作](../../../cli-operations.md) 为准。基础桥仍可无 CLI 启动；调用这条操作路径时必须有 CLI。新增能力不依赖 Core、Maintenance、Sticker 或 Codex Runtime。

以下保留 2026-09-18 决策过程与当时验证，不作为本版功能限制。


# 专门操作通道：现有两侧桥扩展与 CLI 优先

## 已确认要求

当前桥接功能收口到 DSH 侧 `dsh-obsidian-bridge` 和 Obsidian 侧 `obsidian-deepharness-bridge` 各一个插件。后者显示名为 DeepHarness Bridge，Companion 是其旧称。专用操作功能在两侧现有插件内追加，不新增操作桥。

复用实例/Vault 绑定和路由，提供直接操作权限；不要求逐 Vault 操作能力识别、声明或协商，不以操作目录查询或逐项启用为前置。目标身份和请求鉴权继续由桥负责。纯笔记操作不依赖 Core 引用流程或 Maintenance。

用户在本次技术讨论中追加：“那你也可以在桥插件中加入 skill 提示 dsh 在操作时优先走被绑定 Vault 的 cli”。因此桥需要向 DSH 提供随插件交付的操作 skill，指导 Agent 优先调用官方 Obsidian CLI 操作绑定目标。该 skill 服务于 DSH，不是只装在开发者 Codex 环境的个人技能。

用户随后收窄插件相关范围：“只要能重载插件就行了，LLM 可以在本地帮我构建插件，不需要桥”，并要求开始下一步。插件业务仅提供已有插件重载；插件源码生成、构建、安装、卸载和启停不纳入本通道。此前插件注册及完整插件管理的构想被本要求替代；笔记、模板、样式和绑定 Vault 的 CLI 优先路线继续保留。

## 当前技术路线与候选实现

1. DSH 侧桥提供 skill 和当前绑定目标上下文。skill 指导操作方式；桥提供目标解析及执行封装，避免只靠提示词选择 Vault。
2. 将桥的 Vault 身份映射到官方 CLI 可识别的 Vault 选择器，并用实际路径核对。不能假设桥的 vaultId 等于 Obsidian 原生 Vault ID，不能依赖默认活动 Vault 或仅凭同名笔记判定目标。每次操作显式携带已核验的目标；多个已绑定 Vault 无法由任务上下文唯一确定时先确定目标。
3. 首选官方 CLI 已覆盖的操作。桥封装参数与结果，正文作为数据传递，不拼接 shell 命令；返回实际目标、成功结果或错误。记录操作身份，处理超时后结果不明及重复请求，避免盲目重试非幂等写入。
4. CLI 未覆盖的面板等功能，未来可在现有 Obsidian 侧桥内追加公开 Plugin API 执行器。本次未实现该补充接口，它不能成为绕过 CLI 必需条件的回退。
5. 插件业务仅封装 `plugin:reload`，用于重新加载已经由本地开发工具构建并放置的插件。源码、构建及安装交给 LLM 与现有本地工程工具，不由桥实现。

CLI 的存在、启用和版本属于执行条件，不是恢复逐 Vault 操作能力目录。用户最后明确“必须要有 cli”。CLI 为必需执行条件；不可用时明确返回原因，不静默用文件写入、HTTP/eval 或其他 Vault 替代。

## 官方接口依据与实际边界

- [官方 Obsidian CLI](https://help.obsidian.md/cli)：支持显式 Vault 目标及笔记、模板、属性、样式片段和插件管理等命令；需要受支持的桌面安装器并启用 CLI。开发命令还提供 JavaScript 执行入口。官方 API 的稳定范围不能据此扩展到所有内部对象。
- [官方 Plugin API](https://github.com/obsidianmd/obsidian-api)：Vault/FileManager 处理笔记与属性，Workspace/Editor 处理打开与编辑；Plugin 注册命令、视图及编辑器扩展。它是 Obsidian 进程内接口，由本侧桥调用。
- [Vault 写入说明](https://docs.obsidian.md/Plugins/Vault)：按当前内容修改时优先使用 Vault.process；隐藏配置文件另走 Adapter API。
- [CSS snippets](https://help.obsidian.md/snippets)：样式可以通过 CSS 片段及变量维护，启用后修改可自动应用。

2026-09-18 当前结果：DSH Bridge `0.4.1-rc2.3` 源码候选已交付操作 skill、原生与托管工具导出、绑定目标映射、CLI 派发及持久请求回执；Obsidian 侧复用 `0.7.0-rc2.3` 的现有路径证明，无需新增插件代码。本机安装器已从 1.8.4 更新为官方签名 1.13.7，CLI 已启用；真实只读目标检查及一次现有桥重载通过。实现和验证分别见 [[IMP-obsidian-cli]]、[官方 CLI、候选代码与真实桥重载验证（历史）](../../../../../../worktrees/session-context-graph-20260913/dsh-obsidian-session-reference-suite/docs/project/records/migration/current-entrypoints.md#VER-obsidian-cli)。Bridge .3 与 Sticker .5 已装入真实 DSH profile 并 active，skill 目录已核验；真实笔记写入、面板接口和 UI 未验收。

## 来源与验收方向

用户来源为当前地图回查任务的两项批注、两端各一个插件的确认，以及 CLI 优先 skill 追加要求；本任务尚未建立原始事件索引，过程见 [Vault 单实例绑定、公开扩展页与动态端口的需求收敛（历史）](../../../../../../worktrees/session-context-graph-20260913/dsh-obsidian-session-reference-suite/docs/project/records/migration/current-entrypoints.md#HIST-vault-instance-binding) 的新任务续记。工程封装和补充路径属于本次建议，不冒充用户逐字段确认。

后续需要验证：绑定 Vault 与 CLI 目标路径一致；多 Vault/同名目标不会误路由；CLI 优先路径返回真实结果；补充接口继续使用同一目标；重试不重复写入；通道不依赖 Core 或 Maintenance；DSH 能实际加载桥交付的 skill。当前为 CLI 候选部分实现、本机 CLI 已启用；DSH 部署及 skill 目录核验已完成，Agent 实际调用及剩余业务待验收，不能写成全通道已验收。
