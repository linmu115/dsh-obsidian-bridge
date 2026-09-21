---
{
  "id": "IF-vault-binding",
  "kind": "interface",
  "title": "Bridge 绑定、发现与多 Vault 路由合同",
  "status": "current",
  "summary": "有效关系由 Obsidian 侧 Bridge 持久保存：每个 Vault 至多绑定一个实例，一实例可管理多个 Vault。DSH Bridge 按 vaultId 选择已确认连接，并核对实例、profile、绑定修订和当前启动身份。",
  "aliases": [],
  "relations": [],
  "sources": [
    {
      "path": "../../vendor/protocol/src/binding.ts",
      "role": "current-maintenance-authority"
    },
    {
      "path": "../../src/api.ts",
      "role": "current-maintenance-authority"
    },
    {
      "path": "../../README.md",
      "role": "current-maintenance-authority"
    }
  ]
}
---

# Bridge 绑定、发现与多 Vault 路由合同

有效关系由 Obsidian 侧 Bridge 持久保存：每个 Vault 至多绑定一个实例，一实例可管理多个 Vault。DSH Bridge 按 vaultId 选择已确认连接，并核对实例、profile、绑定修订和当前启动身份。

输入是明确的目标身份、预期绑定修订和操作身份；绑定、改绑、解绑以唯一写入端的回执为准。重复操作保持同一身份，并发变更返回冲突；Vault 离线、身份不明或目标歧义时不得显示成功。改绑不迁移历史，旧请求仍保留原目标。

本机发现只发布无令牌的候选身份与有效运行端点。端口和 bootId 变化不改变持久绑定；重新连接须核对新的启动身份。多 Vault 使用 `forVault(vaultId)`；省略目标且不能唯一确定时返回歧义，不使用任意连接。

Maintenance 的独立绑定管理是**可选协作**：通过已登记实例授权，在 DSH 停止时也可使用；Vault 须在线并启用兼容 Obsidian 侧桥。其授权、CAS、幂等与路径证明合同由 Maintenance / IF-offline-vault-binding 维护，见 [[INT-maintenance-offline-binding]]。没有 Maintenance 时，本插件设置页的连接/断开/重连仍然可用并且是本批实际验收的路径；DSH Bridge 的 CLI 操作也需要运行中的 DSH，且 CLI 本身是可选增强。

具体类型与错误结构以本仓库 [binding.ts](../../../../vendor/protocol/src/binding.ts) 和 [api.ts](../../../../src/api.ts) 为准。这里记录合同职责；真实绑定写入和业务往返的验收范围继续以对应版本回执为准。
