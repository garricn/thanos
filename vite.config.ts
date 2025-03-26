/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, existsSync } from 'fs';

// Simple plugin to copy MD files to the build directory
const copyMdPlugin = (patterns = ['*.md']) => ({
  name: 'copy-md-plugin',
  closeBundle() {
    patterns.forEach(pattern => {
      if (pattern === '*.md') {
        try {
          const readmePath = resolve(__dirname, 'README.md');
          if (existsSync(readmePath)) {
            copyFileSync(readmePath, resolve(__dirname, 'dist/web/README.md'));
          }
        } catch (e) {
          console.warn('Warning: Could not copy README.md:', e);
        }
      }
    });
  },
});

export default defineConfig(() => ({
  cacheDir: './node_modules/.vite/root',
  server: {
    port: 4200,
    host: 'localhost',
  },
  preview: {
    port: 4300,
    host: 'localhost',
  },
  plugins: [
    react(),
    {
      name: 'tsconfig-paths',
      configResolved(_config) {
        // Custom path resolution logic can be added here if needed
      },
    },
    copyMdPlugin(['*.md']),
  ],
  resolve: {
    alias: {
      '@app': resolve(__dirname, './apps/web/src'),
      '@api': resolve(__dirname, './apps/api/src'),
    },
  },
  root: resolve(__dirname, 'apps/web'),
  publicDir: resolve(__dirname, 'apps/web/public'),
  build: {
    outDir: resolve(__dirname, 'dist/web'),
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    emptyOutDir: true,
  },
}));
