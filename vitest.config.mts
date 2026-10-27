import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      { find: "@/site.config", replacement: r("./site.config.ts") },
      { find: /^@\//, replacement: `${r("./src")}/` },
      // « server-only » lève une erreur hors du bundle serveur de Next : neutralisé en test.
      { find: "server-only", replacement: r("./tests/server-only-stub.ts") },
    ],
  },
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
  },
});
