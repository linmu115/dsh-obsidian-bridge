---
{
  "id": "IMP-obsidian-cli",
  "kind": "implementation",
  "title": "绑定 Vault 的 CLI 与操作 skill（可选增强）",
  "status": "current",
  "progress": "implemented",
  "summary": "0.4.1-rc2.9 经绑定 Vault CLI 开放隐藏配置读写、插件安装卸载启停与任意 JavaScript；保留目标核验和持久请求回执，无其他业务插件依赖。",
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
      "path": "docs/cli-operations.md",
      "role": "linked-authority",
      "workspace_id": "source",
      "reviewed_sha256": "be6573d6bfe491f598968ac0f667be914ddf92294271715ad04fad24e8e43e2f",
      "reviewed_dependencies": []
    },
    {
      "path": "src/index.ts",
      "symbol": "BridgeLifecycleService",
      "role": "current-implementation",
      "workspace_id": "source",
      "reviewed_sha256": "9ffcb787ef02eef6a561068892dba9806cf569aca418061c69c2e5a7a3b98b12",
      "reviewed_symbol_sha256": "76874f2e457ad745eeb1ec8a076dc0a548ec6c6877241bf8e623c8b828a1d602",
      "reviewed_dependencies": [
        {
          "path": "src/api.ts",
          "sha256": "f2576b9906d43b9c10a32a6df2cfc3642872c48e492ca32ae448139343e33f89"
        },
        {
          "path": "src/discovery-host.ts",
          "sha256": "60f654ef92af3dafc72372a8bbd98dfd18483547b8687ff551cefb02df69bcb1"
        },
        {
          "path": "src/host-identity.ts",
          "sha256": "a7e4a97a3b1661d8674163c5f255f399ad0eb7bc868fd1347ddda6ac59f3a9a0"
        },
        {
          "path": "src/obsidian-cli.ts",
          "sha256": "7f6bc5bc82558e941ca8407f9528e9f2b3410bfd0a0541408c46983d5093afbf"
        },
        {
          "path": "src/operation-service.ts",
          "sha256": "8f90840b859b000a154279ef0e9346bb394c707715dace56ac153067090a051a"
        },
        {
          "path": "src/operation-skill.ts",
          "sha256": "aa210bf6109c4f5be8e4f1449602cf4628a521c829dd803d8ec964766d19537a"
        },
        {
          "path": "src/operation-tools.ts",
          "sha256": "de8426a995b50be432ae818ba92b85c3a5b159a02e097c9c1c762641ef23c35b"
        },
        {
          "path": "src/reference/host.ts",
          "sha256": "f138d83f0e665dd8f262a3e102fc0f02d4edf30957d1094a0fadcd93cae81566"
        },
        {
          "path": "src/runtime.ts",
          "sha256": "fe0373813e9de9c413eba70eb397ee930fbd871a43c137641528dca693df16e3"
        },
        {
          "path": "src/vault-runtime.ts",
          "sha256": "8564728604bbf09b8e8038edb718be0d2340da908237057121478763db3f22df"
        }
      ]
    },
    {
      "path": "src/operation-tools.ts",
      "symbol": "registerOperationTools",
      "role": "current-implementation",
      "workspace_id": "source",
      "reviewed_sha256": "de8426a995b50be432ae818ba92b85c3a5b159a02e097c9c1c762641ef23c35b",
      "reviewed_symbol_sha256": "f49a8aa3f3c59feb531c6f2df52902e175689a4d823615b634c1adb425f5df21",
      "reviewed_dependencies": [
        {
          "path": "src/api.ts",
          "sha256": "f2576b9906d43b9c10a32a6df2cfc3642872c48e492ca32ae448139343e33f89"
        },
        {
          "path": "src/obsidian-cli.ts",
          "sha256": "7f6bc5bc82558e941ca8407f9528e9f2b3410bfd0a0541408c46983d5093afbf"
        },
        {
          "path": "src/operation-service.ts",
          "sha256": "8f90840b859b000a154279ef0e9346bb394c707715dace56ac153067090a051a"
        },
        {
          "path": "src/operation-skill.ts",
          "sha256": "aa210bf6109c4f5be8e4f1449602cf4628a521c829dd803d8ec964766d19537a"
        }
      ]
    },
    {
      "path": "tests/operation-tools.test.ts",
      "role": "current-workspace-source",
      "workspace_id": "source",
      "reviewed_sha256": "5acc73a92c42b79c90954ceb578a9e57d767f13b6a431d80f50504063879dad9",
      "reviewed_dependencies": [
        {
          "path": "src/api.ts",
          "sha256": "f2576b9906d43b9c10a32a6df2cfc3642872c48e492ca32ae448139343e33f89"
        },
        {
          "path": "src/operation-service.ts",
          "sha256": "8f90840b859b000a154279ef0e9346bb394c707715dace56ac153067090a051a"
        },
        {
          "path": "src/operation-skill.ts",
          "sha256": "aa210bf6109c4f5be8e4f1449602cf4628a521c829dd803d8ec964766d19537a"
        },
        {
          "path": "src/operation-tools.ts",
          "sha256": "de8426a995b50be432ae818ba92b85c3a5b159a02e097c9c1c762641ef23c35b"
        }
      ]
    }
  ],
  "source_review": {
    "reviewed_at": "2026-09-22T05:06:05.144073+00:00",
    "reason": "核对 CLI 可选注册、目标回执与 rc2.9 新增执行范围，历史 rc2.8 边界明确分列",
    "body_sha256": "185933f5d4f4b47622168c15e2c2be790331b51e1df480dc4274a50dd3b9a1eb"
  }
}
---

