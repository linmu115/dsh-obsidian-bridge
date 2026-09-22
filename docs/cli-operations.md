# 绑定 Vault 的 CLI 操作（0.4.1-rc2.10）

DSH Bridge 通过官方 Obsidian CLI 提供笔记、隐藏配置文件、插件生命周期和任意 JavaScript 操作。只使用 DSH 宿主的工具、可选 skills 与持久存储服务，不依赖 Core、Maintenance、Sticker 或 Codex Runtime。现有 Obsidian 侧桥负责绑定和 live 路径证明，无需为这次功能升级。

## 使用入口

Obsidian 需要支持 CLI 的桌面安装器并启用 CLI。DSH 桥配置 obsidianCliPath（原生可执行文件绝对路径）或使用 PATH。未检测到 CLI 时基础桥继续工作，仅提供 guide/targets；不注册可执行 CLI 工具。

先读 dsh_obsidian_guide，再由 dsh_obsidian_targets 选择任务指定的已绑定 vaultId。调用 dsh_obsidian_cli 的字段为 vaultId、command、parameters，以及写操作必需的 requestId。模型不能在 parameters 中另传 Vault 选择器或 CLI 路径。

## 命令

| 命令 | parameters | 行为 |
| --- | --- | --- |
| config:dir | {} | 返回当前 Vault 的真实配置目录，例如 .obsidian；尊重自定义配置目录 |
| fs:list | path 可省略 | 列出精确目录的 files/folders；默认 Vault 根 |
| fs:stat | path | 文件/目录信息，不存在返回 null |
| fs:read | path, offset?, limit? | 返回 content、total、nextOffset；默认 12000、最大 24000 个 UTF-16 字符 |
| fs:write | path, content | 覆盖或新建文本文件；空内容有效，父目录须已存在 |
| fs:append | path, content | 追加精确文本，可分块部署大型插件 |
| fs:mkdir | path | 创建目录及缺少的父目录 |
| fs:remove | path, recursive? | 永久删除；非空目录必须显式 recursive:true |
| plugin:install | id, enable? | 按社区目录 ID 安装，可同时启用 |
| plugin:uninstall | id | 卸载插件 |
| plugin:enable / plugin:disable | id, filter? | 启停，filter 为 core 或 community |
| plugin:reload | id | 重载已部署的插件 |
| plugin / plugins / plugins:enabled | id 或 filter/format/versions | 查询插件与启用状态 |
| eval | code | 任意 JavaScript；可返回 Promise，所有调用均要求 requestId |

已有笔记 read/create/append/prepend/move/rename/delete/open、search/search:context、property:*、templates/template:read、snippets/snippets:enabled/snippet:enable/snippet:disable 保留。以工具枚举和 guide 的实际参数为准。

## 配置与本地插件

使用 config:dir 查询实际目录，再用 fs:* 读写其下的 JSON、CSS、插件 main.js/manifest.json/styles.css。fs:* 通过官方 CLI eval 调用 Obsidian 自带 Adapter，能够处理普通笔记索引之外的隐藏文件；不是另一项插件服务。

修改前备份原配置及目标插件文件，读取当前内容后只改任务涉及的字段。fs:write 整体替换文件，不执行 JSON 合并或自动备份。写入与运行生效分别检查：活跃插件可能重新保存自己的设置，按目标插件需要重载；不要把文件已写入报告为 UI 已生效。

本地插件仍用工程工具编译，再创建配置目录下 plugins/<id> 并写入所需文件。新插件调用 plugin:enable，已加载插件调用 plugin:reload。plugin:install 接受社区目录 ID，不接受本地源码目录。大文本采用约 4000 字符的精确分块，首块 fs:write，后续 fs:append，每块稳定且独立的 requestId；未知结果时先读回文件核对，不生成新 ID 盲目重发。传输对字符串长度和编码后的命令长度有限制，超限会在派发前报错。二进制资源可按任务使用 eval 的 Adapter 二进制 API。

## 任意脚本与授权边界

eval 按用户本次明确要求开放，具有 Obsidian 进程权限，可以调用 Plugin API；任意脚本及加载的插件代码不受 fs:* 路径检查隔离，不宣称为 Vault 沙箱。固定入口仍定位已绑定 Vault，不新增逐文件确认或逐 Vault 能力协商；宿主工具策略继续有效。

脚本源码和 fs 内容按 UTF-8/base64 传输，避免 CLI 参数解释破坏中文、换行及反斜杠。普通笔记命令仍沿用官方 CLI 文本约定。不把 Obsidian 内部对象当作稳定公开 API。

## 身份与回执

每次请求核对 DSH 实例/profile、Vault 绑定修订、publisher/boot/origin 和实际目录，再映射到原生 Vault ID；派发始终带 vault=<nativeId>，并先运行 vault info=path 核验。结构化文件路径必须 Vault 相对，不允许父级遍历、绝对路径和指向 Vault 外的链接；这些检查不约束任意 eval。

所有写入、插件启停和 eval 使用原有持久请求回执：started/completed/unconfirmed。相同会话及 requestId 只执行一次，参数变化拒绝，不把文件内容、脚本或输出保存到回执。超时、失败、最终身份不明或回执无法保存，不自动重试。最多保存 10000 条，不自动淘汰后重复执行旧写入。

自身重载沿用同 Vault/绑定的新 boot 确认。停用或卸载 Obsidian 侧桥、脚本改绑或退出应用可能切断最终身份确认，此时操作可能已经生效但回执为 unconfirmed；不可当作未执行。CLI 与绑定不是原子事务；fs:* 预检与执行之间也不是全局文件锁。

本版验证范围见 [发布验证](RELEASE-20260922.md)。此前 rc2.3 的部署记录属于历史，不代表本版已装入用户实例。官方依据：[Obsidian CLI](https://help.obsidian.md/cli)、[Vault API](https://docs.obsidian.md/Plugins/Vault)。
