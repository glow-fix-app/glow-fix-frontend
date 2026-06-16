import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiTarget =
    env.VITE_API_PROXY_TARGET || env.VITE_API_URL || "http://localhost:3000";

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(process.cwd(), "src"),
      },
    },
    server: {
      proxy: {
        "/api": {
          target: apiTarget.replace(/\/api\/v1\/?$/, "").replace(/\/$/, ""),
          changeOrigin: true,
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (
                id.includes("react") ||
                id.includes("react-dom") ||
                id.includes("react-router-dom")
              ) {
                return "vendor-react";
              }
              if (
                id.includes("@heroui") ||
                id.includes("framer-motion") ||
                id.includes("tailwind") ||
                id.includes("@heroicons")
              ) {
                return "vendor-ui";
              }
              if (
                id.includes("@tanstack") ||
                id.includes("axios") ||
                id.includes("@reduxjs") ||
                id.includes("react-redux")
              ) {
                return "vendor-data";
              }
              if (id.includes("leaflet") || id.includes("react-leaflet")) {
                return "vendor-map";
              }
              if (id.includes("@stripe")) {
                return "vendor-stripe";
              }
              return "vendor";
            }
          },
        },
      },
    },
  };
});
