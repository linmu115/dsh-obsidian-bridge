---
id: REQ-lifecycle-composition
kind: requirement
title: 独立插件的生命周期与动态依赖
status: current
---

用户于 2026-09-23 确认补一轮生命周期与动态依赖修整，并再次要求 Core 与 Bridge 解耦。

- Core 不依赖 Bridge；Bridge 连接、绑定和 CLI 在未安装 Core / Maintenance 时可用，引用功能仅通过可选 Core 公开服务接入。
- 可选身份提供方冲突时保持停写保护；依赖移除或替换后重新核验并恢复，不重写 Vault 绑定和稳定身份。
- 卸载等待在途清理；旧连接退出前不得挂载新连接，晚到的异步结果不得复活已卸载插件。
- 验收覆盖依赖移除/恢复、在途卸载、重复清理与独立发行包加载；测试环境为 DSH 0.1.5-rc.2。

实施与验证待完成，本记录不表示已安装或通过实机验收。
