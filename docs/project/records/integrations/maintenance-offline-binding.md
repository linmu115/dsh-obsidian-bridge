---
id: INT-maintenance-offline-binding
kind: integration
title: Maintenance 独立管理 Vault 绑定
status: current
relations:
  - relation: depends_on
    to:
      project_id: 0d05f813-7097-47d9-9e88-3d523bb537d6
      record_id: IF-offline-vault-binding
    reason: Maintenance维护独立绑定授权合同，Obsidian桥负责唯一持久写入。
  - relation: derived_from
    to:
      project_id: 0d05f813-7097-47d9-9e88-3d523bb537d6
      record_id: HIST-offline-vault-binding
    reason: 本次安装与推送收尾来源及验收边界。
---

Maintenance Engine .45 / Dashboard .1.7 提供已登记实例列表、绑定卡片、逐行解绑和本机文件夹选择。DSH 无需运行；Obsidian Vault 仍须在线并启用兼容 Companion .4。授权、CAS、幂等及路径证明合同仅在提供方 Session Maintenance 项目维护。

2026-09-19 用户要求核对 CLI 提交、推送并安装。核对本项目 CLI 提交 d3b21f7 已在远端 main；Companion d162f5b 及 Maintenance 新版已安装，CLI 功能无需再次移植或提交。本项目没有功能代码修改。开发过程与公开来源索引沿用上方 HIST-offline-vault-binding，原迁移历史不改写成此次安装记录。

实际只读验证：DSH 停止时现有 Vault 在线且可管理、修订仍为 1；Companion data.json 不变。未执行真实绑定或解绑、笔记写入。实际安装版 UI 及 Windows 文件夹选择视觉未验收。
