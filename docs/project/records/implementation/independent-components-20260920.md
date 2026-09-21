---
{
  "id": "IMP-independent-components-20260920",
  "kind": "implementation",
  "title": "DSH Obsidian Bridge 独立组件升级",
  "status": "current",
  "progress": "implemented",
  "summary": "本实例设置页管理多个 Vault；不注册 Maintenance 绑定页；可选 CLI 缺失时不暴露可执行 CLI 工具。0.4.1-rc2.8 已安装到独立测试实例。",
  "sources": [
    {
      "workspace_id": "source",
      "path": "docs/changes/2026-09-20-independent-components.md",
      "role": "change-report",
      "reviewed_sha256": "1ce1bee778e2542fb533e5bc818bc5ca42f64bc3bc56bbe6b7870fbcbb95aa42",
      "reviewed_dependencies": []
    },
    {
      "workspace_id": "source",
      "path": "docs/changes/2026-09-20-independent-connection-settings.md",
      "role": "change-report",
      "reviewed_sha256": "a9d4d754cd53f6b0f98b1202100e015d6222995fe1df7eb196711a3170e2d5d2",
      "reviewed_dependencies": []
    },
    {
      "path": "src/binding-settings.tsx",
      "symbol": "registerBridgeSettings",
      "role": "current-implementation",
      "workspace_id": "source",
      "reviewed_sha256": "f485c61e3d577d6c604505b361f72598fac474607809c9540d6732d876ed2f0a",
      "reviewed_symbol_sha256": "f7af12f7ab3fd8c05d9c299bd37f6f8ddd8fc63db36568cd5f6b27c31eefa941",
      "reviewed_dependencies": [
        {
          "path": "src/api.ts",
          "sha256": "f2576b9906d43b9c10a32a6df2cfc3642872c48e492ca32ae448139343e33f89"
        },
        {
          "path": "src/binding-settings-style.ts",
          "sha256": "34d5e3afd8b48b74d855a53c24bfd3e574278901ab5bfa1b15f808038618ea96"
        }
      ]
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
      "path": "tests/binding-settings.test.ts",
      "role": "current-workspace-source",
      "workspace_id": "source",
      "reviewed_sha256": "ebb4322b21be3f44dac8444de706b0e7cc127062ad9e1a18974e8183d8d160ea",
      "reviewed_dependencies": [
        {
          "path": "src/api.ts",
          "sha256": "f2576b9906d43b9c10a32a6df2cfc3642872c48e492ca32ae448139343e33f89"
        },
        {
          "path": "src/binding-settings.tsx",
          "sha256": "f485c61e3d577d6c604505b361f72598fac474607809c9540d6732d876ed2f0a"
        }
      ]
    }
  ],
  "relations": [
    {
      "relation": "implements",
      "to": {
        "record_id": "REQ-vault-instance-binding"
      },
      "reason": "独立实例的连接与断开入口"
    },
    {
      "relation": "related",
      "to": {
        "record_id": "HIST-2026-09-20-independent-bridge-release"
      },
      "reason": "本批安装与验收过程"
    }
  ],
  "source_review": {
    "reviewed_at": "2026-09-21T07:37:01.363514+00:00",
    "reason": "对照 src/client.ts 的 slots 注册与 src/index.ts 的 cli/referenceLocationResolverAvailable 声明",
    "body_sha256": "38c8c9ae87c75d97def82f7bc73d97e89427290d0d44afcfa301ac5ab315218d"
  }
}
---

# DSH Obsidian Bridge 独立组件升级

本实例设置页管理多个 Vault；不注册 Maintenance 绑定页；可选 CLI 缺失时不暴露可执行 CLI 工具。

- 连接入口：客户端通过 `slots` 注册 `settings.section / id: obsidian-bridge`（[src/binding-settings.tsx](../../../../src/binding-settings.tsx)），连接、查看状态与断开都走 Bridge 自己的绑定协议；不需要 Maintenance。
- 可选 CLI：启动时解析 `obsidianCliPath` 或 PATH，未找到时只注册 guide/targets 工具，不注册 `dsh_obsidian_cli` 与 CLI 操作 skill，并在配置里以 `cli.available=false` 告知界面。
- 能力声明：`getBridgeConfig` 同时返回 `cli` 与 `referenceLocationResolverAvailable`，让客户端知道哪些可选服务存在。

候选状态更新：`0.4.1-rc2.4` 只有源码与候选产物；本批 `0.4.1-rc2.8` 已通过官方命令安装到本地独立测试实例（profile web），testvault 连接与绑定保留。**已安装不等于已验收**：多 Vault 组合、CLI 模型端到端调用与受管实例协作不在本次验收内，见 [[VER-rc28-install-and-acceptance-20260920]]。
