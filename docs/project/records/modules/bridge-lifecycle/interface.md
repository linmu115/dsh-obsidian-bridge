---
{
  "id": "IF-lifecycle",
  "kind": "interface",
  "title": "Bridge 合同：连接、统一分派与引用交接",
  "status": "current",
  "summary": "Bridge 拥有连接与消息确认；消费者借用操作接口、注册动作业务并通过共用交接调用 Core。宿主同时声明可选会话解析与 CLI 能力是否存在。",
  "sources": [
    {
      "path": "../../src/api.ts",
      "role": "current-maintenance-location"
    },
    {
      "path": "../../src/action-channel.ts",
      "role": "current-maintenance-location"
    },
    {
      "path": "../../src/reference/handoff.ts",
      "role": "current-maintenance-location"
    },
    {
      "path": "../../src/index.ts",
      "symbol": "BridgeLifecycleService",
      "role": "current-implementation"
    },
    {
      "path": "../../tests/host-startup.test.ts",
      "role": "current-workspace-source"
    },
    {
      "path": "../../../../worktrees/session-context-graph-20260913/dsh-obsidian-session-reference-suite/docs/project/records/migration/current-entrypoints.md",
      "role": "linked-authority"
    }
  ]
}
---

# Bridge 合同：连接、统一分派与引用交接

普通贴纸可以请求打开笔记、同步贴纸数据或把关联笔记引用到当前会话。Bridge 统一提供可借用的传输操作、就绪挂载、消息分派与引用交接；调用方保留业务验证和界面，不再自建连接或自行确认消息。

`transport` 是借用接口，不暴露销毁、轮询游标或动作确认。`registerActionHandler` 注册本业务能识别的动作，返回只释放自身的句柄。Bridge 每个宿主或页面运行各有一个队列消费者；只有明确成功的所属动作被确认，不属于当前实例／Profile／页面的动作被忽略且不确认，等待业务就绪的动作可重试。重名或多个处理者同时声明同一动作是可诊断冲突。

`handoffReference` 接受当前会话、操作身份和业务的准备、核验、提交回调。它协调 Core 的添加与补偿，Core 继续持有通用引用状态和持久任务。贴纸的笔记关联规则与数据不迁入桥。

`mountWhenReady`、状态订阅、健康来源和 `drain/resume/retry` 保留。绑定管理入口现在**首先由本插件设置页提供**（客户端注册 `settings.section`），Maintenance 侧的集中管理页是可选协作者；两者都使用 Bridge 的连接与绑定能力，不能各自保存一份可独立生效的绑定。缺少普通贴纸不妨碍观察桥。消费者卸载只释放自己的贡献，不能关闭共享连接。

## 可选能力的声明与影响（0.4.1-rc2.8）

宿主用 `getBridgeConfig` 声明两个可选能力，客户端据此选择路径，而不是去探测可能不存在的接口：

- `referenceLocationResolverAvailable`：false 表示当前实例未注册可选会话解析服务。此时本地引用直接使用当前会话；携带逻辑历史身份的目标明确报错，不猜本地映射。已注册解析服务失败时也不降级。接口 `hasReferenceLocationResolver?()` 与 `getCliAvailability?()` 是可选的，旧宿主不提供时保留原兼容行为。
- `cli`：`available:false` 表示没有可用的 Obsidian CLI，此时不注册 `dsh_obsidian_cli` 与 CLI 操作 skill，连接与引用功能继续运行。

改变这两项会同时影响客户端领取路径、设置页显示和模型可用工具；消费方接入说明见 [[MOD-reference-client]]、[[IMP-obsidian-cli]]。

参数、能力声明和错误行为以 [api.ts](../../../../../src/api.ts) 为唯一合同，实现位于 action-channel、reference/handoff 与 runtime。既有引用接入成为 [[MOD-lifecycle]] 内的 [[MOD-reference]]。Core 或 Maintenance 尚未加载时，连接服务仍正常；依赖其能力的工作等待或明确不可用。

当前 Bridge 已扩展为按 Vault 的独立通道，消费者通过 forVault(vaultId) 明确路由；无目标且多 Vault 时返回歧义，不借用任意连接。绑定设计见 [[IF-vault-binding]]，当前实现与组合验收见 [[IMP-vault-binding-routing]]、[桥整合与双侧绑定的分阶段验证（历史）](../../../../../../../worktrees/session-context-graph-20260913/dsh-obsidian-session-reference-suite/docs/project/records/migration/current-entrypoints.md#VER-vault-binding-implementation)。
