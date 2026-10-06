import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => ({
  base: command === "serve" ? "/" : "/Cyber-Idle/",
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, "/");
          if (normalizedId.includes("node_modules/lucide-react")) return "icons-vendor";
          if (normalizedId.includes("node_modules/react") || normalizedId.includes("node_modules/react-dom")) return "react-vendor";
          // Keep application modules together: data and UI share runtime dependencies.
          if (!id.includes("node_modules")) return undefined;
          return "vendor";
        },
      },
    },
  },
}));
