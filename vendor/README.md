# Development dependencies

- `protocol/`: MIT source imported from linmu115/dsh-obsidian-bridge-protocol commit 829215e. This source is now maintained here; the former repository is retired. Its lib output is rebuilt before the Bridge.
- `core-sdk/`: development SDK snapshot (unmodified protocol/API JavaScript, source map and declarations, MIT license; reduced private package manifest exposing only these SDK entries) from dsh-annotation-core 0.3.12-rc2.19, commit 64aaf28. Core remains an independently maintained plugin. This snapshot makes builds independent of unpublished versions and machine-local sibling directories; update it from a verified Core build when upgrading the SDK. It is excluded from the Bridge release package.

The existing Bridge bundler includes only Core protocol code and the shared bridge protocol in runtime output. No Core plugin implementation is loaded by the Bridge.
