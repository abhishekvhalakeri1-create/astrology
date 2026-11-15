import { defineConfig } from "vite";
export default defineConfig({
  build: { ssr: "scripts/dom-smoke.mts", outDir: "dist-smoke", minify: false, target: "node22", rollupOptions: { external: ["react", "react-dom", "react-dom/server", "jsdom", "react/jsx-runtime"] } },
  logLevel: "error",
});
