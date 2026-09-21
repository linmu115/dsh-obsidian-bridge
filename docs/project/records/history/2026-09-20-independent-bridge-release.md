---
{
  "id": "HIST-2026-09-20-independent-bridge-release",
  "kind": "history",
  "title": "独立实例桥启动阻断与本地引用接收修复",
  "date": "2026-09-20",
  "status": "current",
  "modules": [
    "MOD-lifecycle",
    "MOD-reference-client"
  ],
  "outcome": "Bridge 0.4.1-rc2.6 修复必需初始化时序、0.4.1-rc2.7 修复缺席解析接口请求；贴纸恢复运行中，testvault 真实引用经用户刷新后验收通过并核验 claimed 与同步回执",
  "applicability": "DSH 0.1.5-rc.2 / web 独立测试实例；Core 0.3.12-rc2.21、ThoughtDAG 0.4.14-rc2.17、Bridge 0.4.1-rc2.6→0.4.1-rc2.7、Sticker 0.7.4-rc2.6、Companion 0.7.0-rc2.5；Maintenance 引擎与接入包均未安装。",
  "coverage_note": "2026-09-21 由本次地图维护任务整理。覆盖 host 会话 01a0ba33-257e-7f01-8f17-c89c31ff0cef 第 6029–7262 行（2026-09-20 20:04–22:29 本地时间）的公开事件，即「继续解决贴纸等待 Bridge 服务」起至本任务结束。安装包指纹与部署回执另见同批 artifacts 目录，未收入本索引。",
  "history": {
    "path": "history/2026-09-20-independent-bridge-release",
    "sha256": "c254554d69414f31a81ee24b1028ed4c6d8f22eaa8bd2af84809942ca2871568",
    "capture_sha256": "93f71b86b10e93d45ea7897cbb974cd882d77f71af61841c120f4b6eb8ceab76"
  },
  "related_records": [
    "IMP-required-consumer-startup-20260920",
    "IMP-native-reference-receive-20260920",
    "IMP-connection-settings-ui-20260920",
    "IMP-independent-components-20260920",
    "VER-rc28-install-and-acceptance-20260920"
  ]
}
---

# 独立实例桥启动阻断与本地引用接收修复

本任务从用户批复「下一步应先定位贴纸等待 Bridge 服务的问题」并批注「继续解决这个问题」开始，属于 2026-09-20 独立插件批次（0.4.1-rc2.4 至 0.4.1-rc2.8）的后半段。此前本批已修好 Obsidian 连接设置的宿主样式，但在那次安装后普通贴纸一直无法加载。

[查看依据：用户批复定位贴纸等待 Bridge 服务的问题](history-event:EVT-92d8c3ace9257abf7c33)

## 第一处转折：先怀疑 Maintenance 耦合，核对后改为 Bridge 初始化时序

当时的表象是插件列表给出 `dsh-session-sticker-board: pending (waiting for service: obsidianBridgeLifecycle)`。这一表象最容易被解释成「贴纸仍然依赖缺席的 Maintenance 桥」，因为贴纸此前确实通过 Bridge 接入过 Maintenance 业务页，而本次安装刻意没有 Maintenance 接入包，维护实例的 42831 端口没有监听。

排查没有停在耦合假设上。读取 DSH Loader 的等待范围后发现：Loader 只等待配置树中插件正式入口的任务；旧 Bridge 的正式入口立即返回（同步 `apply` 只做一次 `ctx.inject`），端口等待与身份存储打开都发生在内部 inject 纤维里，因此 Loader 可以在 `obsidianBridgeLifecycle` 发布之前就审计必需消费者，把贴纸判为 pending。也就是说，问题在 Bridge 的初始化时序，而不在 Maintenance 依赖。

修复把必需初始化（Web 端口等待、持久身份存储、服务发布）直接作为正式异步 `apply` 返回，并让初始化失败归入 Bridge 自己的启动错误；保留了贴纸对 `obsidianBridgeLifecycle` 的必需依赖，也未添加固定启动延时、未启用 Maintenance。真实 Cordis 回归先复现「入口提前完成」，再验证服务发布后必需消费者激活、身份存储失败传递到正式入口。

