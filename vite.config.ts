/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync } from 'fs';

// Simple plugin to copy MD files to the build directory
const copyMdPlugin = (patterns = ['*.md']) => ({
  name: 'copy-md-plugin',
  closeBundle() {
    patterns.forEach((pattern) => {
      if (pattern === '*.md') {
        try {
          copyFileSync('README.md', 'dist/web/README.md');
        } catch (e) {
          console.error('Error copying README.md:', e);
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
      configResolved(config) {
        // Custom path resolution logic can be added here if needed
      },
    },
    copyMdPlugin(['*.md']),
  ],
  resolve: {
    alias: {
      '@app': resolve(__dirname, './apps/web/src'), // From your old config
      '@api': resolve(__dirname, './apps/api/src'), // Added for API
      '@scripts': resolve(__dirname, './scripts'), // Added for scripts
    },
  },
  root: './apps/web', // Focus on web app
  build: {
    outDir: resolve(__dirname, 'dist/web'), // Adjusted output path
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    emptyOutDir: true,
  },
}));
