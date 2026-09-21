---
{
  "id": "REQ-vault-instance-binding",
  "kind": "requirement",
  "title": "Vault 单实例绑定与两组插件独立运行",
  "status": "current",
  "summary": "一 Vault 至多一实例，多 Vault 共用实例同步范围；历史链接保留，动态端口自动重连。",
  "aliases": [],
  "relations": [],
  "sources": [
    {
      "path": "../../../../worktrees/session-context-graph-20260913/dsh-obsidian-session-reference-suite/docs/2026-09-18-vault-instance-binding-design.md",
      "role": "confirmed-requirement-source",
      "heading": "已确认需求"
    },
    {
      "path": "../../../../worktrees/session-context-graph-20260913/dsh-obsidian-session-reference-suite/docs/project/records/history/vault-instance-binding.md",
      "role": "linked-authority"
    }
  ]
}
---

## 已确认需求



| 编号 | 要求 | 验收含义 |

| --- | --- | --- |

| VB01 | 仓库指 Obsidian Vault，实例指 DSH 实例；一个 Vault 至多绑定一个实例，一个实例可以绑定多个 Vault。 | 未绑定是合法状态；同一 Vault 不能同时存在两个有效绑定。 |

| VB02 | 绑定能力属于 Bridge，单独安装 Obsidian–DSH 系列时仍然成立。 | Maintenance 和 Launcher 都不成为基础配对与运行的必需依赖。 |

| VB03 | Obsidian 插件设置页提供当前 Vault 的实例选择和绑定管理；Maintenance 扩展业务页提供实例视角的集中管理。 | 两个入口使用同一绑定接口和修订，不能各自维护可独立覆盖的绑定。 |

| VB04 | Launcher 每次启动可能分配不同 DSH Web 端口，自动连接能力必须保留。 | 绑定稳定实例 ID；同实例重启、换端口及登录信息更新无需重新绑定。 |

| VB05 | 各 Vault 共用绑定实例勾选的全部同步工作区。 | 不增加 Vault 自己的工作区筛选名单；实例 A 与 B 的同步范围可以不同。 |

| VB06 | 工作区取消同步后保留旧链接，提示“当前绑定实例未同步此工作区”。 | 不删除引用、笔记或会话；不自动改绑或切换另一实例；相关会话访问和投递暂停。 |

| VB07 | 重新勾选工作区后按原身份核验并恢复解析。 | 不重建引用；真正删除、未同步、离线和映射未就绪分别表达。 |

| VB08 | 改绑只改变后续操作的目标。 | 历史引用保留原实例、逻辑会话、Vault 及引用身份；历史迁移另走明确维护操作。 |

| VB09 | 两组插件可分别独立安装并正常运行。 | 基础功能不以可选插件存在为启动条件；缺席不产生持续失败重试；已托管数据不恢复旧副本写入。 |

| VB10 | Maintenance 公开扩展业务注册；数据目录只是插件信息页的一个可选栏目。 | Obsidian 系列通过公开接口贡献自己的绑定、状态、数据与同步栏目。 |

| VB11 | 保留后续 DSH → Obsidian 专门操作管道的可扩展性，并提供直接操作权限。 | 复用身份、绑定、路由及请求结果合同；不要求逐 Vault 能力识别、登记或协商。笔记、样式、模板、面板和插件注册功能以后实施。 |



来源：当前 Codex 任务 01a0b244-91e1-7c60-9d88-0b67eed0f0e9。初始要求、八项批注、两个范围选择以及动态端口问题分别可从 [本次设计历程](../../../../../../worktrees/session-context-graph-20260913/dsh-obsidian-session-reference-suite/docs/project/records/history/vault-instance-binding.md) 展开；用户来源与工程建议分开保存。
