import type { SkillRegistration } from '@deepseek-ai/dsh-skill';

export const obsidianOperationSkill: SkillRegistration = {
  name: 'obsidian-bound-vault', provider: 'dsh-obsidian-bridge', source: 'bundled',
  description: 'Operate the bound Obsidian Vault through its official CLI: notes, hidden configuration files, plugin deployment/lifecycle, and arbitrary JavaScript.',
  invocation: { modelInvocable: true, userInvocable: true },
  metadata: { 'dsh-executor-portability': 'self-contained' },
  content: `# Bound Obsidian Vault operations

Use the official Obsidian CLI first, through dsh_obsidian_cli. The Bridge resolves
the bound Vault to the native CLI ID and verifies its live location and binding.
Never rely on the current active Vault, a display name, an old port, or assume the
Bridge vaultId equals the native Obsidian ID. Read the currently callable tool
catalogue; a managed executor may prefix these names with its server namespace.

1. Call dsh_obsidian_targets. Select the Vault intended by the user's task.
   If multiple bound Vaults remain ambiguous, ask which one. Listing is read-only.
2. Call dsh_obsidian_cli with vaultId, command and a parameters object. Do not pass
   a vault selector, shell syntax, or a CLI executable in parameters. The bridge
   supplies them. Paths are exact Vault-relative paths (including hidden folders),
   not active-file defaults. Core, Maintenance, Sticker and Codex are not required.
3. Every write/UI change requires a unique requestId. Reuse it only for exactly the
   same request. A repeated request returns the durable receipt and is not rerun.
   unconfirmed/started means the result is unknown: inspect the target before any
   newly authorized retry. Do not generate a new ID to hide an uncertain result.

Examples (parameters are data, not a command string):
- read: {path: 'Notes/example.md'}
- create: {path: 'Notes/new.md', content: '# Title\\nBody'}
- append: {path: 'Notes/example.md', content: '\\nMore text'}
- search: {query: 'topic', format: 'json'}
- property:set: {path: 'Notes/example.md', name: 'status', value: 'draft'}
- create from template: {path: 'Notes/new.md', template: 'Project'}
- snippet:enable: {name: 'my-style'}
- plugin:reload: {id: 'my-plugin'}
- config:dir: {} (returns the actual configuration directory; do not assume .obsidian)
- fs:list: {path: '.obsidian/plugins'} (omit path to list the Vault root)
- fs:stat: {path: '.obsidian/plugins/my-plugin/main.js'}
- fs:read: {path: '.obsidian/app.json', offset: 0, limit: 12000}
- fs:mkdir: {path: '.obsidian/plugins/my-plugin'} (creates missing parents)
- fs:write: {path: '.obsidian/plugins/my-plugin/main.js', content: 'compiled plugin code'}
- fs:append: {path: '.obsidian/plugins/my-plugin/main.js', content: 'next chunk'}
- fs:remove: {path: '.obsidian/plugins/my-plugin/old-file.js'} (permanent removal)
- plugin:install: {id: 'community-plugin-id', enable: true}
- plugin:enable / plugin:disable: {id: 'my-plugin', filter: 'community'}
- plugin:uninstall: {id: 'my-plugin'}
- plugins:enabled: {filter: 'community', versions: true}
- eval: {code: 'JSON.stringify({configDir: app.vault.configDir})'} (requestId required)

Use fs:* for configuration files: these Bridge commands execute fixed Adapter
operations via official CLI eval, without requiring a new Companion version.
fs:write replaces the file; read current content and preserve unrelated settings.
Create parent directories first. Read returns result.content, total and nextOffset
(UTF-16 character offsets, not bytes); follow nextOffset for large files. Writes are
text; for large compiled plugins use small exact chunks (about 4000 characters),
fs:write followed by fs:append, each with its own stable requestId. Content is literal
text: a JSON newline becomes a newline; literal backslash-n remains backslash-n.
fs:remove deletes permanently; nonempty folders require recursive:true. Back up
affected configuration and existing plugin files before overwriting or deleting.

For local plugin deployment, build with engineering tools, deploy manifest.json,
main.js and any styles.css/assets, then plugin:enable (new) or plugin:reload (loaded).
plugin:install installs a community catalogue ID, not a local directory. Read back
files and check plugin state after applying. Written files are not proof of activation;
running plugins may overwrite externally edited settings until reloaded.

eval accepts arbitrary JavaScript, including async expressions and Plugin APIs.
ALL eval calls require requestId and are treated as potentially writing. It runs
with Obsidian process privileges: the Bridge's fs:* path guards are NOT a sandbox
for eval or for installed plugin code. Do not describe eval as Vault-confined.
Do not treat Obsidian internal objects as stable public APIs. Disabling/uninstalling
the Companion or changing its binding may make final verification impossible:
an unconfirmed receipt does not mean nothing happened; never blindly repeat it.
CLI_UNAVAILABLE requires restoring the official CLI; do not silently switch to
another Vault or execute through a different transport.

Respect the user's requested scope. This skill provides operation guidance, not
authorization to publish, delete unrelated files or change bindings outside the task.
Report actual results and limitations; a registered tool is not proof of a live write.
`,
};
