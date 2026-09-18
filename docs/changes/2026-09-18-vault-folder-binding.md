# Vault 文件夹选择与正式绑定

日期：2026-09-18。目标源码：`dsh-obsidian-bridge@0.4.1-rc2.2`。仅开发与合成验收；没有部署、启动或停止真实实例，没有修改真实 Vault。

## 用户行为

可选 Maintenance 信息页增加无字段动作「选择文件夹并绑定」。当前宿主打开 Windows .NET FolderBrowserDialog；隐藏辅助 PowerShell 控制台，目录选择窗口可见，不能创建新目录。固定 UTF-16 编码脚本不插入用户路径或业务输入；选择结果作为 JSON 数据读取。取消返回明确回执，60 秒超时或提供方撤销会取消本动作创建的辅助进程，绝不触及 DSH/Obsidian 实例进程。同一提供方只允许一个选择动作。

## 身份与写入范围

1. 仅检查所选根目录的 `.obsidian`、`plugins/obsidian-deepharness-bridge/manifest.json` 的准确插件 ID、`main.js`、`data.json` 的 Vault ID。不递归查找，不安装或启用插件，不直接修改 data.json。
2. 刷新既有 discovery，拒绝离线和重复身份。读取真实在线 identity，再从 Companion 的 `GET /discovery/v1/vault-location` 取得本机路径证明；请求无浏览器 Origin，不跟随重定向，有 3 秒网络期限及 64 KiB 上限。
3. 路径证明的 Vault、publisher、boot、origin 必须与在线 identity 全部相符；双方 realpath 必须相同，防止拷贝目录保留同一 vaultId 时误绑定。再次读取选择目录身份后，正式绑定前复核在线 publisher/boot/origin。
4. 绑定仍由既有 handshake + `/control/v1/binding` 负责，用同一 operationId 和最新 expectedRevision 执行 CAS。已绑定当前 instance/profile 幂等成功；绑定其他实例拒绝，保留显式改绑入口。操作取消会阻止后续写入并取消正在处理的控制请求；已经由远端提交的请求不能回滚，仍以正常绑定回执/刷新结果为准。

路径证明为 Companion 新增只读能力；旧版本缺少端点会明确提示升级，不回退为仅凭 vaultId 绑定。Maintenance 仍为可选注入，未引入依赖。Maintenance provider 独立心跳不会因等待对话框停止；当前 Engine 业务动作无短执行截止，因此无需修改 SM 契约。

## 验证

- TypeScript 类型检查通过。
- host、browser ModuleLoader、全部公开类型构建通过。
- 完整测试：22 文件、122 项通过，包含发布包物理隔离验证、无 Core/SM 独立能力及已有 Bridge 回归。
- 发行包 dry-run 通过：`dsh-obsidian-bridge@0.4.1-rc2.2`，49 项，包含新变更报告及原公开入口；未发布或安装。
- 新增合成覆盖：成功 CAS、取消与 abort、并发选择、非 Vault/缺插件/错插件 ID/缺身份、离线/冲突、复制 Vault 相同 ID、publisher/boot 变化、旧 Companion、超大证明、已绑定幂等、foreign 禁止自动改绑、固定脚本与编码、超时。目录均为临时夹具，对话框注入 fake，网络和绑定使用测试替身。

## 未验收

Windows 真实目录选择框可见性、SM 页面实际布局与点击、真实 Companion 路径证明与跨端绑定、真实实例安装均未验收。本报告不能作为这些操作已通过的依据。
