---
{
  "id": "IMP-config",
  "kind": "implementation",
  "title": "独立 Bridge 安装与维护入口",
  "status": "current",
  "progress": "implemented",
  "summary": "当前维护包为 `dsh-obsidian-bridge`，本批交付版本 0.4.1-rc2.8。安装时只启用一个 Bridge 节点，Core 和普通 Sticker 独立配置，连接管理由本插件设置页提供，Maintenance 是可选协作者。",
  "aliases": [],
  "relations": [],
  "sources": [
    {
      "path": "README.md",
      "role": "current-maintenance-authority",
      "workspace_id": "source",
      "reviewed_sha256": "8be22500b1db53f24dabc3ea2babe41a70fda7a4c442f245257ff6217552fcec",
      "reviewed_dependencies": []
    },
    {
      "path": "package.json",
      "role": "current-maintenance-authority",
      "workspace_id": "source",
      "reviewed_sha256": "185c09f5ef652cfb731b0ba6612e126b3fc7ddfdebf64bd995103c1946be71cd",
      "reviewed_dependencies": []
    },
    {
      "workspace_id": "source",
      "path": "docs/INSTALL.md",
      "role": "current-maintenance-authority",
      "reviewed_sha256": "82e24e8a8c03e0a762498c8a03db548737b7d1eeaf3791b235797511b845e95d",
      "reviewed_dependencies": []
    }
  ],
  "source_review": {
    "reviewed_at": "2026-09-21T07:36:43.468331+00:00",
    "reason": "对照当前 package.json 版本 0.4.1-rc2.8、README 与 docs/INSTALL.md 的连接入口描述，安装项与可选 Maintenance 边界仍适用",
    "body_sha256": "e1a81a7cb9eb999560a462fb4c698bb0252aa15656f0b67cf737c340f7c7414b"
  }
}
---

# 独立 Bridge 安装与维护入口

当前维护包为 `dsh-obsidian-bridge`，本批交付版本 `0.4.1-rc2.8`。安装时只启用一个 Bridge 节点，Core 和普通 Sticker 独立配置；普通 Sticker 另需 Better Sidebar。

旧 Suite、Lifecycle、Reference Adapter 和独立 Protocol 均不再作为安装项。升级沿用稳定实例 ID、profile、存储目录和 Obsidian data.json，不以重建身份完成迁移。`obsidianBridgeLifecycle` 服务键仅为兼容，不表示另一个插件。

连接与绑定管理入口**首先是本插件自己的设置页**（DSH 设置 → Obsidian 连接）；Maintenance 侧的集中管理与离线绑定只是可选协作者，缺席时连接、断开与重连照常，见 [[INT-maintenance-offline-binding]]。操作 skill 与官方 CLI 工具为可选增强，见 [[IMP-obsidian-cli]]。

Core + Bridge 支持跨 Obsidian 引用；普通贴纸及笔记关联归 Sticker，双端连接、来源传递和定位归 Bridge。完整配置与开发命令见 [README](../../../../README.md) 与 [INSTALL](../../../../docs/INSTALL.md)。本文只整理文档入口，没有部署或修改真实实例配置。
