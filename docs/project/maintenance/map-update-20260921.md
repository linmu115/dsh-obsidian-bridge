# 2026-09-21 地图更新记录

来源：本任务用户要求「更新既有项目地图」，工作语言中文，范围限定 Bridge 项目自身地图（project_id `e3d24f03-71bb-40ee-a66f-90e50d01f6e7`），不改代码、不提交 Git、不更新其它项目地图。

## 本次核对的事实基础

- 仓库工作树：分支 `codex/independent-plugins-20260920`，HEAD `9d21bf1`（2026-09-21）。工作区唯一未提交改动是 `docs/INSTALL.md` 的 Core/DAG 版本号，与本轮桥改动无关。
- 本批桥版本链：`package.json` 只在提交 `5280e1a` 从 `0.4.1-rc2.3` 跳到 `0.4.1-rc2.8`；`0.4.1-rc2.5`、`.6`、`.7` 没有对应提交，只作为发行包与文档存在（`docs/changes/2026-09-20-*.md`、证据目录 `candidate-r10`（.6）、`candidate-r11`/`r12`（.7）、`independent-preview-r13`（.8，BUILD-INFO 记录 `sourceCommit 4e8de6e`、`sourceDirty true`）。
- 源码对照：`src/index.ts` 的异步 `apply` 与 `getBridgeConfig`、`src/reference/client.ts` 的能力缺席分支、`src/binding-settings.tsx` 的设置槽注册、`src/operation-tools.ts` 的可选 CLI 工具，以及 `tests/host-startup.test.ts`、`tests/client-receiver.test.ts`、`tests/binding-settings.test.ts`。
- 过程来源：host 会话 `01a0ba33-257e-7f01-8f17-c89c31ff0cef` 第 6029–7262 行的公开事件已按范围导入为 [历程索引](../../history/2026-09-20-independent-bridge-release/capture.json)（361 个公开事件，2026-09-20 20:04–22:29 本地时间）；叙述正文在 `records/history/`，发布索引在 `views/history/`。

## 本次写入

- 新增 [[VER-rc28-install-and-acceptance-20260920]]：把「当前要求、实现进度、实际验证范围」分开，列出已验收与未验收项。
- 新增 [[HIST-2026-09-20-independent-bridge-release]] 与两条经验（[[EXP-loader-entry-waits-required-init]]、[[EXP-refresh-then-verify-receipt]]）。
- 更新 4 条实现记录、2 条接口记录、2 个模块说明、1 条依赖说明与 1 条集成说明，使版本、入口与可选能力描述与当前源码一致。
- 归档 [[INT-suite-extension-pages]]：其描述的 Maintenance 业务扩展页注册在当前源码中已不存在。
- `history-drafts/` 四份草稿保留原文，只在开头加一行指向正式历程的说明；配置中的事件来源改为已导入的正式索引。

## 未做与边界

- 未修改任何代码、未提交 Git、未部署或改绑实例。
- 未验收贴纸业务、回链跳转、Maintenance 同步与其他插件；这些在记录中明确标为未覆盖。
- 早前的 `history-drafts/` 草稿保留原样（未物理删除）；本批正式历程已改用可展开的来源索引，草稿不再作为主要入口。
- 额外证据目录 `D:\AI\DeepSeekHarness-Plugin\artifacts\architecture-upgrade-20260920\` 不是 Git 工作树，不能登记为地图工作区（工作区必须显式绑定 Git 根）；它只作为记录正文里的文字定位，安装包指纹仍引用该目录的 `independent-preview-r13/BUILD-INFO.json`，需要时可人工打开核对。
- 本次顺带修正了多条记录中指向 `docs/` 文档的来源路径（原写法解析到仓库外的同名目录，读取时显示 missing）。改为按 `source` 工作区相对路径声明后，读取回执全部 `exists`。
