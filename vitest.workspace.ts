import { defineWorkspace } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineWorkspace([
  path.resolve(__dirname, 'apps/web/vitest.config.ts'),
  path.resolve(__dirname, 'apps/api/vitest.config.ts'),
  path.resolve(__dirname, 'scripts/vitest.config.ts'),
]);
