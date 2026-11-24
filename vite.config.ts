/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";
import { PRECACHE_GLOBS } from "./src/lib/offlineAssets";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: false,
      manifest: false,
      workbox: {
        globPatterns: [...PRECACHE_GLOBS],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        navigateFallback: "index.html",
        navigateFallbackDenylist: [/^\/api\//],
      },
    }),
  ],
  base: "./",
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  server: { port: 5181, strictPort: true },
  preview: { port: 4181, strictPort: true },
  build: { outDir: "dist", chunkSizeWarningLimit: 800 },
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}", "tests/**/*.test.{ts,tsx}"],
  },
});
