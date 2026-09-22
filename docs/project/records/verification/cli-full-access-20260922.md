---
id: VER-cli-full-access
kind: verification
title: CLI 权限增强验证范围（2026-09-22）
status: current
sources:
- workspace_id: source
  path: tests/obsidian-cli.test.ts
- workspace_id: source
  path: tests/cli-files.test.ts
- workspace_id: source
  path: tests/published-package.test.ts
relations:
- relation: verifies
  to:
    record_id: IMP-cli-full-access
---

# 检查对象与结果

对象：dsh-obsidian-bridge 0.4.1-rc2.9，DSH 0.1.5-rc.2 合同。

- TypeScript 无输出类型检查通过；Protocol 与 Bridge 构建通过。
- 全套 30 文件、191 项测试通过，包含命令开放、必需请求身份、隐藏路径/链接越界、未知结果不重放、临时目录里的配置文件读写/分页/部署/删除、任意异步 eval 源码保持，以及不安装 Core/Sticker/Maintenance 的独立加载和公开类型检查。
- 首次全测为 190 通过、1 失败：既有跨仓库测试默认指向旧 Companion 检出，缺少 binding/provider.ts。使用测试已有的 DSH_OBSIDIAN_COMPANION_SOURCE 指向当前工作树后，全测通过；没有修改 Companion 或放宽断言。这只是测试源码位置，不是新增产品依赖。
- 真实官方 CLI 只读验证：显式原生 Vault ID 与实际路径匹配；生成的 config:dir/fs:stat 可返回真实配置目录及 folder 类型；编码后的任意异步 eval 能读取 app 并保持中文与换行。另用无写入的抛错表达式确认 CLI 返回 Error 前缀。
- 实际 tgz 解包后的独立 Host/Client、公共类型及导出检查 2/2 通过，未安装 Core/Sticker/Maintenance 或旧桥拆分包。包共 37 文件，运行清单无 link/file/workspace 依赖，去除开发依赖、源码映射与作者路径。首个候选的 files 清单展开方式与既有包合同不一致，改为保留 dist 目录声明后通过，未放宽断言。
- 项目地图结构校验通过；架构图确定性校验通过并保留 3 项既有布局警告，未进行图形视觉验收。

未做：真实 Vault 写入、插件安装/启停/卸载、用户实例升级、LLM 完整调用、UI。临时目录与模拟 Adapter 验证不等于实机写入验收。
