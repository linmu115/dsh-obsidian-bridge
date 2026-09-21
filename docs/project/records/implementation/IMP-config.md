---
{
  "id": "IMP-config",
  "kind": "implementation",
  "title": "独立 Bridge 安装与维护入口",
  "status": "current",
  "summary": "当前维护包为 `dsh-obsidian-bridge`，本次文档对应源码版本 0.4.1-rc2.3。安装时只启用一个 Bridge 节点，Core 和普通 Sticker 独立配置，普通 Sticker 另需 Better Sidebar。",
  "aliases": [],
  "relations": [],
  "sources": [
    {
      "path": "../../README.md",
      "role": "current-maintenance-authority"
    },
    {
      "path": "../../package.json",
      "role": "current-maintenance-authority"
    }
  ]
}
---

# 独立 Bridge 安装与维护入口

当前维护包为 `dsh-obsidian-bridge`，本次文档对应源码版本 0.4.1-rc2.3。安装时只启用一个 Bridge 节点，Core 和普通 Sticker 独立配置，普通 Sticker 另需 Better Sidebar。

旧 Suite、Lifecycle、Reference Adapter 和独立 Protocol 均不再作为安装项。升级沿用稳定实例 ID、profile、存储目录和 Obsidian data.json，不以重建身份完成迁移。`obsidianBridgeLifecycle` 服务键仅为兼容，不表示另一个插件。

Core + Bridge 支持跨 Obsidian 引用；普通贴纸及笔记关联归 Sticker，双端连接、来源传递和定位归 Bridge。绑定集中管理见 [[INT-maintenance-offline-binding]]；操作 skill 与官方 CLI 工具见 [[IMP-obsidian-cli]]。

完整配置与开发命令见 [README](../../../../README.md)。本文只整理文档入口，没有部署或修改真实实例配置。
