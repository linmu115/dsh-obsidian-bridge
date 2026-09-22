import { defineConfig } from "vitest/config";
if (!process.env.DSH_OBSIDIAN_COMPANION_SOURCE) throw new Error("Set DSH_OBSIDIAN_COMPANION_SOURCE to a separately prepared Companion checkout");
export default defineConfig({ test: { include: ["tests/bound-http.test.ts"] } });
