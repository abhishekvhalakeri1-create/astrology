import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        // keep slow-moving vendors in their own files so a content change
        // does not invalidate the ephemeris or the animation runtime
        manualChunks(id: string) {
          if (!id.includes("node_modules")) {
            if (id.includes("/src/data/")) return "data";
            if (id.includes("/src/lib/astro/") || id.includes("/src/components/charts")) return "engine";
            return;
          }
          if (id.includes("astronomy-engine")) return "vendor-ephemeris";
          if (id.includes("framer-motion") || id.includes("motion-dom") || id.includes("motion-utils")) return "vendor-motion";
          return "vendor";
        },
      },
    },
  },
  server: { host: "0.0.0.0", port: 5173, strictPort: true, allowedHosts: true },
  preview: { host: "0.0.0.0", port: 5173, strictPort: true, allowedHosts: true },
});
