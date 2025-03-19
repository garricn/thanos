/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync } from 'fs';

// Simple function to copy MD files to the build directory
const copyMdPlugin = (patterns = ['*.md']) => ({
  name: 'copy-md-plugin',
  closeBundle() {
    patterns.forEach((pattern) => {
      // This is a simple implementation - for complex patterns, use glob
      if (pattern === '*.md') {
        try {
          copyFileSync('README.md', 'dist/README.md');
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
    // Add path resolution for TypeScript paths
    {
      name: 'tsconfig-paths',
      configResolved(config) {
        // You can add custom path resolution logic here if needed
      },
    },
    copyMdPlugin(['*.md']),
  ],
  resolve: {
    alias: {
      // Add any path aliases from tsconfig.json here
      '@app': resolve(__dirname, './apps/web/src'),
    },
  },
  build: {
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
}));
