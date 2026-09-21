# Bridge 必需消费者启动修复

版本：0.4.1-rc2.6。

贴纸在独立实例中以 `obsidianBridgeLifecycle` 为必需依赖。旧 Bridge 的正式入口立即返回，却在内部 `ctx.inject` 中异步等待 Web 端口及身份存储；DSH Loader 只等待配置树中正式入口的任务，因此可能在服务发布前检查贴纸并报 `pending (waiting for service: obsidianBridgeLifecycle)`。

Bridge 现在将必需初始化直接作为正式异步入口返回。宿主等待端口、持久身份和服务发布完成；初始化失败直接归入 Bridge 的启动错误。保留身份校验、卸载清理、贴纸必需依赖及 Maintenance 可选边界，不新增延时配置或安装步骤。

回归测试使用真实 Cordis 生命周期、延迟身份存储及必需消费者，验证入口不能提前完成，服务发布后消费者正常激活，身份存储失败传递至正式入口。测试替换了网络发现和 Vault 通信，实际安装与页面验证另记部署报告。
