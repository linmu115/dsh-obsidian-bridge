# DSH Obsidian Bridge

当前发布包是 **`dsh-obsidian-bridge@0.4.1-rc2.1`**，面向 DSH **0.1.5-rc.2**。一个桥插件提供实例身份、Vault 绑定、本机发现、多 Vault 连接与路由、Obsidian 来源和导航，以及桥连接管理界面。包内附带的 `cordis.patch.yml` 只加载自身一次。Protocol 已打包进入运行代码，用户无需另外安装 Lifecycle、Reference Adapter、Suite 或 Protocol。

## 功能组合

| 组合 | 能力 |
| --- | --- |
| Bridge | 持久实例身份、显式 Vault 绑定、多 Vault 连接与路由、连接状态与管理。 |
| Core + Bridge | 跨 Obsidian 引用；不需要普通 Sticker 插件。 |
| Core + Bridge + Better Sidebar + 普通 Sticker | 普通贴纸的笔记关联界面与业务。 |
| 可选 Maintenance | 身份协作、历史会话可用性校验和绑定业务信息页；缺席不影响独立桥能力。 |

Core 管理引用状态、引用样式与 UI、气泡、上下文组织与注入、提交和补偿。Bridge 将 Obsidian 来源注册给 Core，负责连接、来源交接、定位和传输；不存放 Core 的引用状态。普通 Sticker 管理自己的贴纸和笔记关联业务。Bridge 不自动加载这些独立插件；Core 晚加载时，桥动态注册来源，Core 卸载时只撤销相关接入。

## 身份与绑定

每个 Vault 保存自己的实例绑定。Bridge 使用持久实例身份和本机发现连接已确认的 Vault；端口变化和上线顺序不会改变归属。`bridgeOrigin` 只是手动候选，不会自动成为业务目标。首次使用在 Obsidian 设置或 Bridge 管理面板中明确绑定。

配置自己的 `obsidian-bridge` 节点：

```json
{
  "bridgeOrigin": "http://127.0.0.1:18473",
  "dshInstanceId": "<现有可信实例 ID；新实例可省略并持久生成>",
  "profileId": "web"
}
```

`dshInstanceId` 必须与当前实例已有 Maintenance 身份一致，不能复制另一个实例的值。缺省时在当前实例的存储域持久生成，不用名称或端口充当身份。`profileId` 应与关联功能使用的 profile 一致。DSH Web 地址来自已经启动的 Web 服务，保持实际动态端口和受认证的 Viewer 连接。

多 Vault 调用通过 `forVault(vaultId)` 指定目标；省略目标且不能唯一确定时返回明确的歧义错误。一个 Vault 关闭不会卸载其他 Vault。请求固定 Vault、绑定版本、实例、profile 和启动身份，改绑不会把旧请求投到新实例。

Obsidian 的待处理引用只由匹配目标 Viewer 的页面领取，独立 DSH 窗口不会抢走引用。打开笔记关联不会自动把笔记正文加入模型请求；明确引用后才交由 Core 管理。

## 从旧组合迁移

升级安装配置时，将旧 Suite 父组中的必要配置拆到 Core、Bridge、普通 Sticker 各自独立的节点，每个插件仅一份。新的桥节点名为 `dsh-obsidian-bridge`，节点 ID 为 `obsidian-bridge`；移除旧 Suite、Lifecycle 和独立 Reference Adapter 的运行节点与包依赖。不要同时启用新旧桥。

保留原 `dshInstanceId`、`profileId`、存储目录和 Obsidian `data.json`。服务键 `obsidianBridgeLifecycle`、持久身份域 `dsh_obsidian_bridge_identity_v1` 和 `/obsidian-bridge/identity` 路径保持不变。旧未绑定 Vault 仍须明确绑定；旧未归属请求不会自动分配给新的绑定。仓库物理目录暂保留历史名称，不代表需要安装历史包。

## 开发接口与构建

公开入口：`dsh-obsidian-bridge/api`、`/transport`、`/typert`、`/protocol`、`/protocol/data`、`/protocol/binding`。后三个协议入口和 transport 可在浏览器构建中使用；Node 发现逻辑仅在桥宿主内部。消费者应使用导出路径，不引用内部 `dist` 或旧 `lib` 文件名。

Protocol 和 Core 协议源是开发依赖；运行 JS 和所需公共声明已打包。发布清单只包含 `dist`、单节点补丁及文档，不包含旧 `lib`。源码开发链接仍可指向物理目录 `../dsh-obsidian-bridge-lifecycle`。

在已经配置本地源码依赖的仓库中验证：

```powershell
node node_modules/typescript/bin/tsc --noEmit
node node_modules/tsdown/dist/run.mjs --config-loader unrun --config tsdown.config.ts
node node_modules/vitest/vitest.mjs run
```

详细验证与限制见 [单桥发布报告](docs/changes/2026-09-18-single-bridge-package.md)；多 Vault 机制见 [绑定与路由报告](docs/changes/2026-09-18-vault-binding-routing.md)。真实实例安装与 Vault 验收需要独立执行，本次源码发布调整没有修改真实配置。
