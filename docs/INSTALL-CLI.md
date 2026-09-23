# 独立安装 CLI 权限增强

版本：dsh-obsidian-bridge 0.4.1-rc2.11，适用 DSH 0.1.5-rc.2 / web、Node.js 24。

仅升级 DSH 侧 Bridge；沿用已有 Obsidian 侧桥的绑定/身份接口。CLI 操作不需要 Annotation Core、Maintenance、Sticker、Codex 或 Launcher。完整引用业务才需要 Core。

1. 从本版 GitHub Release 下载 tgz 和 SHA256SUMS.txt 并核验哈希。
2. 正常停止目标 DSH，备份它的 DSH_HOME/profile 配置及插件状态。
3. 在原来的 DSH_HOME 和 profile 执行：

```powershell
$env:DSH_HOME = '<你的 DSH_HOME>'
dsh plugin --profile web add ./dsh-obsidian-bridge-0.4.1-rc2.11.tgz
```

4. 通过原来的正式方式启动实例；不要重复手工注册 bundle。刷新相关页面。
5. 确认桌面 Obsidian CLI 已启用；桥可配置 obsidianCliPath 原生可执行文件路径。
6. 在 DSH 设置的 Obsidian 连接页核对绑定目标。让模型读 dsh_obsidian_guide、列 dsh_obsidian_targets，再使用 dsh_obsidian_cli。

新命令和部署步骤见 [CLI 操作](cli-operations.md)。eval 和插件代码执行具有 Obsidian 进程权限；只在任务授权范围操作。

本次发布不等于用户实例已升级。UI、真实写入与模型端到端验收范围见 [验证记录](RELEASE-20260922.md)。更新前后保留其他插件、绑定、同步范围和用户数据。

## 首次启用与只读验证

当前运行环境：**DSH 0.1.5-rc.2 实例 / web profile**。Obsidian 建议桌面版 1.13.7 及以上；仅升级应用而没有更新安装器时，CLI 入口可能仍缺失。

1. 在 Obsidian 的 **设置 → 通用 → 命令行界面（Command line interface）** 开启 CLI，并按提示完成注册。保持目标 Vault 已打开。[官方设置说明](https://help.obsidian.md/cli)。
2. 新开终端，执行 `obsidian version`。应返回应用与安装器版本；找不到命令时先核对注册与 PATH。这个步骤只检查本机 CLI，没有证明 Bridge 已经能调用它。
3. 在 DSH 的插件参数页找到 `dsh-obsidian-bridge` 的 `obsidianCliPath`。PATH 可用时留空；Windows 可填 `C:\Program Files\Obsidian\Obsidian.com` 或自己的实际安装路径。自定义安装示例：`D:\Apps\Obsidian\Obsidian.com`。要求原生程序的绝对路径，不填 `.cmd` / `.bat` / `.ps1` 包装脚本，也不填带参数的整条命令。
4. 保存参数后按原来的正式方式重新加载 Bridge 或正常重启该 DSH 实例。CLI 在工具服务注册时检测；只刷新浏览器不会让旧 DSH 进程获得新的 PATH。直接启动的实例无需 Launcher。
5. 在 DSH 的“Obsidian 连接”核对目标 Vault 已连接，让模型先读取 `dsh_obsidian_guide`，再调用 `dsh_obsidian_targets`。核对返回的是任务指定的 Vault；不要从名称猜测 vaultId。
6. 使用返回的 vaultId 调用 `dsh_obsidian_cli`，参数如下。这是模型工具调用对象，不是终端命令：

```json
{
  "vaultId": "<targets 返回的 vaultId>",
  "command": "config:dir",
  "parameters": {}
}
```

预期返回该 Vault 的真实配置目录，例如 `.obsidian`。随后可用 `fs:stat` 检查返回目录（`parameters: {"path":".obsidian"}`，有自定义目录时替换它）。这两步不修改配置，不需要写操作的 requestId。普通 CLI 安装成功、模型工具出现、绑定目标正确、实际只读调用成功是四项不同检查。

## 工具没有出现或调用失败

| 现象 | 检查与处理 |
|---|---|
| 终端找不到 obsidian | 检查 Obsidian 设置中的 CLI 注册、安装器和新终端 PATH；也可使用原生程序完整路径运行 version |
| 有 guide/targets，没有 dsh_obsidian_cli | Bridge 未找到可执行文件；检查 obsidianCliPath 或 DSH 进程 PATH，然后重新加载 Bridge |
| 三个工具都没有 | 检查当前 profile 是否加载 Bridge，以及 DSH tools 服务与会话工具策略是否允许这些工具 |
| targets 没有目标库 | 检查 Obsidian 中目标库是否打开、Companion 是否启用、两端绑定是否连接；无需安装 Maintenance |
| version 成功但工具调用失败 | 检查 Obsidian 内 CLI 是否启用，以及该 Vault 的绑定和实时身份；不要把终端版本输出当作跨端调用成功 |
| 写入回执为 unconfirmed | 操作可能已经执行；先读取目标核对，不生成新 requestId 盲目重发 |

完成上述只读步骤说明 CLI 与绑定路径可用，不代表插件部署、文件写入和真实 UI 效果已经验收。
