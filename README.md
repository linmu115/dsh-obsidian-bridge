# dsh-obsidian-bridge-lifecycle

Cordis service that observes the external Obsidian Bridge, holds a renewable lease, and mounts Bridge-dependent attachments only while the current Bridge boot accepts work. On the Host it reads the initialized DSH Web server's real port, authorizes that exact loopback browser origin, and leases a current authenticated Viewer URL back to Obsidian. Attachments are disposed in strict reverse registration order on drain, restart, or disconnect.
