---
{
  "id": "IF-protocol-data",
  "kind": "interface",
  "title": "Protocol 数据合同：贴纸、定位与导航",
  "status": "current",
  "summary": "共享数据形状保留身份与旧消息兼容；正文和事务仍由各自所有者管理。",
  "sources": [
    {
      "path": "../../vendor/protocol/src/data.ts",
      "role": "current-maintenance-location"
    },
    {
      "path": "../../vendor/protocol/README.md",
      "role": "current-maintenance-location"
    },
    {
      "path": "../../../dsh-annotation-core/docs/project/records/modules/annotation-core/interfaces/annotation-protocol.md",
      "role": "linked-authority"
    },
    {
      "path": "../../../dsh-session-sticker-board/docs/project/records/modules/sticker-board/integrations/protocol.md",
      "role": "linked-authority"
    },
    {
      "path": "../../../obsidian-deepharness-bridge/docs/project/records/modules/obsidian-companion/integrations/protocol.md",
      "role": "linked-authority"
    }
  ],
  "relations": []
}
---

# Protocol 数据合同：贴纸、定位与导航


调用者交付待发送或接收的数据对象，解析器按消息类型得到贴纸、回链、打开笔记、会话深链或兼容消息；格式不符由消费者处理为失败。库没有文件读写、网络传输或引用数据库。

例如 deep-link 携 actionId、原生 sessionId 与可选 targetSurfaceId；可选 dshInstanceId / logicalSessionId / logicalAnchorId 保留稳定目标。旧消息缺少这些字段时不凭空补一个实例，真实目标和权限仍由消费者核对。

当前 Sticker 1；旧 pending-citation 等兼容类型不是新 Annotation 2 引用提交入口。Core 的新捕获/claim/refresh/backlink 消息定义见 [Core Annotation 2 合同：引用捕获与生命周期消息](../../../../../../../dsh-annotation-core/docs/project/records/modules/annotation-core/interfaces/annotation-protocol.md)。本地 outbox 和 Maintenance 真源不因共享 session-note 传输类型而改变所有者。

## 已知接入与返回

- [[INT-lifecycle-protocol|Lifecycle]]：transport 实际解析深链、贴纸/回链响应并传输消息。
- [Sticker](../../../../../../../dsh-session-sticker-board/docs/project/records/modules/sticker-board/integrations/protocol.md)：普通贴纸和会话笔记形状；本地 outbox schema 留在自身。
- [Companion](../../../../../../../obsidian-deepharness-bridge/docs/project/records/modules/obsidian-companion/integrations/protocol.md)：数据校验、逻辑目标形状与 Vault/Bridge 交接。
- [[INT-reference-protocol|Reference Adapter]]：本地 protocol.ts 转导出共享数据；当前 Annotation 2 引用动作直接采用 Core 合同，不能由转导出推断全部引用都由此库定义。

技术权威：[提供方源码](../../../../../../vendor/protocol/src/data.ts)。返回 [[MOD-protocol|Protocol 目录]]。
