> 当前 CLI 增强版本 **0.4.1-rc2.9**：[[REQ-cli-full-access]]、[[IMP-cli-full-access]]、[[VER-cli-full-access]]。隐藏配置文件、插件完整生命周期与任意 JavaScript 已纳入本轮；以下 .8 安装与业务验收均为历史时点。本版尚未部署到用户实例。

> 本批独立发布 0.4.1-rc2.8：[安装教程](../INSTALL.md)、[验证边界](../RELEASE-20260920.md)。历史版本说明按原时间阅读。

# DSH Obsidian Bridge

2026-09-20 独立运行批次（0.4.1-rc2.4 → 0.4.1-rc2.8，已安装到本地独立测试实例 profile web）：连接设置样式、必需消费者启动时序、无引擎本地引用接收三处修复。当前要求、实现进度与实际验证范围分开表述，逐项范围见 [[VER-rc28-install-and-acceptance-20260920]]。

- 连接管理：[[IMP-connection-settings-ui-20260920]]、[[IMP-independent-components-20260920]]；连接与绑定入口在本插件设置页，Maintenance 侧管理为可选协作。
- 贴纸启动阻断：[[IMP-required-consumer-startup-20260920]]——曾疑似 Maintenance 耦合，核对 Loader 等待范围后定位为 Bridge 初始化时序。
- 本地引用接收：[[IMP-native-reference-receive-20260920]]——缺席的可选解析接口不再被请求；真实引用经用户刷新后验收。
- 过程与经验：[[HIST-2026-09-20-independent-bridge-release]]、[[EXP-loader-entry-waits-required-init]]、[[EXP-refresh-then-verify-receipt]]。

**未验收**：其他桥业务、回链跳转、Maintenance 同步与「所有插件已独立验收」。独立运行不等于源码中引用的可选 Maintenance 接口都是硬依赖。

DSH 侧统一桥：稳定身份与 Vault 绑定、多 Vault 路由、连接与传输、Obsidian 来源接入、定位，以及绑定 Vault 的 CLI 操作（可选增强）。

## 当前入口

- [[MOD-lifecycle|DSH Bridge：连接、引用交接与维护]]
- [[MOD-reference|Bridge 引用接入：把 Obsidian 来源接入 Core]]
- [[MOD-protocol|Bridge 内部 Protocol：两端共享类型与校验]]
- [[IF-vault-binding|Bridge 绑定、发现与多 Vault 路由合同]]
- [[IMP-obsidian-cli|绑定 Vault 的 CLI 与操作 skill（可选增强）]]
- [[INT-maintenance-offline-binding|Maintenance 独立管理 Vault 绑定（可选协作）]]

## 协作项目

- [Annotation Core](../../../dsh-annotation-core/docs/project/map.md)
- [Sticker Board](../../../dsh-session-sticker-board/docs/project/map.md)
- [Obsidian 侧 Bridge](../../../obsidian-deepharness-bridge/docs/project/map.md)

## 维护与历史边界

2026-09-19 按用户要求从旧组件集合迁出有效说明，保留原记录 ID；旧组合正文已归档。[历史入口](../../../../worktrees/session-context-graph-20260913/dsh-obsidian-session-reference-suite/docs/project/map.md)保留旧版本验收与开发过程，历史测试不代表本次新增业务验收。

2026-09-21 本次维护：更新本批实现与验收记录，归档与当前源码不一致的 [[INT-suite-extension-pages]]（Maintenance 扩展页注册），并同步本批开发历程。过程说明见 [本次地图维护记录](maintenance/map-update-20260921.md)。

[本次地图迁移过程](maintenance/map-migration-20260919.md)。迁移与本次维护都只调整文档与阅读入口，未部署、改绑或修改用户笔记。
