---
{
  "id": "IMP-recovery",
  "kind": "implementation",
  "title": "连接异常怎样处理",
  "status": "current",
  "summary": "离线保留待处理资料；显式重试与冲突处理，不把不在线等同删除。",
  "aliases": [],
  "relations": [],
  "sources": [
    {
      "path": "../../../../worktrees/session-context-graph-20260913/dsh-obsidian-session-reference-suite/README.md",
      "role": "pre-migration-source",
      "heading": "连接恢复"
    }
  ]
}
---

## 连接恢复



DSH 的 Better Sidebar **Obsidian** 面板展示连接、投递及贴纸同步状态，提供针对性的重试。Obsidian 的 **DeepHarness Bridge** 设置展示待处理引用与写回状态，可打开笔记、重试或取消。Sticker 冲突需要在相应编辑器中选择保留哪一侧。



Bridge 离线时，Core 与贴纸模块仍保留已保存的本地工作；外部连接只在 READY/DEGRADED 时挂载。迁入 Maintenance 的结构编辑仍需要其后端能力，不能把“Bridge 离线可恢复”理解为可以绕过真源写入。
