# dsh-obsidian-bridge-lifecycle

当前候选版本 **0.3.3-rc2.2** 针对 DSH **0.1.5-rc.2**。配置 `dshInstanceId` 为 Launcher 实例 ID，`profileId` 为该实例的 profile；由 Host 同步到浏览器。


Cordis service that observes the external Obsidian Bridge, holds a renewable lease, and mounts Bridge-dependent attachments only while the current Bridge boot accepts work. On the Host it reads the initialized DSH Web server's real port, authorizes that exact loopback browser origin, and leases a current authenticated Viewer URL back to Obsidian. Attachments are disposed in strict reverse registration order on drain, restart, or disconnect.
