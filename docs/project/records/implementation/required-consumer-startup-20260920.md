---
{"id":"IMP-required-consumer-startup-20260920","kind":"implementation","title":"必需消费者启动等待","status":"current","summary":"Bridge .6 将端口和身份存储初始化纳入 Loader 正式入口等待，修复普通贴纸 pending；无 Maintenance 的真实实例已正常加载。"}
---

实现与回归边界见 [改动说明](../../../changes/2026-09-20-required-consumer-startup.md)。独立实例已通过官方命令安装 Bridge .6 + Sticker .6，插件列表显示贴纸运行中，testvault 连接保留。贴纸新增、持久化、回链和模型引用的业务验收未包含在本记录。
