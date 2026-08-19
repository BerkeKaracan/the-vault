import path from "node:path";
import { fileURLToPath } from "node:url";
import pkg from "@next/env";
const { loadEnvConfig } = pkg;
import { defineConfig } from "vitest/config";

loadEnvConfig(process.cwd());

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/rls/**/*.test.ts"],
    fileParallelism: false,
    testTimeout: 30_000,
  },
  resolve: {
    alias: {
      "@": path.resolve(root, "src"),
    },
  },
});
