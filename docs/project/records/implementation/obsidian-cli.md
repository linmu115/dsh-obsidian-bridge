---
{
  "id": "IMP-obsidian-cli",
  "kind": "implementation",
  "title": "绑定 Vault 的必需 CLI 与操作 skill",
  "status": "current",
  "progress": "in_progress",
  "summary": "DSH Bridge 0.4.1-rc2.3 已实现 skill、工具、目标映射和持久回执；与 Sticker .5 已部署，live 插件 active、skill 目录核验通过。",
  "relations": [
    {
      "relation": "implements",
      "to": {
        "record_id": "IF-obsidian-operation-channel"
      }
    },
    {
      "relation": "follows",
      "to": {
        "record_id": "DEC-obsidian-operation-route"
      }
    }
  ],
  "sources": [
    {
      "path": "../cli-operations.md",
      "role": "linked-authority"
    },
    {
      "path": "../../../../worktrees/session-context-graph-20260913/dsh-obsidian-session-reference-suite/docs/project/records/migration/current-entrypoints.md",
      "role": "linked-authority"
    }
  ]
}
---

# 绑定 Vault 的必需 CLI 与操作 skill

DSH 侧仍只有 `dsh-obsidian-bridge`，Obsidian 侧仍只有 `obsidian-deepharness-bridge`。后者沿用现有 0.7.0-rc2.3 的公开身份和 live 路径证明，本次不增加插件或修改其源码。

DSH Bridge 0.4.1-rc2.3 候选内置 `obsidian-bound-vault` skill，注册 guide / targets / cli 三个原生工具；可选 Runtime Support 导出同一工具定义给托管执行器。固定参数合同用于正确调用 CLI，不是逐 Vault 能力识别。缺少 CLI 明确失败，不静默改用 HTTP/eval 或文件写入。

每次调用核验 DSH 实例/profile、Vault 绑定修订、publisher/boot/origin 及实际路径，再映射 Obsidian 原生 Vault ID；始终显式指定目标，并用 `vault info=path` 核对。路径校验拒绝越界和符号链接逃逸，CLI 使用原生参数数组、不经过 shell。绑定变化、复制身份、歧义目标均不回退到活动 Vault。

本次包含笔记读写/搜索/属性/模板、已有样式片段启停、已有插件查看和重载。插件生成、构建及安装由本地工程工具完成。自重载 Obsidian 侧桥时只等待原目标的新启动身份，不再次发出重载。

写操作持久保存摘要与 started/completed/unconfirmed 回执；相同会话/requestId 不重复执行，不保存正文或命令参数。CLI 超时或最终身份/回执未确认时，不盲目重试。CLI 与绑定不是原子事务，此限制仍存在。10000 条回执上限需明确维护，不能自动清空后重放。

源码与配置说明：[CLI 使用说明](../../../cli-operations.md)。候选包和实际验证见 [官方 CLI、候选代码与真实桥重载验证（历史）](../../../../../../worktrees/session-context-graph-20260913/dsh-obsidian-session-reference-suite/docs/project/records/migration/current-entrypoints.md#VER-obsidian-cli)。

2026-09-18 用户正常停止实例后，本机 RC2 副本/web 已安装 Bridge `0.4.1-rc2.3` 与 Sticker `0.7.4-rc2.5`。Sticker 仅追加 Bridge .3 peer 范围，28 个运行源码文件未改。桥配置显式使用 `D:/app/Obsidian/Obsidian.com`，避免进程 PATH 继承差异。

部署前核验最新 run 为 closed、Launcher handle finalized/closed 且有 shutdownAccepted 回执；备份后事务替换两包及依赖元数据，保留其他插件配置。暂存发现 GPT 兼容/账号插件的旧 workspace override 会回选旧包，已按当前实际 manifest 和 lock 对齐，仅修复覆盖规则，未替换其运行包。官方安装器二次生成的 map 缺少部分既有依赖边，最终保留原运行 map，并验证物理解析身份后只追加桥的 skill/tools 两条依赖边。

正式 Maintenance integration repair 刷新本目标指纹，正式 Launcher Start 成功。live 插件目录中 Bridge、Sticker、skills、tools 均 active，0 个失败插件；现有会话的只读 skill 目录包含 `obsidian-bound-vault`，modelInvocable=true。没有发模型请求或激活会话。

Launcher 外部 Stop/Restart 命令仍未接通；本次使用用户已完成的正常停止。工具端到端 Agent 调用、面板/任意 Plugin API 执行器、真实笔记写入和实际 UI 未验收。详见 [官方 CLI、候选代码与真实桥重载验证（历史）](../../../../../../worktrees/session-context-graph-20260913/dsh-obsidian-session-reference-suite/docs/project/records/migration/current-entrypoints.md#VER-obsidian-cli) 的部署续记。
