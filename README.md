# DSH Obsidian Bridge

**0.4.1-rc2.8 · DSH 0.1.5-rc.2**

一个独立 DSH 插件负责本实例与 Obsidian Vault 的连接、发现、路由、笔记定位和双链传输；引用交由 Annotation Core。Protocol 已内置，不再安装旧 Lifecycle、Reference Adapter 或 Suite。DSH 可以连接多个 Vault，每个 Vault 同时只绑定一个 DSH。

在 DSH 设置 → Obsidian 连接完成选择、连接、状态查看、断开和重连；无 Maintenance 也可使用。面板使用 DSH 样式。必需服务初始化由正式插件入口等待，修复普通贴纸一直等待 Bridge 的问题。独立本地引用不再请求缺席的 Maintenance 解析服务。

Obsidian CLI 是可选增强，缺少时基础桥照常工作，CLI 工具不会假装可执行。Core 保存引用与上下文状态；Bridge 不成为其它实例的全局绑定管理器。

## 部署方法

**环境要求**：Node.js 24，可正常启动的 DSH `0.1.5-rc.2` / `web` profile，以及桌面版 Obsidian（仅笔记连接需要）。**必须先安装 Annotation Core**，本套引用功能依赖它。不需要 Maintenance、Launcher 或 Codex。

从 [Release v0.4.1-rc2.8](https://github.com/linmu115/dsh-obsidian-bridge/releases/tag/v0.4.1-rc2.8) 下载 `dsh-obsidian-bridge-0.4.1-rc2.8.tgz`，然后：

```powershell
$env:DSH_HOME = '<你的 DSH_HOME>'
dsh plugin --profile web add ./dsh-obsidian-bridge-0.4.1-rc2.8.tgz
```

安装命令会把包写进 profile 并在 `dsh.profile.bundles` 注册，**不要**再手工插入同名插件节点。随后正常重启 DSH 使新版本加载。

**连接 Vault**：在 DSH 设置 → **Obsidian 连接**中选择、连接、查看状态或断开。每个 Vault 同时只绑定一个 DSH 实例/profile；断开只停止通信，保留笔记、历史引用和双链。

**Obsidian 侧**：还需要在目标 Vault 安装 Companion（`obsidian-deepharness-bridge`），负责笔记内的选段引用与定位。两侧都装好并绑定后才能完整使用引用流转。Obsidian CLI 是可选增强，缺少时基础桥照常工作。

**更新**：停止 DSH，备份 DSH_HOME，`plugin add` 新 tgz，重启并刷新内嵌/独立页面。
**卸载**：`dsh plugin --profile web remove dsh-obsidian-bridge`（依赖它的贴纸应先移除）。

完整说明（安装顺序、绑定核验、更新卸载、故障定位）：[INSTALL.md](docs/INSTALL.md)。本批为预发布，当前能力和未完成验收见 [发布验证记录](docs/RELEASE-20260920.md)。
