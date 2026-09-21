---
{
  "id": "IMP-vault-binding-routing",
  "kind": "implementation",
  "title": "双侧绑定、发现与多 Vault 路由的当前实现",
  "status": "current",
  "relations": [
    {
      "relation": "implements",
      "to": {
        "record_id": "REQ-vault-instance-binding"
      }
    },
    {
      "relation": "consumes",
      "to": {
        "record_id": "IF-instance-workspace-scope",
        "project_id": "0d05f813-7097-47d9-9e88-3d523bb537d6"
      }
    }
  ],
  "sources": [
    {
      "path": "../../../../worktrees/session-context-graph-20260913/dsh-obsidian-session-reference-suite/docs/project/records/migration/current-entrypoints.md",
      "role": "linked-authority"
    }
  ]
}
---

# 双侧绑定、发现与多 Vault 路由的当前实现

**版本说明**：下述绑定行为延续到本批 `dsh-obsidian-bridge@0.4.1-rc2.8`；绑定入口包括本插件设置页（客户端 `settings.section` 槽）与可选的 Maintenance 管理页，两者使用 Bridge 的同一修订检查与写入路径（见 [[INT-maintenance-offline-binding]]）。此处保留早前阶段的实现与合成证据记录，旧数字不充作本批安装回执。

此前阶段实现与合成证据：Companion 0.7.0-rc2.1（6791643）、Protocol 0.4.0-rc2.1（829215e）、Bridge 0.4.0-rc2.2（0629de2）与 Sticker 0.7.4-rc2.2（365aa69）均已提交并通过类型检查、构建与合成回归。兼容 Adapter 0.3.5-rc2.2（2040bb1）不进入运行装配。第一阶段共享通道已验收，见 [第一阶段：整合 Bridge 与普通贴纸共用通道（历史）](../../../../../../worktrees/session-context-graph-20260913/dsh-obsidian-session-reference-suite/docs/project/records/migration/current-entrypoints.md#IMP-bridge-consolidation)。当前产品名和安装结构已由 [[DEC-single-bridge-product]] 取代旧包装：统一 Bridge 0.4.1-rc2.1、Sticker 0.7.4-rc2.3，新包及安装单独验收。

Companion 的 VaultBindingProvider 是设置页与 HTTP 管理的唯一持久写入口：显式选择候选、活跃身份核验、expectedRevision CAS 与 operationId 幂等。一个 Vault 同时绑定一个 instanceId/profileId；一个实例可连接多个 Vault。控制修改还需已认证 controller 并核验目标实例，发现本身不授予权限。

Protocol 的 binding/discovery 出口提供严格 DTO 与 Node 注册辅助；公开记录仅含纯 loopback origin、稳定身份、boot、能力与有效期，拒绝令牌、过期、超大、污染及冲突身份。旧固定地址仅是待核验候选；Launcher 可选，未改为必需依赖。

DSH Bridge 为每个 Vault 建立独立连接、令牌和队列；消费者用 forVault 明确路由，多目标时不猜默认。Companion 的数据/控制握手核验 Vault、profile、绑定修订与 boot；Viewer 只接受匹配 controller 的受控租约。各 Vault 自动选择可用端口，单 Vault 离线不卸载其他通道。

新排队操作固定 vaultId/instanceId/profileId/bindingRevision，改绑后不重投旧作业；历史引用保留身份。note/backlink 行按 Vault 路由；旧 StickerRecord.vaultId 仅描述直接笔记关联，不定义托管贴纸全局所有权。普通 managed 贴纸删除的多 Vault outbox 持久保存 pendingVaultIds，每次成功通过 CAS 缩减，重启后只重试原有剩余目标，新上线 Vault 不扩展旧任务范围。

Maintenance 是可选范围提供方：分类工作区策略保存后下次启动生效，现有 run 按快照完成写入。Bridge 消费有效范围及 not-synced/deleted/offline/mapping-pending 状态，不另维护名单。旧 Viewer 知识通道仍保留；未来任意笔记、样式、模板及直连操作管道均 deferred。

源码合同分别位于 Bridge src/api.ts、Protocol src/binding.ts / src/discovery.ts、Companion src/binding/provider.ts / src/bridge/server.ts。既有持久 Bridge 身份与后加载 Maintenance 身份不一致时明确阻断，不静默重命名或改绑；联用时应配置相同稳定实例身份。新能力仅属于上述候选版本，验证边界见 [桥整合与双侧绑定的分阶段验证（历史）](../../../../../../worktrees/session-context-graph-20260913/dsh-obsidian-session-reference-suite/docs/project/records/migration/current-entrypoints.md#VER-vault-binding-implementation)。
