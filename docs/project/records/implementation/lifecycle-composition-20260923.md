---
id: IMP-lifecycle-composition
kind: implementation
title: 生命周期与动态依赖修整
status: current
---

对应 [[REQ-lifecycle-composition]]。Core 与 Bridge 仍为独立插件：发行包内嵌无副作用的协议定义，引用子功能通过可选 Core 服务挂载；连接、绑定与 CLI 无需 Core / Maintenance。

2026-09-23：身份冲突改为依赖作用域拥有的保护，错误提供方移除后释放自身保护并重新发现 Vault；多个保护不会互相撤销。稳定 Bridge 身份以已保存值/显式配置为准，Maintenance 只可作为首次安装的同 profile 身份来源。冲突仍停用桥通道，不改现有绑定或身份。

Vault 路由变更串行执行：先等旧通道退出，再建立新通道；插件卸载也等待已经退出路由表但仍在关闭的通道。客户端卸载先释放远程描述符，再等待刷新收尾和路由清理；晚到结果不会重新接入。远程描述符清理幂等。

验证：新增依赖替换、多个冲突保护、在途通道关闭、晚到刷新、加载中卸载测试。当前完整 Bridge 187 项、Protocol 13 项通过，发行版本 0.4.1-rc2.11，依赖 Core 0.3.12-rc2.29 的可选公共服务。未修改运行实例，UI 与真实热更新未验收。
