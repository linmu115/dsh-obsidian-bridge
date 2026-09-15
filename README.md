# DSH Obsidian Bridge Lifecycle

本补丁配套 Annotation Core **0.3.12-rc2.12**，跨会话引用选择器使用 DSH 会话栏的可读标题。见[组合兼容说明](docs/changes/2026-09-15-picker-title-cohort.md)。

当前版本 **0.3.3-rc2.16**，面向 **DSH 0.1.5-rc.2**。这是 DSH 端的桥接连接服务，通常由 [Obsidian Session Reference Suite](https://github.com/linmu115/dsh-obsidian-session-reference-suite/blob/codex/rc2-session-context-graph/README.md) 统一加载。

## 它负责什么

- 检测当前 Obsidian Bridge 的启动身份，持有并续期连接租约。
- 从 DSH 已启动的 Web 服务取得实际地址与端口，把当前实例的可用 Viewer 地址提供给 Obsidian。Launcher 使用动态端口时，无需把某个端口写死到浏览器代码。
- 把同一份 Bridge 地址、Launcher 实例身份和 profile 身份同步到 DSH 浏览器端。
- 在 Bridge 就绪时挂载引用、删除和贴纸同步所需的连接；排空、重启或断线时按注册顺序的逆序卸载。
- 汇总连接、引用投递和贴纸同步状态，向 Better Sidebar 的 **Obsidian** 面板提供状态与定向重试能力。

Annotation Core 和 Sticker 的持久数据由各自模块管理。Bridge 离线不会卸载 Core，也不会因此删除本地草稿或已保存记录；外部同步会等待重连。迁入 Maintenance 的结构数据仍以 Maintenance 为真源，笔记正文仍由 Vault 管理。

## 与 Obsidian 内嵌会话的关系

Obsidian 中“引用到 DSH”的待处理选段只由该 Vault 配置的内嵌 DSH Web Viewer 领取。Viewer 有稳定的页面身份，登录跳转后仍保留；Reference Adapter 与 Bridge 同时校验页面和实例，独立 DSH 窗口不会抢走引用。

Lifecycle 提供连接和实例身份；具体的引用领取由 Reference Adapter 与 Obsidian Companion 完成。独立窗口仍可以使用已有导航、回链和删除能力。打开一个笔记关联也不会自动把笔记正文加入模型请求，只有明确点击“引用到本轮”才生成待发送引用。

## 配置

整套安装只保留 Suite 的一个父组，不再额外添加一份 Lifecycle 根插件。修改该组中 `obsidian-bridge-lifecycle` 节点的 `config`：

```json
{
  "bridgeOrigin": "http://127.0.0.1:18473",
  "dshInstanceId": "<Launcher 中该实例的实际 ID>",
  "profileId": "web"
}
```

| 字段 | 含义 |
| --- | --- |
| `bridgeOrigin` | Obsidian Bridge 的本机地址，默认 `http://127.0.0.1:18473`。与 Obsidian 设置中的 Bridge 端口一致。 |
| `dshInstanceId` | 当前 Launcher 实例 ID。多实例环境中必须填写对应实例，不能复制另一实例的值。 |
| `profileId` | 当前 DSH profile，默认 `web`。应与 Core、Reference Adapter、Maintenance 的配置一致。 |

Reference Adapter 与 Sticker 默认继承此处的 Bridge 地址。DSH Web 地址和 Bridge 地址是两个不同的服务地址；Lifecycle 会从真实 Web 服务取得前者。在 Obsidian 的 **DeepHarness Bridge** 设置中编辑端口后，点击 **应用**，并同步修改 Lifecycle 配置。

若等待 Web 服务发布端口失败，或 Bridge 重启、身份不匹配，先查看 Obsidian 面板的连接状态，再使用相应重试入口；不要通过创建第二个 Lifecycle 实例绕过连接检查。

## 开发与验证

使用 [package.json](package.json) 指定的 Node.js / pnpm 版本要求。当前开发依赖含本地 `file:` 归档，运行安装前需准备对应构件，或按 Suite 的并列源码工作区流程配置；不能把这些路径当作已发布的 npm 包。

在依赖构件已就绪的本仓库目录运行：

```powershell
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm pack --pack-destination .artifacts
```

`test` 和 `pack` 的前置步骤会执行构建。测试覆盖连接生命周期、身份、传输与配置；跨应用行为还需要整套安装后的实际验收。

开发接口见 [src/api.ts](src/api.ts)：`getSnapshot`、`subscribe`、`mountWhenReady`、`drain`、`resume` 以及健康与重试接口。版本变化见 [CHANGELOG](CHANGELOG.md) 和[当前兼容说明](docs/changes/2026-09-15-graph-reference-lifecycle-cohort.md)。

本次配套更新支持 Maintenance 的轻量引用目录，详见[兼容变更说明](docs/changes/2026-09-15-maintenance-reference-directory.md)。
