# DSH Obsidian Bridge

**0.4.1-rc2.8 · DSH 0.1.5-rc.2**

一个独立 DSH 插件负责本实例与 Obsidian Vault 的连接、发现、路由、笔记定位和双链传输；引用交由 Annotation Core。Protocol 已内置，不再安装旧 Lifecycle、Reference Adapter 或 Suite。DSH 可以连接多个 Vault，每个 Vault 同时只绑定一个 DSH。

在 DSH 设置 → Obsidian 连接完成选择、连接、状态查看、断开和重连；无 Maintenance 也可使用。面板使用 DSH 样式。必需服务初始化由正式插件入口等待，修复普通贴纸一直等待 Bridge 的问题。独立本地引用不再请求缺席的 Maintenance 解析服务。

Obsidian CLI 是可选增强，缺少时基础桥照常工作，CLI 工具不会假装可执行。Core 保存引用与上下文状态；Bridge 不成为其它实例的全局绑定管理器。

## 安装、配置与使用

[完整命令行与手动安装教程](docs/INSTALL.md) · [下载本版本附件](https://github.com/linmu115/dsh-obsidian-bridge/releases/tag/v0.4.1-rc2.8)

本批为预发布，安装顺序、数据保留、更新卸载和故障定位均在教程中。无需用户的 LLM 才能完成基础配置。当前能力和未完成验收见 [发布验证记录](docs/RELEASE-20260920.md)。
