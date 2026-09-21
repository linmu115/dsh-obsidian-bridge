---
{
  "id": "REQ-delete",
  "kind": "requirement",
  "title": "取消、删除与数据归属",
  "status": "current",
  "summary": "只清理对应引用和受拥有权保护的标记，不删除笔记或真实会话。",
  "aliases": [],
  "relations": [],
  "sources": [
    {
      "path": "../../../../worktrees/session-context-graph-20260913/dsh-obsidian-session-reference-suite/README.md",
      "role": "confirmed-requirement-source",
      "heading": "删除与数据归属"
    }
  ]
}
---

## 删除与数据归属



从 DSH 删除待发送气泡会取消其待处理引用；删除已提交引用会清理对应回链。在 Obsidian 删除“DSH 引用”时，本地关系先解除，Core 端的对应注释/引用通过持久删除记录继续同步，失败可重试。解除关联只删除该关系，不删除会话或笔记正文。



同一个笔记位置可以被多个引用、回链、会话关联或尚未确认的选段共同使用。只有最后一个有效使用方解除后，Companion 才清理它自己创建并记录归属的 `dsh-note-*` 块标记。用户已有块 ID 不清理；定位不唯一或写入失败时保留清理记录等待重试。移除一个笔记中的“DSH 贴纸”回链只解除该处关系，不删除贴纸本体或其它笔记中的回链。



在当前 Maintenance 集成流程中，**已托管会话、普通贴纸、知识链接与图结构由 Maintenance 通过对应业务 Adapter 维护，Vault 继续管理笔记正文**。Companion 保存笔记身份、链接回执、待处理操作和标记归属；Core 管理当前引用事务。这些记录服务于定位和同步，不是第二套完整会话备份。旧伴生格式有独立迁移流程，不能通过删本地文件或重建标记强制完成迁移。
