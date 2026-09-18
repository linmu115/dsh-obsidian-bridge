import type { UserConfig } from "tsdown";

const bundledProtocol = ["dsh-obsidian-bridge-protocol", "dsh-obsidian-bridge-protocol/data", "dsh-obsidian-bridge-protocol/binding", "dsh-annotation-core/protocol", "zod"];
const publicEntries = {
  index: "src/index.ts", api: "src/api.ts", typert: "src/typert.ts", transport: "src/transport.ts",
  protocol: "src/protocol.ts", "protocol/data": "src/protocol/data.ts", "protocol/binding": "src/protocol/binding.ts",
};
export default [
  {
    entry: publicEntries, outDir: "dist", format: "esm", platform: "node", target: "es2024",
    fixedExtension: false, dts: false, clean: false,
    deps: { alwaysBundle: [...bundledProtocol, "dsh-obsidian-bridge-protocol/discovery"] },
  },
  {
    entry: { ...publicEntries, client: "src/client.ts" }, outDir: "dist", format: "esm", platform: "node", target: "es2024",
    fixedExtension: false, clean: false,
    dts: { emitDtsOnly: true, resolver: "tsc" },
    deps: { alwaysBundle: [...bundledProtocol, "dsh-obsidian-bridge-protocol/discovery"], dts: { alwaysBundle: ["dsh-obsidian-bridge-protocol", "dsh-obsidian-bridge-protocol/data", "dsh-obsidian-bridge-protocol/binding", "dsh-obsidian-bridge-protocol/discovery", "dsh-annotation-core/protocol"], neverBundle: ["zod", "@deepseek-ai/cordis", "@deepseek-ai/schemastery", "@deepseek-ai/dsh-typert-protocol", "@deepseek-ai/dsh-typert-registry/types"] } },
  },
  {
    entry: { client: "src/client.ts" }, outDir: "dist", format: "cjs", platform: "browser", target: "es2023",
    dts: false, clean: false,
    deps: { neverBundle: ["@deepseek-ai/cordis", "react", "react/jsx-runtime"], alwaysBundle: bundledProtocol },
    outputOptions: {
      entryFileNames: "client.js",
      banner: 'window.__ModuleLoader__.load({ id: "dsh-obsidian-bridge", factory: (require) => {',
      intro: "var module = { exports: {} }; var exports = module.exports;",
      footer: "return module.exports; } });", codeSplitting: false,
    },
  },
] satisfies UserConfig[];
