import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // Enemy portraits are large source assets. Adding a batch should not trigger
    // dozens of full renderer refreshes; restart the dev server after an asset
    // batch when newly imported portraits need to be picked up.
    watch: {
      ignored: ["**/src/assets/Enemies/**"],
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, "/");
          if (normalizedId.includes("node_modules/lucide-react")) return "icons-vendor";
          if (normalizedId.includes("node_modules/react") || normalizedId.includes("node_modules/react-dom")) return "react-vendor";
          if (normalizedId.includes("/src/components/")) return "game-components";
          if (normalizedId.includes("/src/data/")) {
            if (normalizedId.includes("/src/data/skills") || normalizedId.includes("/src/data/combat") || normalizedId.includes("/src/data/items") || normalizedId.includes("/src/data/recipes")) return "game-content-primary";
            if (normalizedId.includes("/src/data/jobs") || normalizedId.includes("/src/data/operations") || normalizedId.includes("/src/data/bosses") || normalizedId.includes("/src/data/percentDrops")) return "game-content-combat";
            if (normalizedId.includes("/src/data/vendors") || normalizedId.includes("/src/data/ripperdoc") || normalizedId.includes("/src/data/housing") || normalizedId.includes("/src/data/vehicles") || normalizedId.includes("/src/data/fixers")) return "game-content-districts";
          }
          if (!id.includes("node_modules")) return undefined;
          return "vendor";
        },
      },
    },
  },
});
