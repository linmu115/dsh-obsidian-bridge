---
{"id":"IMP-native-reference-receive-20260920","kind":"implementation","title":"独立会话引用接收能力检查","status":"current","summary":"Bridge .7 显式声明可选会话解析能力，本地引用在缺席时不请求 Maintenance；无引擎真实引用气泡及会话测试经用户验收，claimed 与同步回执已核验。"}
---

见 [改动说明](../../../changes/2026-09-20-native-reference-receive.md)。宿主能力声明经 Remote schema 检查，客户端仅对真实可用的解析器发起请求。已测试缺席、存在但失败、逻辑历史目标缺少解析器的边界。测试实例已部署 .7；用户刷新后确认气泡和会话测试正常，同一真实引用的 claimed 状态及同步回执随后已核验，Maintenance 保持关闭。该结果仅覆盖本次引用流程。
