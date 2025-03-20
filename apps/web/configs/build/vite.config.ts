/// <reference types='vitest' />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(() => ({
  root: path.resolve(__dirname, "../../../../apps/web"),
  cacheDir: "../../../../node_modules/.vite/web",
  server: {
    port: 4200,
    host: "localhost",
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
  preview: {
    port: 4300,
    host: "localhost",
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  css: {
    postcss: "../../../../configs/build/postcss.config.js",
  },
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [],
  // },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
}));
