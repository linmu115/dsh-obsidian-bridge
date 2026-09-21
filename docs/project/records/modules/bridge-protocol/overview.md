---
{
  "id": "MOD-protocol",
  "kind": "module",
  "title": "Bridge 内部 Protocol：两端共享类型与校验",
  "status": "current",
  "summary": "Protocol 源码由本仓库 `vendor/protocol` 维护，已打包到 Bridge 的运行代码；用户不再独立安装 Protocol。",
  "sources": [
    {
      "path": "../../vendor/protocol/src/index.ts",
      "role": "current-maintenance-authority"
    },
    {
      "path": "../../vendor/protocol/src/data.ts",
      "role": "current-maintenance-authority"
    },
    {
      "path": "../../vendor/protocol/src/binding.ts",
      "role": "current-maintenance-authority"
    },
    {
      "path": "../../vendor/README.md",
      "role": "current-maintenance-authority"
    }
  ],
  "relations": [
    {
      "relation": "implements",
      "to": {
        "record_id": "REQ-vault-instance-binding"
      },
      "reason": "提供双侧绑定及本机发现的共享形状与校验"
    },
    {
      "relation": "provides",
      "to": {
        "record_id": "IF-protocol-control"
      },
      "reason": "控制类型与校验唯一提供方"
    },
    {
      "relation": "provides",
      "to": {
        "record_id": "IF-protocol-data"
      },
      "reason": "数据类型与校验唯一提供方"
    }
  ]
}
---

# Bridge 内部 Protocol：两端共享类型与校验

Protocol 源码由本仓库 `vendor/protocol` 维护，已打包到 Bridge 的运行代码；用户不再独立安装 Protocol。

[[IF-protocol-control]] 定义身份、握手、控制租约和状态校验；[[IF-protocol-data]] 定义导航、贴纸、回链和兼容消息。绑定与发现类型分别在 `vendor/protocol/src/binding.ts` 和 `discovery.ts`，实例身份与动态端点分离，发现条目不授予操作权限。

Annotation 2 引用事务协议由 Annotation Core 维护，Bridge Protocol 不接管引用状态、UI 或提交。Obsidian 侧 Bridge 和普通 Sticker 是协议消费者，各自维护业务与持久数据。

公共导出使用 `dsh-obsidian-bridge/protocol`、`/protocol/data`、`/protocol/binding`。开发依赖与来源见 [vendor 说明](../../../../../vendor/README.md)。控制版本 Lifecycle 3、数据版本 Sticker 1 是协议名称，不能据此恢复旧 Lifecycle 或 Protocol 独立仓库。
