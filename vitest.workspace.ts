import { defineWorkspace } from 'vitest/config';
import { UserWorkspaceConfig } from 'vitest';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineWorkspace([
  {
    extends: path.resolve(__dirname, 'apps/web/vitest.config.ts'),
    test: {
      name: 'web',
      environment: 'jsdom',
      setupFiles: ['apps/web/tests/setup.ts'],
      coverage: {
        enabled: true,
        provider: 'v8',
        reporter: ['text', 'json', 'html', 'lcov'],
        reportsDirectory: './coverage/combined',
        include: ['apps/web/src/**/*.{ts,tsx}'],
        exclude: [
          '**/*.{test,spec}.{ts,tsx}',
          '**/e2e/**',
          '**/*.d.ts',
          '**/*.config.{js,ts}',
          '**/vite-env.d.ts',
        ],
      },
    },
  },
  {
    extends: path.resolve(__dirname, 'apps/api/vitest.config.ts'),
    test: {
      name: 'api',
      environment: 'node',
      coverage: {
        enabled: true,
        provider: 'v8',
        reporter: ['text', 'json', 'html', 'lcov'],
        reportsDirectory: './coverage/combined',
        include: ['apps/api/src/**/*.ts'],
        exclude: ['**/*.{test,spec}.{ts,tsx}', '**/e2e/**', '**/*.d.ts', '**/*.config.{js,ts}'],
      },
    },
  },
] as UserWorkspaceConfig[]);
