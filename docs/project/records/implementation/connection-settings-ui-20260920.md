---
{
  "id": "IMP-connection-settings-ui-20260920",
  "kind": "implementation",
  "title": "连接设置面板样式",
  "status": "current",
  "progress": "implemented",
  "summary": "0.4.1-rc2.5 组件样式随 client bundle 提供，继承宿主主题，技术详情折叠；该修复包含在本批 0.4.1-rc2.8。真实安装后浅深色和无引擎断开重连通过。",
  "sources": [
    {
      "path": "src/binding-settings.tsx",
      "role": "current-implementation",
      "workspace_id": "source",
      "reviewed_sha256": "f485c61e3d577d6c604505b361f72598fac474607809c9540d6732d876ed2f0a",
      "reviewed_dependencies": [
        {
          "path": "src/api.ts",
          "sha256": "f2576b9906d43b9c10a32a6df2cfc3642872c48e492ca32ae448139343e33f89"
        },
        {
          "path": "src/binding-settings-style.ts",
          "sha256": "34d5e3afd8b48b74d855a53c24bfd3e574278901ab5bfa1b15f808038618ea96"
        }
      ]
    },
    {
      "path": "src/binding-settings-style.ts",
      "role": "current-implementation",
      "workspace_id": "source",
      "reviewed_sha256": "34d5e3afd8b48b74d855a53c24bfd3e574278901ab5bfa1b15f808038618ea96",
      "reviewed_dependencies": []
    },
    {
      "workspace_id": "source",
      "path": "docs/changes/2026-09-20-connection-settings-ui.md",
      "role": "change-report",
      "reviewed_sha256": "e7b51cc3d49e5d11ef9e56abd9e490a1460c5806cc6f5d8b58bcafec2c5c488b",
      "reviewed_dependencies": []
    }
  ],
  "relations": [
    {
      "relation": "related",
      "to": {
        "record_id": "VER-rc28-install-and-acceptance-20260920"
      },
      "reason": "样式复核的回执位置"
    }
  ],
  "source_review": {
    "reviewed_at": "2026-09-21T07:36:55.897752+00:00",
    "reason": "对照 src/binding-settings.tsx 与 src/binding-settings-style.ts 的作用域样式实现",
    "body_sha256": "e3dea7be92eabba82d1146116e727e6c69faeff107a725820220950045230ea6"
  }
}
---

# 连接设置面板样式

实现：src/binding-settings.tsx、src/binding-settings-style.ts。详见 [docs/changes/2026-09-20-connection-settings-ui.md](../../../../docs/changes/2026-09-20-connection-settings-ui.md)。

样式随 client bundle 内嵌并限定在 `.dsh-bridge-settings` 作用域，使用宿主字体与当前颜色（`color-mix(in srgb, currentColor …)`），不加载额外 CSS 资源、不依赖 Maintenance 主题。窄面板用容器查询换行。

真实安装后浅色/深色复核通过、491px 宽度无横向溢出；引擎关闭且 Maintenance 包已移除时，设置页断开 testvault 再连接成功。仅说明 UI 修复，不替代独立业务验收；后续贴纸启动阻断由 Bridge 初始化时序修复解决，见 [[IMP-required-consumer-startup-20260920]]。
