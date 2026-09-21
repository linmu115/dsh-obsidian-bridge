---
{
  "id": "INT-lifecycle-protocol",
  "kind": "integration",
  "title": "Bridge 接入内部 Protocol",
  "status": "current",
  "summary": "具体说明本组件消费的协议出口和自身适配责任。",
  "sources": [
    {
      "path": "../../src/control-client.ts",
      "role": "current-maintenance-location"
    },
    {
      "path": "../../src/transport.ts",
      "role": "current-maintenance-location"
    },
    {
      "path": "../../src/runtime.ts",
      "role": "current-maintenance-location"
    },
    {
      "path": "../../../dsh-annotation-core/docs/project/records/modules/annotation-core/interfaces/annotation-protocol.md",
      "role": "linked-authority"
    },
    {
      "path": "../../../obsidian-deepharness-bridge/docs/project/records/modules/obsidian-companion/overview.md",
      "role": "linked-authority"
    }
  ],
  "relations": [
    {
      "relation": "consumes",
      "to": {
        "record_id": "IF-protocol-control"
      },
      "reason": "源码核实的协议消费"
    },
    {
      "relation": "consumes",
      "to": {
        "record_id": "IF-protocol-data"
      },
      "reason": "源码核实的协议消费"
    },
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

# Bridge 接入内部 Protocol

控制客户端直接使用 [[IF-protocol-control]] 校验状态/租约并发送控制请求，runtime 依状态挂载引用和贴纸附件；服务不就绪时等待恢复，不删除 Core 引用。transport 直接使用 [[IF-protocol-data]] 解析深链、贴纸、回链和导航数据，同时使用 [Core Annotation 2 合同：引用捕获与生命周期消息](../../../../../../../dsh-annotation-core/docs/project/records/modules/annotation-core/interfaces/annotation-protocol.md) 解析新引用 capture / refresh / 删除回执。

Lifecycle 拥有连接和传输过程，Protocol 只定义形状。Bridge 的控制服务由 [Obsidian 侧 Bridge：Vault 侧会话与引用协作](../../../../../../../obsidian-deepharness-bridge/docs/project/records/modules/obsidian-companion/overview.md) 运行，运行时 API 合同见 [[IF-lifecycle]]。控制版本、实例与 bootId 不匹配会影响租约；数据解析失败不能冒充来源刷新成功。

源码入口：[control-client.ts](../../../../../../src/control-client.ts)、[transport.ts](../../../../../../src/transport.ts)、[runtime.ts](../../../../../../src/runtime.ts)。

返回 [[MOD-protocol|共享协议接入目录]]；Annotation 2 返回 [Core Annotation 2 合同：引用捕获与生命周期消息](../../../../../../../dsh-annotation-core/docs/project/records/modules/annotation-core/interfaces/annotation-protocol.md)。
