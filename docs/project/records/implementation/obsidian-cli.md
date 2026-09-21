---
{
  "id": "IMP-obsidian-cli",
  "kind": "implementation",
  "title": "绑定 Vault 的 CLI 与操作 skill（可选增强）",
  "status": "current",
  "progress": "implemented",
  "summary": "0.4.1-rc2.8 中 CLI 为可选增强：探测到可执行文件才注册 skill 与 dsh_obsidian_cli，否则只保留 guide/targets 并在配置中报告不可用；目标映射、鉴权与持久回执行为延续。",
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
      "reviewed_sha256": "0b05f0ac3b448b2ca095932018ddde353a57dc69bd6d11cef9c4ec8e846174a1",
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
          "sha256": "9226fa4566c6c42a579dc4421036653bfb0637db7917ead908e736a711f163d0"
        },
        {
          "path": "src/operation-service.ts",
          "sha256": "92e44d9b81493fee0517fa22d378de617496c73b4d7270bee741ddfde83a4bcd"
        },
        {
          "path": "src/operation-skill.ts",
          "sha256": "f8f8ffbe385b7771cb4b50c92cad3cd4e15d1dd1ff91653f64832ede5404c8a3"
        },
        {
          "path": "src/operation-tools.ts",
          "sha256": "757561e7d245e0011ed58a5dbda790c61e79bec716c1d8488693373a5170243a"
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
      "reviewed_sha256": "757561e7d245e0011ed58a5dbda790c61e79bec716c1d8488693373a5170243a",
      "reviewed_symbol_sha256": "480c3bb585345b5ef6af653b897bd07a733b8e97bd518e35b0f44e1ad7ebbea5",
      "reviewed_dependencies": [
        {
          "path": "src/api.ts",
          "sha256": "f2576b9906d43b9c10a32a6df2cfc3642872c48e492ca32ae448139343e33f89"
        },
        {
          "path": "src/obsidian-cli.ts",
          "sha256": "9226fa4566c6c42a579dc4421036653bfb0637db7917ead908e736a711f163d0"
        },
        {
          "path": "src/operation-service.ts",
          "sha256": "92e44d9b81493fee0517fa22d378de617496c73b4d7270bee741ddfde83a4bcd"
        },
        {
          "path": "src/operation-skill.ts",
          "sha256": "f8f8ffbe385b7771cb4b50c92cad3cd4e15d1dd1ff91653f64832ede5404c8a3"
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
          "sha256": "92e44d9b81493fee0517fa22d378de617496c73b4d7270bee741ddfde83a4bcd"
        },
        {
          "path": "src/operation-skill.ts",
          "sha256": "f8f8ffbe385b7771cb4b50c92cad3cd4e15d1dd1ff91653f64832ede5404c8a3"
        },
        {
          "path": "src/operation-tools.ts",
          "sha256": "757561e7d245e0011ed58a5dbda790c61e79bec716c1d8488693373a5170243a"
        }
      ]
    }
  ],
  "source_review": {
    "reviewed_at": "2026-09-21T07:36:46.597996+00:00",
    "reason": "对照 src/index.ts 的 CLI 探测分支与 src/operation-tools.ts 的可选 operations 参数，并把 CLI 由必需改为可选增强",
    "body_sha256": "b19cdb438b9acd8d0185d21ea40bb691378fb5836b41c90910044c0dbf58c04f"
  }
}
---

# 绑定 Vault 的 CLI 与操作 skill（可选增强）

DSH 侧仍只有 `dsh-obsidian-bridge`，Obsidian 侧仍只有 `obsidian-deepharness-bridge`。

**本批变更（0.4.1-rc2.8）**：CLI 从「必需」改为「可选增强」。启动时解析 `obsidianCliPath` 或 PATH；未找到可执行文件时只注册 `dsh_obsidian_guide` 与 `dsh_obsidian_targets`，不注册 `dsh_obsidian_cli`，也不注册 CLI 操作 skill，并通过 `getCliAvailability()` / `getBridgeConfig().cli` 把 `available:false` 告诉界面与客户端。找到后行为与之前一致。因此源码中「缺少 CLI 明确失败」的描述现在只适用于已启用 CLI 后的调用，不再是插件启动的前置条件。

调用语义（延续）：固定参数合同用于正确调用 CLI，不是逐 Vault 能力识别。每次调用核验 DSH 实例/profile、Vault 绑定修订、publisher/boot/origin 及实际路径，再映射 Obsidian 原生 Vault ID；始终显式指定目标，并用 `vault info=path` 核对。路径校验拒绝越界和符号链接逃逸，CLI 使用原生参数数组、不经过 shell。绑定变化、复制身份、歧义目标均不回退到活动 Vault。

本次包含笔记读写/搜索/属性/模板、已有样式片段启停、已有插件查看和重载。写操作持久保存摘要与 started/completed/unconfirmed 回执；相同会话/requestId 不重复执行，不保存正文或命令参数。CLI 超时或最终身份/回执未确认时，不盲目重试。CLI 与绑定不是原子事务，10000 条回执上限需明确维护。

源码与配置说明：[CLI 使用说明](../../../cli-operations.md)。候选包和早前部署验证见 [官方 CLI、候选代码与真实桥重载验证（历史）](../../../../../../worktrees/session-context-graph-20260913/dsh-obsidian-session-reference-suite/docs/project/records/migration/current-entrypoints.md#VER-obsidian-cli)。

**当前验收边界**：本批只验证了「无可执行文件时不暴露 CLI 工具」的探测与注册行为（单元测试）与插件能正常启动。模型端到端调用 `dsh_obsidian_cli`、面板/Plugin API 执行器、真实笔记写入在独立实例上**未验收**，见 [[VER-rc28-install-and-acceptance-20260920]]。
