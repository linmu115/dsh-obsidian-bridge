# 独立安装 CLI 权限增强

版本：dsh-obsidian-bridge 0.4.1-rc2.9，适用 DSH 0.1.5-rc.2 / web、Node.js 24。

仅升级 DSH 侧 Bridge；沿用已有 Obsidian 侧桥的绑定/身份接口。CLI 操作不需要 Annotation Core、Maintenance、Sticker、Codex 或 Launcher。完整引用业务才需要 Core。

1. 从本版 GitHub Release 下载 tgz 和 SHA256SUMS.txt 并核验哈希。
2. 正常停止目标 DSH，备份它的 DSH_HOME/profile 配置及插件状态。
3. 在原来的 DSH_HOME 和 profile 执行：

```powershell
$env:DSH_HOME = '<你的 DSH_HOME>'
dsh plugin --profile web add ./dsh-obsidian-bridge-0.4.1-rc2.9.tgz
```

4. 通过原来的正式方式启动实例；不要重复手工注册 bundle。刷新相关页面。
5. 确认桌面 Obsidian CLI 已启用；桥可配置 obsidianCliPath 原生可执行文件路径。
6. 在 DSH 设置的 Obsidian 连接页核对绑定目标。让模型读 dsh_obsidian_guide、列 dsh_obsidian_targets，再使用 dsh_obsidian_cli。

新命令和部署步骤见 [CLI 操作](cli-operations.md)。eval 和插件代码执行具有 Obsidian 进程权限；只在任务授权范围操作。

本次发布不等于用户实例已升级。UI、真实写入与模型端到端验收范围见 [验证记录](RELEASE-20260922.md)。更新前后保留其他插件、绑定、同步范围和用户数据。
