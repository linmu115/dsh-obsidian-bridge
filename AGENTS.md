# Development and acceptance

- Prefer verified commands and backend APIs for DSH lifecycle operations. Never invent Launcher CLI commands or substitute runtime shutdown for Launcher stop. Stop/restart require verified Launcher flush/drain/close and final closed receipts; absent this capability, do not stop the instance.
- Identify targets by stable instance ID, profile, actual home and live boot identity, never by display name or a historical port.
- Keep routine checks read-only. Do not alter Vault bindings, sync scope, notes or history unless authorized. Back up relevant configuration before authorized deployment.
- Prefer tests, type checks, package checks, identity, registration, logs and receipts. Health success does not establish business or visual acceptance. Mark unchecked UI as unverified.
- Tokens stay in local memory; never report login URLs, credentials or user conversation bodies.
- Preserve other plugins and user changes; keep maps and delivery records consistent with actual installation.
- If delegation is requested, use Astra with reasoning no higher than high. Coordinate before touching the same live instance.
- The former Lifecycle, Reference Adapter, Protocol and Suite repositories are archived. Maintain the unified bridge here, Protocol under vendor/protocol, and the Obsidian-side plugin in its own active repository.
