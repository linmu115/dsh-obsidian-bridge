---
{
  "id": "IF-obsidian-operation-channel",
  "kind": "interface",
  "title": "Obsidian 操作管道的扩展预留",
  "status": "current",
  "summary": "0.4.1-rc2.9 经绑定 Vault CLI 开放隐藏配置读写、插件安装卸载启停与任意 JavaScript；保留目标核验和持久请求回执，无其他业务插件依赖。",
  "aliases": [],
  "relations": [],
  "sources": [
    {
      "path": "../../../../worktrees/session-context-graph-20260913/dsh-obsidian-session-reference-suite/docs/2026-09-18-vault-instance-binding-design.md",
      "role": "pre-migration-source",
      "heading": "操作管道扩展预留"
    },
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


## 操作管道扩展预留



专门操作通道扩展现有 DSH Bridge 与 Obsidian 侧 Bridge 的内部模块，不新增操作插件安装项。Obsidian 侧 Bridge 即 `obsidian-deepharness-bridge` / DeepHarness Bridge，旧称 Companion。DSH 通过同一绑定及路由获得直接操作权限；Bridge 负责目标、连接、请求身份和结果关联，Obsidian 侧执行器调用宿主的笔记、模板、样式、面板等接口。



操作请求必须确定 vaultId，并关联当前绑定修订及请求鉴权。不要求每个 Vault 声明、识别或协商操作能力，不以能力目录、查询或逐项启用为前置；实际不支持的操作返回明确错误。请求支持幂等或明确声明不可重试，改绑后未完成请求保持原目标。



本节最初只预留合同；后续用户要求开始实现并明确必须有 CLI。当前 .3 源码候选已实现 skill、绑定目标封装、CLI 派发与回执；本机 CLI 和桥重载已验证。Bridge .3 / Sticker .5 已部署并 active，skill 目录已核验；面板/任意脚本/Plugin API 补充执行器未实现。插件业务仅重载已有插件，生成、构建和安装由本地工具承担。见 [[IMP-obsidian-cli]]、[官方 CLI、候选代码与真实桥重载验证（历史）](../../../../../../worktrees/session-context-graph-20260913/dsh-obsidian-session-reference-suite/docs/project/records/migration/current-entrypoints.md#VER-obsidian-cli)。



用户追加由桥交付操作 skill，指导 DSH 优先走绑定 Vault 的官方 CLI；具体目标必须显式核验，不依赖活动 Vault，也不将桥 vaultId 直接假定为 CLI 的原生 Vault ID。CLI 未覆盖功能建议由同一 Obsidian 侧桥的公开 Plugin API 执行器补充。路线、依据和实现边界见 [[DEC-obsidian-operation-route]]。



修订来源：2026-09-18 当前地图核对任务的用户批注“这个不用识别，只需要提供直接操作权限就行，更新地图里的需求”。它替代本节此前逐 Vault 能力声明与查询的方案；既有引用协议与运行身份的兼容性检查不因本次未来操作通道的需求修订被删除。
