# CLI 权限增强过程（2026-09-22）

来源：本 Codex 任务。用户对任意 JavaScript 标注“可以开放”，对插件代码写入、部署并启用标注“都开放”，随后要求独立实现、升版本、打包推送。未建立宿主事件索引，本文为有来源说明的过程草稿，不伪造 history-event。

核查发现现有 CLI 拒绝隐藏路径，插件只查/重载。采用既有绑定与回执服务，开放 eval 和插件生命周期，并用官方 CLI eval 执行固定 Adapter 文件操作。新业务不触及 Core、Maintenance 或 Companion 源码。

首轮 48 项相关测试通过；整包测试首次 190/191，失败是旧 Companion 检出缺少测试源码。配置测试已有的源码路径变量后 191/191 通过。备份并重新生成 dist，避免 clean:false 混入旧块；真实 CLI 只做路径、配置目录、接口及编码异步脚本的只读验证。用户 Vault 和运行实例未改。

保留任务开始前的 docs/INSTALL.md 修改与 views/index.preview.json 删除；发布使用本次独立安装文档，不把无关未提交改动带进包。相关记录：REQ-cli-full-access、IMP-cli-full-access、VER-cli-full-access。

实际 tgz 测试首次发现新打包脚本把 files 全展开，与既有 dist 清单合同不一致；保留原目录声明后 2/2 通过，未修改业务断言。新增桥单包打包入口，避免为了发布 CLI 功能要求其他插件源码。地图及架构图更新，阅读页重新导出。版本 0.4.1-rc2.9；远端发布结果以 Git tag/Release 为准。
