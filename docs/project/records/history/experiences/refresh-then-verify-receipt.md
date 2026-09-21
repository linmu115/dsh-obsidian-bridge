---
{
  "id": "EXP-refresh-then-verify-receipt",
  "kind": "experience",
  "task_id": "HIST-2026-09-20-independent-bridge-release",
  "title": "引用仍 queued 时先请用户刷新，再核验接收回执",
  "date": "2026-09-20",
  "status": "current",
  "categories": [
    "verification",
    "human-correction"
  ],
  "results": [
    "pending",
    "passed"
  ],
  "modules": [
    "MOD-reference-client"
  ],
  "summary": "修复已安装但引用仍是 queued，因为 Obsidian 内嵌 Web Viewer 未刷新；当时未把「已修复」当作「已接收」，而是请用户刷新后核验 claimed 与同步回执。",
  "outcome": "用户刷新 Obsidian 内 DSH 网页后引用气泡出现、会话测试正常，同一 referenceId 核验为 claimed 并有同步回执。",
  "applicability": "Bridge 0.4.1-rc2.7 安装于独立实例后；引用待接收队列不因升级而清空，旧页面仍运行升级前的客户端代码。",
  "coverage_note": "2026-09-21 由本次地图维护任务根据 host 会话第 6029–7262 行的公开事件与现场记录整理。刷新前最后状态为 queued，属过程状态而非当前阻断。",
  "related_records": [
    "IMP-native-reference-receive-20260920"
  ]
}
---

# 引用仍 queued 时先请用户刷新，再核验接收回执

安装修复后的 Bridge 并重启实例并不等于浏览器已经在运行新客户端代码。Obsidian 里的 DSH 页面是内嵌 Web Viewer，不在当时受控浏览器的范围内；受控窗口刷新成功不能代表内嵌页面也刷新了。

本例中该引用在修复安装后仍为 queued、没有 claim 或已发送回执。此时正确的动作是明确说出「待接收队列不因升级删除，请刷新 Obsidian 内的 DSH 网页」，而不是宣布修复已完成或让引用改由另一个浏览器窗口领取；也不自动创建或选择目标会话。

[查看依据：用户报告引用未在会话中出现，队列仍 queued](history-event:EVT-e02aee128b75313258ce)

[查看依据：用户重新引用后的过程状态](history-event:EVT-1b0eb7e08f4d7c0d5280)

用户刷新后反馈「已经出现，会话测试也正常」，随后只读核验同一 referenceId 由 queued 转为 claimed、存在同步回执、等待接收数量为 0。

[查看依据：用户确认与随后的接收、同步状态核验](history-event:EVT-6383eacac06a87b7ccd2)

经验是分开两类证据：用户看到的气泡和会话效果属于用户实际验收，队列状态与回执属于随后只读核验。二者都齐了才说这条引用已接收；测试通过只能支持测试检查过的行为。
