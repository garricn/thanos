#!/usr/bin/env node

// This is a workaround script for running TypeScript with ESM
import { spawn } from 'child_process';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const tsNodeExecutable = resolve(
  __dirname,
  '../../../node_modules/.bin/ts-node'
);

// Run TypeScript file with ts-node
const child = spawn(
  tsNodeExecutable,
  [
    '--esm',
    '--project',
    '../../configs/build/tsconfig.api.json',
    resolve(__dirname, 'main.ts'),
  ],
  {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_OPTIONS: '--no-warnings',
    },
  }
);

// Handle process termination
process.on('SIGTERM', () => {
  child.kill('SIGTERM');
});

process.on('SIGINT', () => {
  child.kill('SIGINT');
});

// Exit with the same code as the child process
child.on('exit', (code) => {
  process.exit(code);
});
