---
{
  "id": "MOD-reference-host",
  "kind": "module",
  "title": "Bridge 内部引用 / Host 来源与删除",
  "status": "current",
  "summary": "准备时核对 Vault 来源，提交后写回链，通过持续轮询处理反向删除。",
  "sources": [
    {
      "path": "../../src/reference/host/obsidian-source-adapter.ts",
      "role": "current-maintenance-location"
    },
    {
      "path": "../../src/reference/host.ts",
      "role": "current-maintenance-location"
    },
    {
      "path": "records/modules/reference-adapter/integrations/core.md",
      "role": "linked-authority"
    },
    {
      "path": "../../../dsh-annotation-core/docs/project/records/modules/annotation-core/interfaces/host.md",
      "role": "linked-authority"
    }
  ],
  "relations": [
    {
      "relation": "consumes",
      "to": {
        "record_id": "IF-core-host",
        "project_id": "ddcdd580-5275-5eef-9578-6de0e81fa887"
      },
      "reason": "来源注册和后端删除"
    },
    {
      "relation": "consumes",
      "to": {
        "record_id": "IF-lifecycle"
      },
      "reason": "删除轮询挂载"
    },
    {
      "relation": "consumes",
      "to": {
        "record_id": "IF-companion-reference",
        "project_id": "2079793c-4a82-5c27-a71f-68084adb619e"
      },
      "reason": "准备、回链、删除 HTTP"
    }
  ]
}
---

# Bridge 内部引用 / Host 来源与删除

Host 向 Core 注册 obsidian-note 来源适配器，在线准备时调用 Companion refresh。BridgeUnavailable 或显式 offline 保留已捕获快照并标记离线；source-changed、note/block missing、protocol mismatch 等明确阻断。

真实提交后，commitBacklink 把用户消息、引用集与引用身份交给 Companion。取消待发送通过 discard，已提交删除通过 deleteCommitted。反向删除通过 Lifecycle 挂载 Host 轮询，调用 Core 可选 deleteReferenceLink；若有逻辑会话身份，优先经 Maintenance 解析。

源码 [来源 Adapter](../../../../../src/reference/host/obsidian-source-adapter.ts) 与 [宿主注册和轮询](../../../../../src/reference/host.ts) 是当前观察依据。Host 侧解析器读取是可选能力：`maintenanceReferenceResolver` 未注册时按唯一写入端与 native 身份处理，不伪装成已解析（见 [连接与挂载合同](../bridge-lifecycle/interface.md)）。返回 [消费方接入](integrations/core.md) 或 [提供方合同](../../../../../../dsh-annotation-core/docs/project/records/modules/annotation-core/interfaces/host.md)。
