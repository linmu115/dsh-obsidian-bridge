---
{
  "id": "EXP-loader-entry-waits-required-init",
  "kind": "experience",
  "task_id": "HIST-2026-09-20-independent-bridge-release",
  "title": "插件 pending 不一定是缺少某个服务，可能是正式入口提前完成",
  "date": "2026-09-20",
  "status": "current",
  "categories": [
    "debugging"
  ],
  "results": [
    "passed"
  ],
  "modules": [
    "MOD-lifecycle"
  ],
  "summary": "贴纸报 pending (waiting for service: obsidianBridgeLifecycle)，表象像 Maintenance 耦合，实际是 Bridge 把必需初始化放在内部 inject 纤维，Loader 不等待它。",
  "outcome": "必需初始化放回正式异步 apply，贴纸在无 Maintenance 的独立实例中恢复运行。",
  "applicability": "DSH 0.1.5-rc.2 的插件 Loader 等待语义；Bridge 0.4.1-rc2.5 及更早的同步 apply 入口。",
  "coverage_note": "2026-09-21 由本次地图维护任务根据 host 会话第 6029–7262 行的公开事件与回归用例整理；原因为当时的实现结构，另有「贴纸此前确实接入过 Maintenance 业务页」这一同向线索，本经验只说明排查不能止于表象。",
  "related_records": [
    "IMP-required-consumer-startup-20260920",
    "IF-lifecycle"
  ]
}
---

# 插件 pending 不一定是缺少某个服务，可能是正式入口提前完成

`dsh-session-sticker-board: pending (waiting for service: obsidianBridgeLifecycle)` 有两种常见成因：服务确实没有发布，或者服务发布得太晚。第二种在插件列表里的显示与第一种完全相同。

本例属于第二种：Bridge 的正式 `apply` 立即返回，端口等待与持久身份存储打开都在内部 `ctx.inject` 回调里异步进行；DSH Loader 只等待配置树中正式入口的任务，因此可以在身份存储打开、服务发布之前审计必需消费者。

[查看依据：用户批复先定位贴纸等待 Bridge 服务的问题](history-event:EVT-92d8c3ace9257abf7c33)

判断方法不是猜依赖图，而是读 Loader 的等待范围，并把「必需初始化是否在正式入口的返回路径上」当作检查项。修复即把端口等待、身份存储、服务发布纳入异步 `apply` 的返回，初始化失败也沿正式入口上报。

[查看依据：核对 DSH 只等待正式入口的初始化](history-event:EVT-dc8807f537cd47133f9b)

[查看依据：修复后回归、正式安装与贴纸运行状态](history-event:EVT-ab307af18221feac4a49)

同向线索（贴纸此前确实接入过 Maintenance 业务页，而本次安装没有 Maintenance 包）不能当成已证实的因果。把可选协作者缺席当作根因会得到错误的修复方向：改依赖声明或启用 Maintenance 都不会让服务更早发布。
