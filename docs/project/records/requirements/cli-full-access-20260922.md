---
id: REQ-cli-full-access
kind: requirement
title: LLM 经桥操作配置目录、插件与任意 JavaScript
status: current
progress: implemented
---

# 已确认范围（2026-09-22）

用户在本任务的两项批注中明确开放任意 JavaScript，以及插件代码写入、部署和启用；随后要求实施、不耦合其他插件、更新版本、打包并推送。

- 现有桥提供 `.obsidian` 等 Vault 内文件的读取、创建、覆盖、追加、目录与删除操作；普通笔记命令继续保留。
- 开放官方 CLI 的 eval 和插件安装、卸载、启用、停用、重载，不新增 Core、Maintenance、Sticker、Codex Runtime 依赖。
- 保留绑定 Vault 定位、实际路径核验、宿主工具策略与持久请求回执；不新增逐文件授权流程。
- eval 是 Obsidian 进程中的任意脚本执行，不宣称其受文件工具的 Vault 路径校验隔离。全部 eval 请求按可能写入处理。
- 本轮交付为代码、文档、版本包和远端发布；不替换真实实例或 Vault 已安装插件，不改变绑定和同步范围。UI 与真实模型端到端另行验收。

实现见 [[IMP-cli-full-access]]，验证见 [[VER-cli-full-access]]。
