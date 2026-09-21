---
{
  "id": "IMP-delivery",
  "kind": "implementation",
  "title": "笔记选段投递：实际顺序与恢复",
  "status": "current",
  "summary": "自动队列流程按 Companion、Bridge 内部连接/引用模块、Core 分责；直接关联引用另走专门入口。",
  "progress": "implemented",
  "gap": "静态核对与来源合成测试覆盖；0.4.1-rc2.8 独立实例上一条真实引用的接收与同步已由用户刷新后验收，双应用完整投递流程与双链跳转仍未验收。",
  "sources": [
    {
      "path": "../../src/reference/client/annotation-consumer.ts",
      "role": "current-maintenance-location"
    },
    {
      "path": "../../src/reference/host/obsidian-source-adapter.ts",
      "role": "current-maintenance-location"
    },
    {
      "path": "../../src/runtime.ts",
      "role": "current-maintenance-location"
    },
    {
      "path": "../../../../worktrees/session-context-graph-20260913/dsh-obsidian-session-reference-suite/tests/cross-component-reference.test.ts",
      "role": "current-workspace-source"
    },
    {
      "path": "../../../../worktrees/session-context-graph-20260913/dsh-annotation-core/README.md",
      "role": "current-workspace-source"
    },
    {
      "path": "../../../obsidian-deepharness-bridge/docs/project/records/modules/obsidian-companion/interfaces/knowledge.md",
      "role": "linked-authority"
    }
  ],
  "relations": [
    {
      "relation": "implements",
      "to": {
        "record_id": "REQ-selection"
      },
      "reason": "投递时序"
    },
    {
      "relation": "implements",
      "to": {
        "record_id": "XR08",
        "project_id": "ddcdd580-5275-5eef-9578-6de0e81fa887"
      },
      "reason": "重试不重复"
    },
    {
      "relation": "uses",
      "to": {
        "record_id": "MOD-reference-client"
      },
      "reason": "先添加后 claim"
    },
    {
      "relation": "uses",
      "to": {
        "record_id": "MOD-core-submit",
        "project_id": "ddcdd580-5275-5eef-9578-6de0e81fa887"
      },
      "reason": "持久提交确认"
    },
    {
      "relation": "related",
      "to": {
        "record_id": "IF-companion-knowledge",
        "project_id": "2079793c-4a82-5c27-a71f-68084adb619e"
      },
      "reason": "区分直接路径"
    }
  ]
}
---

# 笔记选段投递：实际顺序与恢复

1. Companion 保存用户选段 capture 与本侧定位责任，等待配置的内嵌页。
2. DSH Bridge 确认可用 Companion 与当前实例，挂载 Client 外部连接；宿主声明未注册可选会话解析服务时，本地目标直接使用当前会话，不请求 Maintenance 解析接口（见 [[IMP-native-reference-receive-20260920]]）。
3. Adapter 将相同操作和引用身份持久加入目标 Core；随后向 Companion claim。
4. 用户检查气泡与原草稿并发送。Core 校验目标、引用版本、来源及请求预算。
5. 执行器接受并持久确认后 Core 标记 sent；Host 来源 Adapter 执行回链写回。
6. Companion 保存绑定和可见回链；失败保留对应任务供重试。

自动领取和发送是两个阶段：claim 不证明模型已收到材料。取消操作及领取冲突经 Core 补偿；Bridge 断线时保留已经持久加入的同一操作，重连不重复添加。反向删除有独立 Host 轮询，因此不要求目标浏览器一直打开。

内置流程图选择这条队列路径说明时序与负责方。关联笔记气泡的直接路径没有 capture/自动 claim，见 [直接引用合同](../../../../../obsidian-deepharness-bridge/docs/project/records/modules/obsidian-companion/interfaces/knowledge.md)；删除和上下文释放是另外的生命周期，正文记录而不硬塞入同一长流程。
