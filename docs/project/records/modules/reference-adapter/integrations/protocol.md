---
{
  "id": "INT-reference-protocol",
  "kind": "integration",
  "title": "Bridge 内部引用接入协议与来源合同",
  "status": "current",
  "summary": "具体说明本组件消费的协议出口和自身适配责任。",
  "sources": [
    {
      "path": "../../src/reference/protocol.ts",
      "role": "current-maintenance-location"
    },
    {
      "path": "../../src/reference/client/annotation-consumer.ts",
      "role": "current-maintenance-location"
    },
    {
      "path": "../../src/reference/host/obsidian-source-adapter.ts",
      "role": "current-maintenance-location"
    },
    {
      "path": "../../../dsh-annotation-core/docs/project/records/modules/annotation-core/interfaces/annotation-protocol.md",
      "role": "linked-authority"
    },
    {
      "path": "../../../obsidian-deepharness-bridge/docs/project/records/modules/obsidian-companion/interfaces/references.md",
      "role": "linked-authority"
    }
  ],
  "relations": [
    {
      "relation": "consumes",
      "to": {
        "record_id": "IF-core-annotation-protocol",
        "project_id": "ddcdd580-5275-5eef-9578-6de0e81fa887"
      },
      "reason": "源码核实的协议消费"
    }
  ]
}
---

# Bridge 内部引用接入协议与来源合同

Adapter 的 protocol.ts 从 [Core Annotation 2 合同：引用捕获与生命周期消息](../../../../../../../dsh-annotation-core/docs/project/records/modules/annotation-core/interfaces/annotation-protocol.md) 导入并转导出 Annotation 2 捕获、claim、refresh、提交和删除类型；Client 领取事务与 Host 来源回调使用这些类型。[[INT-reference-core]]说明添加、补偿和来源注册等运行时调用。

同一文件转导出 [[IF-protocol-data]]，这是已核实的编译依赖；本次不把转导出写成每项功能都直接调用数据校验器。Lifecycle 提供传输/连接，Companion 提供 [Companion 合同：排队、领取、来源与回链](../../../../../../../obsidian-deepharness-bridge/docs/project/records/modules/obsidian-companion/interfaces/references.md) HTTP 行为。格式校验、页面认领、Core 持久提交各自有负责方。

源码入口：[protocol.ts](../../../../../../src/reference/protocol.ts)、[annotation-consumer.ts](../../../../../../src/reference/client/annotation-consumer.ts)、[obsidian-source-adapter.ts](../../../../../../src/reference/host/obsidian-source-adapter.ts)。

返回 [[MOD-protocol|共享协议接入目录]]；Annotation 2 返回 [Core Annotation 2 合同：引用捕获与生命周期消息](../../../../../../../dsh-annotation-core/docs/project/records/modules/annotation-core/interfaces/annotation-protocol.md)。
