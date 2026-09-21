---
{
  "id": "IMP-required-consumer-startup-20260920",
  "kind": "implementation",
  "title": "必需消费者启动等待",
  "status": "current",
  "progress": "implemented",
  "summary": "Bridge .6 把端口等待与身份存储初始化放回正式异步 apply，使 Loader 能等到 obsidianBridgeLifecycle 发布；该修复包含在本批 0.4.1-rc2.8，普通贴纸在无 Maintenance 的独立实例中恢复运行。",
  "relations": [
    {
      "relation": "implements",
      "to": {
        "record_id": "IF-lifecycle"
      },
      "reason": "桥正式入口与必需消费者之间的就绪约定"
    },
    {
      "relation": "related",
      "to": {
        "record_id": "HIST-2026-09-20-independent-bridge-release"
      },
      "reason": "问题定位与修复过程"
    }
  ],
  "sources": [
    {
      "path": "src/index.ts",
      "symbol": "apply",
      "role": "current-implementation",
      "workspace_id": "source",
      "reviewed_sha256": "9ffcb787ef02eef6a561068892dba9806cf569aca418061c69c2e5a7a3b98b12",
      "reviewed_symbol_sha256": "e7414e17cee085d64b225b9f3b6047b5e184767f4ef4415f8dc5a5ce287b6b27",
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
      "path": "tests/host-startup.test.ts",
      "role": "current-workspace-source",
      "workspace_id": "source",
      "reviewed_sha256": "643371c9dbd593c08a28a6933cf6cf3d24123161246770d4beb99a1c49b192e6",
      "reviewed_dependencies": [
        {
          "path": "src/index.ts",
          "sha256": "9ffcb787ef02eef6a561068892dba9806cf569aca418061c69c2e5a7a3b98b12"
        },
        {
          "path": "src/typert.ts",
          "sha256": "c30f7ba7cc59eed4bae8e51f5a09a811ea82a5d756901ae7ef5a9f91c08131ee"
        }
      ]
    },
    {
      "workspace_id": "source",
      "path": "docs/changes/2026-09-20-required-consumer-startup.md",
      "role": "change-report",
      "reviewed_sha256": "2c9ef6b4eb94d364f19c61e5905e574ab452656157146993aae20d24faaf185c",
      "reviewed_dependencies": []
    }
  ],
  "source_review": {
    "reviewed_at": "2026-09-21T07:36:49.705818+00:00",
    "reason": "对照 src/index.ts 的异步 apply 与 tests/host-startup.test.ts 的入口等待用例，说明仍与当前实现一致",
    "body_sha256": "3674c37a58551fd136eda642d2d7da2f65499d28203eed80f2665663d4626e17"
  }
}
---

# 必需消费者启动等待

实现与回归边界见 [改动说明](../../../../docs/changes/2026-09-20-required-consumer-startup.md)。

正式入口 `apply` 现在是异步函数并返回一个在端口等待、持久身份存储打开与服务发布之后才完成的 Promise；`BridgeLifecycleService` 在该 Promise 完成前构造。初始化失败沿正式入口上报，因此 Loader 与必需消费者能看到真实的启动结果。源码位置：[src/index.ts](../../../../src/index.ts) 的 `apply`。

回归用例 [tests/host-startup.test.ts](../../../../tests/host-startup.test.ts) 使用真实 Cordis 生命周期、延迟身份存储和 `inject: ['obsidianBridgeLifecycle']` 的必需消费者：入口在存储就绪前不能完成、消费者在服务发布后激活、存储失败传递给正式入口。该用例替换了网络发现与 Vault 通信，实际安装与页面验证另记。

此前表象与实际的差别、以及「先怀疑 Maintenance 耦合 → 核对 Loader 等待范围 → 定位为初始化时序」的转折，见 [本次开发历程](../../../../docs/project/records/history/2026-09-20-independent-bridge-release.md) 与经验 [插件 pending 不一定是缺少某个服务](../../../../docs/project/records/history/experiences/loader-entry-waits-required-init.md)。

独立实例已通过官方命令安装 Bridge .6 与 Sticker .6（本批交付版本为 0.4.1-rc2.8），插件列表显示贴纸运行中，testvault 连接保留。**本记录只覆盖「必需消费者能启动」**：贴纸新增、持久化、回链和模型引用的业务验收未包含在内，安装与验收边界见 [[VER-rc28-install-and-acceptance-20260920]]。
