import type { UserConfig } from "tsdown";

const protocol = ["dsh-obsidian-bridge-protocol", "dsh-obsidian-bridge-protocol/data", "dsh-annotation-core/protocol", "zod"];

export default [
  { entry: { transport: "src/transport.ts" }, outDir: "lib", format: "esm", platform: "neutral", target: "es2023", fixedExtension: false, dts: false, clean: false, deps: { neverBundle: ["dsh-annotation-core/protocol", "dsh-obsidian-bridge-protocol/data", "zod"] } },
  {
    entry: { index: "src/index.ts", api: "src/api.ts", typert: "src/typert.ts" },
    outDir: "lib",
    format: ["esm"],
    platform: "node",
    target: "es2024",
    fixedExtension: false,
    dts: false,
    clean: false,
    deps: { alwaysBundle: protocol },
  },
  {
    entry: { client: "src/client.ts" },
    outDir: "lib",
    format: "cjs",
    platform: "browser",
    target: "es2023",
    dts: false,
    clean: false,
    deps: {
      neverBundle: ["@deepseek-ai/cordis"],
      alwaysBundle: protocol,
    },
    outputOptions: {
      entryFileNames: "client.js",
      banner: "window.__ModuleLoader__.load({ id: \"dsh-obsidian-bridge-lifecycle\", factory: (require) => {",
      intro: "var module = { exports: {} }; var exports = module.exports;",
      footer: "return module.exports; } });",
      codeSplitting: false,
    },
  },
] satisfies UserConfig[];
