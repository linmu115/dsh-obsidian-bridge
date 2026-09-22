---
id: IMP-portable-build-20260922
kind: implementation
title: 独立构建与 RC2 运行环境
status: current
summary: 固定 SDK 与工具链，消除隐含作者工作树依赖，统一标明 DSH 0.1.5-rc.2。
---

独立测试 177 项、Protocol 测试 13 项、Companion HTTP 集成测试 1 项通过；针对实际运行 tgz 的 2 项安装和类型测试通过（包含在独立测试范围内）。类型检查、构建和打包通过。Core optional peer 对齐 0.3.12-rc2.28；新增 CLI 首次设置和只读排查教程。版本 0.4.1-rc2.10。

完整实施、验证及本次过程草稿见 [独立构建记录](../../../changes/2026-09-22-portable-build.md)。真实实例未升级，UI 未验收。
