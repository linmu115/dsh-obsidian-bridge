---
{
  "id": "IMP-native-reference-receive-20260920",
  "kind": "implementation",
  "title": "独立会话引用接收能力检查",
  "status": "current",
  "progress": "implemented",
  "summary": "Bridge .7 显式声明可选会话解析能力，本地引用在缺席时不请求 Maintenance；该修复包含在本批 0.4.1-rc2.8，无引擎真实引用气泡及会话测试经用户刷新后验收，claimed 与同步回执已核验。",
  "relations": [
    {
      "relation": "implements",
      "to": {
        "record_id": "MOD-reference-client"
      },
      "reason": "客户端领取路径的可选能力分支"
    },
    {
      "relation": "related",
      "to": {
        "record_id": "HIST-2026-09-20-independent-bridge-release"
      },
      "reason": "接收排查与人工纠偏过程"
    }
  ],
  "sources": [
    {
      "path": "src/reference/client.ts",
      "symbol": "apply",
      "role": "current-implementation",
      "workspace_id": "source",
      "reviewed_sha256": "43aafb91a3073dd1d31fdbaa4f9ace0375903c0b32ff1d0f1b8d1cefb687c8d2",
      "reviewed_symbol_sha256": "b491cc245f9fbe690b6322f0999b51b098be617c42568c37128e79211f9a3214",
      "reviewed_dependencies": [
        {
          "path": "src/api.ts",
          "sha256": "f2576b9906d43b9c10a32a6df2cfc3642872c48e492ca32ae448139343e33f89"
        },
        {
          "path": "src/reference/bridge/http-client.ts",
          "sha256": "1cd34e1fcbb2a8224a7c393f46eccd85a2338a8c4d2620cc7426acb9d4d3b716"
        },
        {
          "path": "src/reference/bridge/maintenance-location.ts",
          "sha256": "cf24eacaf240b4d20ed02a6fc3bea6c38502bfd2377a7cebad17415b0a2dfe05"
        },
        {
          "path": "src/reference/bridge/reference-delete-actions.ts",
          "sha256": "5f1f970c8418577018d6aa2c7fc0fe566547ccccb244db90ae6702e330bd7c44"
        },
        {
          "path": "src/reference/client/annotation-consumer.ts",
          "sha256": "538ccbe2c4ee9ff696340998525ba5cfd99772d1861450dc2ce451a436424f2b"
        },
        {
          "path": "src/reference/protocol.ts",
          "sha256": "5e8c62e3b413f4f2dc48d2e0fca3a45c3ec10e5a861b9437c6841da67561340a"
        },
        {
          "path": "src/session-availability.ts",
          "sha256": "7f352a0baa55a721706530176db1e6f3672e22465ab3ad69e2b0a955ab9a9ae1"
        }
      ]
    },
    {
      "path": "src/api.ts",
      "symbol": "ObsidianBridgeLifecycle",
      "role": "current-implementation-contract",
      "workspace_id": "source",
      "reviewed_sha256": "f2576b9906d43b9c10a32a6df2cfc3642872c48e492ca32ae448139343e33f89",
      "reviewed_symbol_sha256": "cb1548acb4affc61eb3e494ab472e81662677183c3b9cce076fc21cf9cccf6a1",
      "reviewed_dependencies": [
        {
          "path": "src/session-availability.ts",
          "sha256": "7f352a0baa55a721706530176db1e6f3672e22465ab3ad69e2b0a955ab9a9ae1"
        },
        {
          "path": "src/transport.ts",
          "sha256": "15ef317c4ba0a04b0aa207af3bd6adc8f1450794deef57b415323f72461b4fe5"
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
      "path": "tests/client-receiver.test.ts",
      "role": "current-workspace-source",
      "workspace_id": "source",
      "reviewed_sha256": "7f201fb0f6756d1e85d516ffc56a1df7d5389ac8f6be03aa7a1cc25327ac3ec9",
      "reviewed_dependencies": [
        {
          "path": "src/reference/client.ts",
          "sha256": "43aafb91a3073dd1d31fdbaa4f9ace0375903c0b32ff1d0f1b8d1cefb687c8d2"
        }
      ]
    },
    {
      "workspace_id": "source",
      "path": "docs/changes/2026-09-20-native-reference-receive.md",
      "role": "change-report",
      "reviewed_sha256": "e73f1fb4494eba8290a7af0d57da088eeb48fc699c4f5ae4dc887737ac5759a1",
      "reviewed_dependencies": []
    }
  ],
  "source_review": {
    "reviewed_at": "2026-09-21T07:36:52.866321+00:00",
    "reason": "对照 src/reference/client.ts 的能力缺席分支、src/api.ts 的可选成员与 tests/client-receiver.test.ts",
    "body_sha256": "d7e3aa77cadc682ff888988bf433630bdf2966e77e3fb0e53b0e5ee348afc7b5"
  }
}
---

# 独立会话引用接收能力检查

见 [改动说明](../../../../docs/changes/2026-09-20-native-reference-receive.md)。宿主在 Bridge 配置中声明 `referenceLocationResolverAvailable`（`getBridgeConfig` 读取 `maintenanceReferenceResolver` 是否存在）；生命周期合同增加 `hasReferenceLocationResolver?()`，客户端据此决定是否调用解析服务。

客户端行为（[src/reference/client.ts](../../../../src/reference/client.ts)）：

- 能力缺席且目标只有 native 会话身份时，直接使用当前会话，不向 `/dsh-session-maintenance/api` 发请求。
- 已安装解析器报错时不降级为本地猜测，错误继续上抛。
- 携带 `logicalSessionId` 的历史目标在缺少解析能力时明确报错，不把逻辑身份当成本地会话。

覆盖检查见 [tests/client-receiver.test.ts](../../../../tests/client-receiver.test.ts)：缺席时不请求解析器、解析器失败保持可见、逻辑历史目标缺少解析器时报错、内嵌页面无会话时保留 retry。宿主侧声明切换见 [tests/host-startup.test.ts](../../../../tests/host-startup.test.ts)。

测试实例已部署 .7（本批交付版本为 0.4.1-rc2.8）。安装后引用仍是 queued，因为 Obsidian 内嵌网页尚未刷新；**先请用户刷新再核验**，而不是把「已修复」当作「已接收」。用户刷新后确认气泡和会话测试正常，同一真实引用的 claimed 状态及同步回执随后已核验，Maintenance 保持关闭。该结果仅覆盖本次引用流程；其他插件、回链跳转与 Maintenance 同步未验收，见 [[VER-rc28-install-and-acceptance-20260920]]。人工纠偏过程与经验见 [本次开发历程](../../../../docs/project/records/history/2026-09-20-independent-bridge-release.md)、[引用仍 queued 时先请用户刷新](../../../../docs/project/records/history/experiences/refresh-then-verify-receipt.md)。
