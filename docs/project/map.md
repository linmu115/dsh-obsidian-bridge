# DSH Obsidian Bridge

当前维护仓库：[linmu115/dsh-obsidian-bridge](https://github.com/linmu115/dsh-obsidian-bridge)。桥接层合并后的独立项目，版本 0.4.1-rc2.3，保留 Lifecycle 的提交历史及本次以前未提交的 CLI 功能。

## 边界与入口

- DSH 侧单桥：身份、Vault 绑定、发现、传输、定位、引用来源与绑定 Vault CLI 操作。见 [README](../../README.md) 和 [CLI 操作](../cli-operations.md)。
- Obsidian 侧继续维护 [obsidian-deepharness-bridge](https://github.com/linmu115/obsidian-deepharness-bridge)，迁移时对应 2b7d992；后续 Maintenance 独立绑定能力为 d162f5b / 0.7.0-rc2.4，已配套 Engine .45 安装。见 [[INT-maintenance-offline-binding]]。
- Core 拥有引用状态、UI 和上下文；Sticker、ThoughtDAG、Maintenance 保持独立。
- 共享 Protocol 源码在 `vendor/protocol` 继续维护。Core SDK 是固定开发快照，来源见 [vendor 说明](../../vendor/README.md)。

## 被替代仓库

Lifecycle、Reference Adapter、Protocol、Session Reference Suite 四个旧仓库停止独立维护；旧仓库保留代码、许可证、历史文档和迁移说明。Suite 中的旧组合地图作为历史规格证据保留，不再代表独立安装项或活跃的桥仓库。

## 验证边界

本次迁移验证：新桥构建、类型检查及 157 项测试通过（包含 Protocol 和双端合成 HTTP 测试）；Obsidian 侧类型检查和 261 项测试通过。未重启、安装、改绑或操作真实笔记；真实 UI 未验收。提交、推送与归档结果以 GitHub 当前仓库状态为准。

本次过程：[迁移开发记录](../repository-migration-20260919.md)。

2026-09-19 后续收尾核对：CLI 功能提交 d3b21f7 已在远端 main，无未提交 CLI 改动。本轮未改本项目运行代码；只同步 Obsidian Companion 与 Maintenance 的新接口及实际安装边界。当前绑定管理在 Maintenance 内按已登记实例执行，DSH 可以停止；CLI 业务工具仍通过运行中的 DSH 调用并沿用既有目标核验。