当前能力已扩展到 **0.4.1-rc2.9**，见 [[IMP-cli-full-access]] 与 [[VER-cli-full-access]]；下文 .8 为旧版本行为及验收。目标/回执机制延续，插件仅重载的范围已经替代。


# 绑定 Vault 的 CLI 与操作 skill（可选增强）

DSH 侧仍只有 `dsh-obsidian-bridge`，Obsidian 侧仍只有 `obsidian-deepharness-bridge`。

**本批变更（0.4.1-rc2.8）**：CLI 从「必需」改为「可选增强」。启动时解析 `obsidianCliPath` 或 PATH；未找到可执行文件时只注册 `dsh_obsidian_guide` 与 `dsh_obsidian_targets`，不注册 `dsh_obsidian_cli`，也不注册 CLI 操作 skill，并通过 `getCliAvailability()` / `getBridgeConfig().cli` 把 `available:false` 告诉界面与客户端。找到后行为与之前一致。因此源码中「缺少 CLI 明确失败」的描述现在只适用于已启用 CLI 后的调用，不再是插件启动的前置条件。

调用语义（延续）：固定参数合同用于正确调用 CLI，不是逐 Vault 能力识别。每次调用核验 DSH 实例/profile、Vault 绑定修订、publisher/boot/origin 及实际路径，再映射 Obsidian 原生 Vault ID；始终显式指定目标，并用 `vault info=path` 核对。路径校验拒绝越界和符号链接逃逸，CLI 使用原生参数数组、不经过 shell。绑定变化、复制身份、歧义目标均不回退到活动 Vault。

本次包含笔记读写/搜索/属性/模板、已有样式片段启停、已有插件查看和重载。写操作持久保存摘要与 started/completed/unconfirmed 回执；相同会话/requestId 不重复执行，不保存正文或命令参数。CLI 超时或最终身份/回执未确认时，不盲目重试。CLI 与绑定不是原子事务，10000 条回执上限需明确维护。

源码与配置说明：[CLI 使用说明](../../../cli-operations.md)。候选包和早前部署验证见 [官方 CLI、候选代码与真实桥重载验证（历史）](../../../../../../worktrees/session-context-graph-20260913/dsh-obsidian-session-reference-suite/docs/project/records/migration/current-entrypoints.md#VER-obsidian-cli)。

**当前验收边界**：本批只验证了「无可执行文件时不暴露 CLI 工具」的探测与注册行为（单元测试）与插件能正常启动。模型端到端调用 `dsh_obsidian_cli`、面板/Plugin API 执行器、真实笔记写入在独立实例上**未验收**，见 [[VER-rc28-install-and-acceptance-20260920]]。
