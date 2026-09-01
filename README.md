# dsh-obsidian-bridge-lifecycle

Cordis service that observes the external Obsidian Bridge, holds a renewable lease, and mounts Bridge-dependent attachments only while the current Bridge boot accepts work. Attachments are disposed in strict reverse registration order on drain, restart, or disconnect.
