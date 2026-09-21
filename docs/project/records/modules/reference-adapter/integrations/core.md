---
{
  "id": "INT-reference-core",
  "kind": "integration",
  "title": "Bridge 内部引用接入 Core",
  "status": "current",
  "summary": "用 Core 保存引用事务；Adapter 只实现 Obsidian 来源动作和当前页面交接。",
  "sources": [
    {
      "path": "../../src/reference/host.ts",
      "role": "current-maintenance-location"
    },
    {
      "path": "../../src/reference/client.ts",
      "role": "current-maintenance-location"
    },
    {
      "path": "../../src/reference/client/annotation-consumer.ts",
      "role": "current-maintenance-location"
    },
    {
      "path": "../../../dsh-annotation-core/docs/project/records/modules/annotation-core/interfaces/host.md",
      "role": "linked-authority"
    },
    {
      "path": "../../../dsh-annotation-core/docs/project/records/modules/annotation-core/interfaces/client.md",
      "role": "linked-authority"
    },
    {
      "path": "../../../dsh-annotation-core/docs/project/records/modules/annotation-core/overview.md",
      "role": "linked-authority"
    }
  ],
  "relations": [
    {
      "relation": "consumes",
      "to": {
        "record_id": "IF-core-client",
        "project_id": "ddcdd580-5275-5eef-9578-6de0e81fa887"
      },
      "reason": "Obsidian 引用消费",
      "reasons": [
        "Obsidian 引用消费",
        "添加与操作补偿"
      ]
    },
    {
      "relation": "consumes",
      "to": {
        "record_id": "IF-core-host",
        "project_id": "ddcdd580-5275-5eef-9578-6de0e81fa887"
      },
      "reason": "obsidian-note 实现",
      "reasons": [
        "obsidian-note 实现",
        "来源回调和背景删除"
      ]
    }
  ]
}
---

# Bridge 内部引用接入 Core

提供方合同：[Host](../../../../../../../dsh-annotation-core/docs/project/records/modules/annotation-core/interfaces/host.md)、[Client](../../../../../../../dsh-annotation-core/docs/project/records/modules/annotation-core/interfaces/client.md)；已知接入目录：[Core 模块](../../../../../../../dsh-annotation-core/docs/project/records/modules/annotation-core/overview.md)。Adapter 宿主声明注入 annotationCoreHost 和 obsidianBridgeLifecycle，注册 obsidian-note；Client 注入 sessions、annotationCore 和 Lifecycle。

影响本插件的功能有：在线来源核对、离线快照、取消、提交回链、双向删除、当前页面领取与来源导航。Core 负责 set/reference 身份与提交状态；Adapter 不写 Core 的存储格式、不制造 sent 记录。

消费方的失败处理是必要合同使用方式：领取冲突经 Core 补偿；Host 删除入口可选，缺少能力时不能假定已完成反向删除。当前源码已核对注册与调用，实际实例装载状态未在本任务验证。
