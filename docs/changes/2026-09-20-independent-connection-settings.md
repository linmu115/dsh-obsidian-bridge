# 单实例独立连接设置

DSH 设置中的「Obsidian 连接」列出当前实例发现的 Vault，支持连接多个未绑定 Vault、查看状态和断开自己的通道。每个 Vault 的 Companion 保存一个 DSH 目标；需要换目标时，先在该 Vault 中断开原连接，再从新实例连接。连接不需要 Maintenance 或 Launcher。

断开不执行笔记、引用或双链删除。引用使用前继续由来源 adapter 读取和核验实际目标；重新连通不作为目标存在的证明。

Obsidian CLI 是可选增强。找不到原生 CLI 时不向模型注册 `dsh_obsidian_cli` 和 CLI 操作 skill，连接及引用功能继续运行。配置 `obsidianCliPath` 或 PATH 后重新加载 Bridge，设置页可查看新探测结果。

类型检查、构建和单元测试已验证；跨端 HTTP 测试通过合成 DSH/Vault 运行。浏览器视觉效果和真实 Vault 尚未验证。
