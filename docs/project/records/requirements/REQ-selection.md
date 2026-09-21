---
{
  "id": "REQ-selection",
  "kind": "requirement",
  "title": "从笔记选段进入真实会话",
  "status": "current",
  "summary": "选段等待认领，进入气泡后由用户随问题发送，保留已有草稿。",
  "aliases": [
    "REQ-note-delivery"
  ],
  "relations": [],
  "sources": [
    {
      "path": "../../../../worktrees/session-context-graph-20260913/dsh-obsidian-session-reference-suite/README.md",
      "role": "confirmed-requirement-source",
      "heading": "笔记选段引用"
    }
  ]
}
---

### 笔记选段引用



在 Obsidian 的内嵌 DSH Web Viewer 打开目标会话，在笔记选取文字并点击 **引用到 DSH**。选段经过“等待接收 → DSH 已领取 → 随提问提交”的流程；目标输入框出现引用气泡后，由用户检查并发送，原草稿不会被替换。



新引用只允许该 Vault 配置的内嵌页面领取。稳定页面身份在登录重定向后仍保留，领取也校验实例；同一实例的独立 DSH 窗口不会抢走投递。尚未打开目标内嵌会话时，待处理引用保留，恢复连接后继续处理。
