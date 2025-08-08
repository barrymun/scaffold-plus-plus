import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsConfigPaths()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Automatic vendor splitting that works with pnpm
          if (id.includes("node_modules")) {
            // Handle pnpm's .pnpm directory structure
            if (id.includes(".pnpm")) {
              // Extract package name from: .pnpm/package@version/node_modules/package
              const match = id.match(/\.pnpm\/[^/]+\/node_modules\/([^/]+)/);
              if (match) {
                return match[1].replace("@", "").replace("/", "-");
              }
            }

            // Fallback for regular node_modules structure
            const parts = id.split("node_modules/")[1].split("/");
            const packageName = parts[0].startsWith("@") ? `${parts[0]}/${parts[1]}` : parts[0];
            return packageName.replace("@", "").replace("/", "-");
          }
        },
      },
    },
  },
});
