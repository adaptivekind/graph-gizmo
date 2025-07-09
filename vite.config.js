import { defineConfig } from "vite";
import { resolve } from "path";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  root: "./dev",
  server: {
    open: true,
    port: 3000,
  },
  resolve: {
    alias: {
      "/src": resolve(fileURLToPath(new URL(".", import.meta.url)), "src"),
    },
  },
});
