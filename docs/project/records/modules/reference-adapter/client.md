---
{
  "id": "MOD-reference-client",
  "kind": "module",
  "title": "Bridge 内部引用 / Client 定向领取",
  "status": "current",
  "summary": "先持久加入 Core，再确认 Companion 领取；冲突补偿不清掉赢家。",
  "sources": [
    {
      "path": "../../src/reference/client/annotation-consumer.ts",
      "role": "current-maintenance-location"
    },
    {
      "path": "../../src/reference/client.ts",
      "role": "current-maintenance-location"
    },
    {
      "path": "../../../../worktrees/session-context-graph-20260913/dsh-obsidian-session-reference-suite/tests/cross-component-reference.test.ts",
      "role": "current-workspace-source"
    },
    {
      "path": "../../../../worktrees/session-context-graph-20260913/dsh-obsidian-session-reference-suite/docs/project/records/verification/source-evidence.md",
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
      "reason": "添加及补偿"
    },
    {
      "relation": "consumes",
      "to": {
        "record_id": "IF-companion-reference",
        "project_id": "2079793c-4a82-5c27-a71f-68084adb619e"
      },
      "reason": "claim"
    },
    {
      "relation": "implements",
      "to": {
        "record_id": "XR08",
        "project_id": "ddcdd580-5275-5eef-9578-6de0e81fa887"
      },
      "reason": "同一次操作身份重用"
    }
  ]
}
---

# Bridge 内部引用 / Client 定向领取

浏览器在 Lifecycle 就绪时读取当前内嵌页面可领取的 capture。消费函数先 addReference，使用 actionId 作为 operationId 并保留 referenceId，再将 Core 返回的 setId 与目标身份交给 Bridge claim。

Core 返回不同引用身份、领取 404/410 或幂等冲突时，通过 discardPendingOperation 清理本次失败添加，并对竞争失败使用 notifySource:false，避免取消赢家的 Bridge 关系。普通断线不随意丢掉已持久加入的引用；恢复后以原操作身份继续领取。

Client 还提供打开来源、逻辑链接导航和 UI 侧健康状态。它不负责宣布用户消息已提交。源码 [领取事务](../../../../../src/reference/client/annotation-consumer.ts)；组合测试逐条覆盖的场景见 [验证证据](../../../../../../../worktrees/session-context-graph-20260913/dsh-obsidian-session-reference-suite/docs/project/records/verification/source-evidence.md)。

## 可选会话解析能力的缺席分支（0.4.1-rc2.8）

客户端不再无条件向 `/dsh-session-maintenance/api` 请求位置解析。宿主通过生命周期合同声明 `hasReferenceLocationResolver?()`：

- 声明为 false（当前实例未注册可选解析服务）时，本地目标直接使用当前内嵌页面会话，不发出解析请求；携带 `logicalSessionId` 的历史目标明确报错，不把逻辑身份当成本地会话。
- 未声明该能力（旧宿主）时保留原兼容行为；已声明的解析器抛错时不降级为本地猜测，错误继续上抛。

原因与现场证据见 [[IMP-native-reference-receive-20260920]]；宿主侧声明与配置字段见 [连接与挂载合同](../bridge-lifecycle/interface.md)。这条分支的检查覆盖缺席、解析失败、逻辑历史目标三类边界（[tests/client-receiver.test.ts](../../../../../tests/client-receiver.test.ts)）；它不改变先 addReference 后 claim 的顺序，也不改变冲突补偿规则。