[查看依据：核对 DSH 只等待正式入口的初始化](history-event:EVT-dc8807f537cd47133f9b)

[查看依据：修复后回归、正式安装与贴纸运行状态](history-event:EVT-ab307af18221feac4a49)

[查看依据：本项修复的交付说明与未验收范围](history-event:EVT-d94fa5bd88a789db2781)

0.4.1-rc2.6 以 `candidate-r10` 包正式安装，贴纸 0.7.4-rc2.6 重新安装；新独立实例在 19876 正常运行、stderr 为空，原 pending 错误消失，testvault 仍显示已连接。**这一步只验收了「贴纸能启动」，没有验收贴纸业务。** 贴纸创建/持久化、回链跳转以及模型引用是否可用都不在本条证据范围内，本批的发布验证记录同样把「全部贴纸编辑/删除/回链」列为未做端到端验收。

## 第二处转折：引用一直 queued，先请用户刷新再核验

随后用户报告真实使用故障：在 testvault 里引用一段话后，Obsidian 侧出现引用气泡并打开了 WebUI，但 DSH 会话里没有出现引用气泡。

[查看依据：用户报告 testvault 引用未在会话中出现](history-event:EVT-e02aee128b75313258ce)

只读现场核验确认：Companion 内存与持久队列中该引用为 queued，1 条等待接收，没有 claim 或已发送回执；对未注册的 `/dsh-session-maintenance/api` 做只读解析 POST 返回 405，而旧客户端代码只在 404 时认为「该接口不存在」，于是本地引用接收路径也去请求这个缺席的解析接口并抛错。同时明确了两个不能当结论的线索：「新会话」标题不能证明没有会话 ID；Companion 内存 manifest 自报 0.7.0-rc2.4、磁盘 manifest 为 0.7.0-rc2.5，仅凭版本差异不能证明实际运行代码来自旧版。

修复是让宿主在 Bridge 配置里明确声明可选会话解析服务是否存在；能力缺席时本地引用直接使用当前 native 会话，不再探测 Maintenance 接口；已安装解析器报错时不降级，携带逻辑会话身份的历史目标在缺少解析能力时明确报错，不猜测本地映射。

纠正发生在验收环节：0.4.1-rc2.7 安装并重启实例后，Codex 内置浏览器刷新正常，但 Obsidian 内嵌的 Web Viewer 不在该浏览器控制范围内，**当时该引用仍然是 queued**。此时没有把「已修复」当成「已接收」，而是请用户刷新 Obsidian 内的 DSH 网页再核验。

[查看依据：用户重新引用并反馈已出现、会话测试正常](history-event:EVT-1b0eb7e08f4d7c0d5280)

[查看依据：用户反馈「已经出现，会话测试也正常」](history-event:EVT-6383eacac06a87b7ccd2)

用户刷新后明确反馈「已经出现，会话测试也正常」。随后只读核验同一 referenceId 已由 queued 转为 claimed，目标为 `session-42d8db90-8f56-49bd-bf57-c0c64d8f8e11` / `set-8419b6ab-9aca-4c01-9131-771a01cf9bd8`，并存在对应 backlink receipt；Companion 汇总为 0 条等待接收、1 条已同步。气泡与会话效果来自用户实际验收，接收与同步状态来自随后只读核验。

[查看依据：用户确认后的接收与同步状态核验](history-event:EVT-c20994c86c93578c4f84)

## 保留边界

- 本任务只验收了两条路径：桥的必需初始化能按 Loader 的等待范围完成，以及无引擎本地引用能接收并同步这一条真实引用。
- 未验收：其他桥业务、回链跳转、Maintenance 同步、贴纸增删持久化，以及「所有插件已独立验收」。
- 贴纸能独立运行，不等于源码中引用的可选 Maintenance 接口因此成为硬依赖；同样，独立运行也不能反推这些可选接入已被移除。
- 同一 host 会话在 2026-09-20 22:52 之后转向 DAG 所属卡片与实例重启，不属于本记录范围。
