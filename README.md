# DSH Obsidian Bridge

> 当前运行环境：**DSH 0.1.5-rc.2 实例 / web profile**（0.1.5rc2）。其他 DSH 版本尚未验收。


**0.4.1-rc2.11 · DSH 0.1.5-rc.2**

一个独立 DSH 插件负责本实例与 Obsidian Vault 的连接、发现、路由、笔记定位和双链传输；引用交由 Annotation Core。Protocol 已内置，不再安装旧 Lifecycle、Reference Adapter 或 Suite。DSH 可以连接多个 Vault，每个 Vault 同时只绑定一个 DSH。

在 DSH 设置 → Obsidian 连接完成选择、连接、状态查看、断开和重连；无 Maintenance 也可使用。面板使用 DSH 样式。必需服务初始化由正式插件入口等待，修复普通贴纸一直等待 Bridge 的问题。独立本地引用不再请求缺席的 Maintenance 解析服务。

Obsidian CLI 是可选增强，缺少时基础桥照常工作，CLI 工具不会假装可执行。Core 保存引用与上下文状态；Bridge 不成为其它实例的全局绑定管理器。

本版补齐卸载清理、晚到请求防护与可选身份提供方恢复；Core / Maintenance 仍为可选协作。见[修整说明](docs/RELEASE-20260923.md)。

## CLI 权限增强

LLM 可通过 `dsh_obsidian_cli` 读写 `.obsidian` 等隐藏配置目录，部署本地插件文件，安装、卸载、启用、停用或重载插件，并执行任意 JavaScript `eval`。配置目录先用 `config:dir` 查询，支持自定义目录。

CLI 功能沿用已绑定 Vault 的身份核验和写入请求回执；不需要 Core、普通贴纸、DAG、Maintenance 或 Launcher。引用功能才需要 Core。Obsidian 侧桥沿用现有绑定接口，无需为本次 CLI 增强配套升级。`eval` 与插件代码具有 Obsidian 进程权限，不是 Vault 沙箱。

[下载 CLI 权限增强版](https://github.com/linmu115/dsh-obsidian-bridge/releases/tag/v0.4.1-rc2.11) · [安装说明](docs/INSTALL-CLI.md) · [命令与回执](docs/cli-operations.md)

## 部署方法

**环境要求**：Node.js 24，可正常启动的 DSH `0.1.5-rc.2` / `web` profile，以及桌面版 Obsidian（仅笔记连接需要）。CLI、配置文件和插件管理可独立使用；引用功能才需要 Annotation Core。不需要 Maintenance、Launcher 或 Codex。

从 [Release v0.4.1-rc2.11](https://github.com/linmu115/dsh-obsidian-bridge/releases/tag/v0.4.1-rc2.11) 下载 `dsh-obsidian-bridge-0.4.1-rc2.11.tgz`，然后：

```powershell
$env:DSH_HOME = '<你的 DSH_HOME>'
dsh plugin --profile web add ./dsh-obsidian-bridge-0.4.1-rc2.11.tgz
```

安装命令会把包写进 profile 并在 `dsh.profile.bundles` 注册，**不要**再手工插入同名插件节点。随后正常重启 DSH 使新版本加载。

**连接 Vault**：在 DSH 设置 → **Obsidian 连接**中选择、连接、查看状态或断开。每个 Vault 同时只绑定一个 DSH 实例/profile；断开只停止通信，保留笔记、历史引用和双链。

**Obsidian 侧**：还需要在目标 Vault 安装 Companion（`obsidian-deepharness-bridge`），负责笔记内的选段引用与定位。两侧都装好并绑定后才能完整使用引用流转。Obsidian CLI 是可选增强，缺少时基础桥照常工作。

**更新**：停止 DSH，备份 DSH_HOME，`plugin add` 新 tgz，重启并刷新内嵌/独立页面。
**卸载**：`dsh plugin --profile web remove dsh-obsidian-bridge`（依赖它的贴纸应先移除）。

本次独立 CLI 权限增强的安装与用法：[INSTALL-CLI.md](docs/INSTALL-CLI.md)。命令合同见 [CLI 操作](docs/cli-operations.md)，本次验证边界见 [发布验证记录](docs/RELEASE-20260922.md)。

本版开放 `.obsidian` 等隐藏文件读写、插件安装/卸载/启停和任意 JavaScript `eval`。无需 Core、Maintenance、Sticker 或 Codex Runtime；Obsidian 侧桥沿用现有绑定接口，不需配套升级。`eval` 具有 Obsidian 进程权限，不是 Vault 文件系统沙箱。

源码开发：[独立克隆、锁定依赖与打包](docs/BUILD.md)。
