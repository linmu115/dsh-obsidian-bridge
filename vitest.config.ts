import { defineConfig } from "vitest/config";
export default defineConfig({ test: { include: ["tests/**/*.test.ts"], exclude: ["tests/bound-http.test.ts"] } });
