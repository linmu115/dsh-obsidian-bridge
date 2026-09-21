---
{
  "id": "VER-rc28-install-and-acceptance-20260920",
  "kind": "verification",
  "title": "0.4.1-rc2.8 批次安装与独立运行验收范围",
  "status": "current",
  "summary": "0.4.1-rc2.8 已安装到本地 web 测试实例；已验收桥启动时序、无引擎本地引用接收与一条真实引用的 claimed/同步回执，其余桥业务与 Maintenance 同步未验收。",
  "sources": [
    {
      "workspace_id": "source",
      "path": "docs/RELEASE-20260920.md",
      "role": "verification-authority",
      "reviewed_sha256": "bb2ffd35cdaca3798ca63eee2a24a23c7eca43eb3c964f015e38254bc59d44cd",
      "reviewed_dependencies": []
    },
    {
      "workspace_id": "source",
      "path": "docs/INSTALL.md",
      "role": "verification-authority",
      "reviewed_sha256": "82e24e8a8c03e0a762498c8a03db548737b7d1eeaf3791b235797511b845e95d",
      "reviewed_dependencies": []
    },
    {
      "workspace_id": "source",
      "path": "docs/changes/2026-09-20-required-consumer-startup.md",
      "role": "change-report",
      "reviewed_sha256": "2c9ef6b4eb94d364f19c61e5905e574ab452656157146993aae20d24faaf185c",
      "reviewed_dependencies": []
    },
    {
      "workspace_id": "source",
      "path": "docs/changes/2026-09-20-native-reference-receive.md",
      "role": "change-report",
      "reviewed_sha256": "e73f1fb4494eba8290a7af0d57da088eeb48fc699c4f5ae4dc887737ac5759a1",
      "reviewed_dependencies": []
    },
    {
      "workspace_id": "source",
      "path": "docs/changes/2026-09-20-connection-settings-ui.md",
      "role": "change-report",
      "reviewed_sha256": "e7b51cc3d49e5d11ef9e56abd9e490a1460c5806cc6f5d8b58bcafec2c5c488b",
      "reviewed_dependencies": []
    }
  ],
  "relations": [
    {
      "relation": "verifies",
      "to": {
        "record_id": "IMP-required-consumer-startup-20260920"
      },
      "reason": "启动时序修复的安装与加载结果"
    },
    {
      "relation": "verifies",
      "to": {
        "record_id": "IMP-native-reference-receive-20260920"
      },
      "reason": "本地引用接收路径的真实验收"
    },
    {
      "relation": "verifies",
      "to": {
        "record_id": "IMP-connection-settings-ui-20260920"
      },
      "reason": "连接设置样式的浅色/深色复核"
    }
  ],
  "source_review": {
    "reviewed_at": "2026-09-21T07:37:05.296848+00:00",
    "reason": "对照 docs/RELEASE-20260920.md、docs/INSTALL.md 与 docs/changes/2026-09-20-*.md，已验收/未验收范围表述一致",
    "body_sha256": "8c28c5e93dc7a0a380a793e0756d880cbff676f9583cf5b47be00c43ad39556c"
  }
}
---

# 0.4.1-rc2.8 批次安装与独立运行验收范围

检查对象是本仓库 `dsh-obsidian-bridge@0.4.1-rc2.8`，环境为 DSH `0.1.5-rc.2` / `web` 独立测试实例，**未安装 Maintenance 引擎与接入包**（维护端口无监听）。testvault 的连接与绑定在整批升级中保留。

现场记录与发行包位于本机证据目录 `D:\AI\DeepSeekHarness-Plugin\artifacts\architecture-upgrade-20260920\`（不是 Git 工作树，未登记为地图工作区，只能作为文字定位人工打开）。

## 已验收（有回执的部分）

- **启动时序**：Bridge 0.4.1-rc2.6 正式安装后，插件列表不再出现 `dsh-session-sticker-board: pending (waiting for service: obsidianBridgeLifecycle)`，贴纸显示「运行中 / 已启用」，独立实例正常监听 19876 且 stderr 为空。修复前源码备份与安装日志见证据目录 `before-bridge-startup-fix`、`independent-sticker-fixed.*.log`。
- **本地引用接收**：Bridge 0.4.1-rc2.7 安装后，无引擎环境下 testvault 的一条真实引用（referenceId `d840fbba-2ffe-49dc-9814-9d551652e0d0`）经用户刷新 Obsidian 内 DSH 网页后出现气泡，会话测试正常；随后只读核验该引用由 queued 转为 claimed，存在同步回执，等待接收为 0、已同步 1。现场记录见证据目录 `native-reference-receive-20260920.md`。
- **连接设置样式**：0.4.1-rc2.5 的真实安装后，浅色与深色截图复核通过、491px 内容无横向溢出；引擎关闭且 Maintenance 包已移除时，设置页断开 testvault 再连接成功。
- **自动化检查**：本组件 166 项测试、类型检查与构建通过；与上述改动相关的新增回归分别覆盖入口等待必需初始化、能力缺席时不请求解析接口、逻辑历史目标缺少解析器时报错、设置槽注册与释放。测试数字与失败项说明以本仓库 [发布验证记录](../../../../docs/RELEASE-20260920.md) 为准。

## 未验收（不得由上述结果推定为完成）

- 贴纸业务本身：创建、编辑、删除、持久化与回链跳转；本次只确认它能启动。
- 其他桥业务范围：Obsidian CLI 的模型端到端调用、面板与任意 Plugin API 执行器、真实笔记写入。
- Maintenance 同步、受管实例流程、扩展页与实例范围协作。
- 多 Vault 组合、所有回链跳转、所有插件的独立验收。
- 本批安装发生在独立实例；受管实例的行为不在本次证据内。

## 适用边界

独立运行不等于源码中引用的可选 Maintenance 接口都是硬依赖；反过来，独立实例能启动也不证明这些可选接入已被移除。安装包指纹来自证据目录 `independent-preview-r13/BUILD-INFO.json`：Bridge `version 0.4.1-rc2.8`、`sourceCommit 4e8de6e`、`sourceDirty true`，即本批安装的是工作树内容，不是某个干净提交。
