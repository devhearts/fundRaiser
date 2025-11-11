import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  // Load env from both root and client directories
  const rootEnv = loadEnv(mode, __dirname, "");
  const clientEnv = loadEnv(mode, path.resolve(__dirname, "client"), "");
  const env = { ...rootEnv, ...clientEnv }; // Root takes precedence
  // Backend URL for proxy
  const backendUrl = process.env.VITE_BACKEND_URL || "http://localhost:3030";

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "client", "src"),
        "@shared": path.resolve(__dirname, "shared"),
        "@assets": path.resolve(__dirname, "attached_assets"),
      },
    },
    root: path.resolve(__dirname, "client"),
    build: {
      outDir: path.resolve(__dirname, "dist"),
      emptyOutDir: true,
    },
    server: {
      port: 3000,
      proxy: {
        // Proxy all /api requests to the backend
        "/api": {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
          ws: true, // Enable websocket proxying if needed
        },
      },
    },
    preview: {
      port: 3000,
    },
  };
});
