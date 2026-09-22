---
{
  "id": "IMP-cli-full-access",
  "kind": "implementation",
  "title": "CLI 配置读写、插件管理与任意脚本（rc2.9）",
  "status": "current",
  "progress": "implemented",
  "sources": [
    {
      "workspace_id": "source",
      "path": "src/obsidian-cli.ts",
      "reviewed_sha256": "7f6bc5bc82558e941ca8407f9528e9f2b3410bfd0a0541408c46983d5093afbf",
      "reviewed_dependencies": [
        {
          "path": "src/api.ts",
          "sha256": "f2576b9906d43b9c10a32a6df2cfc3642872c48e492ca32ae448139343e33f89"
        },
        {
          "path": "src/cli-files.ts",
          "sha256": "36dab90a353362328cc441fab08a766f913a887d2ba96ef15d758a0263ec26d0"
        },
        {
          "path": "src/control-client.ts",
          "sha256": "8c515cee10fe9cf5fd525f77bfef64f60ff402c1dcb6449ee9e8dac181bcb31c"
        },
        {
          "path": "src/vault-folder.ts",
          "sha256": "5c5eac5448475827d5a3f405d2e81fe03902bf1bccc2d64fa35e06f6767910ae"
        }
      ]
    },
    {
      "workspace_id": "source",
      "path": "src/cli-files.ts",
      "reviewed_sha256": "36dab90a353362328cc441fab08a766f913a887d2ba96ef15d758a0263ec26d0",
      "reviewed_dependencies": []
    },
    {
      "workspace_id": "source",
      "path": "src/operation-service.ts",
      "reviewed_sha256": "8f90840b859b000a154279ef0e9346bb394c707715dace56ac153067090a051a",
      "reviewed_dependencies": [
        {
          "path": "src/cli-files.ts",
          "sha256": "36dab90a353362328cc441fab08a766f913a887d2ba96ef15d758a0263ec26d0"
        },
        {
          "path": "src/obsidian-cli.ts",
          "sha256": "7f6bc5bc82558e941ca8407f9528e9f2b3410bfd0a0541408c46983d5093afbf"
        }
      ]
    },
    {
      "workspace_id": "source",
      "path": "src/operation-skill.ts",
      "reviewed_sha256": "aa210bf6109c4f5be8e4f1449602cf4628a521c829dd803d8ec964766d19537a",
      "reviewed_dependencies": []
    }
  ],
  "relations": [
    {
      "relation": "implements",
      "to": {
        "record_id": "REQ-cli-full-access"
      }
    }
  ],
  "source_review": {
    "reviewed_at": "2026-09-22T05:06:07.652718+00:00",
    "reason": "核对 rc2.9 源码、权限语义、编码与回执，191 项测试通过",
    "body_sha256": "9957aede4ff5d1c2ddbe261e5fb7f9388727ce223dd3d60c7efb9976f2b9329a"
  }
}
---

# 当前行为

0.4.1-rc2.9 在既有 dsh_obsidian_cli 增加 config:dir、fs:list/stat/read/write/append/mkdir/remove、plugins:enabled、plugin:install/uninstall/enable/disable 与任意 eval。普通 CLI 笔记、属性、片段和已有插件重载入口保留。

配置文件通过官方 CLI eval 调用 Obsidian 自带 Adapter；源码和文件内容编码后作为数据传输，保留中文、换行和反斜杠。先查 config:dir，支持自定义配置目录；fs:* 路径均相对 Vault。分段读取、写入/追加允许部署大文本插件；二进制和其他 Plugin API 可走用户已明确开放的 eval。

所有 eval 按可能写入处理，要求稳定 requestId；延续绑定/实际路径核验、持久回执和未知结果不重发。eval 与加载的插件代码具有 Obsidian 进程权限，不声称被 Vault 路径校验隔离。停用桥本身或脚本改变绑定可能导致最终回执 unconfirmed，实际动作可能已执行。

本次只修改 DSH 侧桥，不新增其他插件或服务依赖。现有 Obsidian 侧桥负责身份发现与绑定，不需要配套升级。宿主工具策略继续生效，不额外引入逐文件批准或逐 Vault 能力目录。

命令和部署用法：[CLI 操作](../../../cli-operations.md)、[安装](../../../INSTALL-CLI.md)。验证见 [[VER-cli-full-access]]。

本版未安装到用户实例，真实模型写入、插件生命周期与 UI 未验收。写入文件与配置生效需分别检查；不自动备份、JSON 合并或重载。旧 .8 安装记录不升级为本版证据。
