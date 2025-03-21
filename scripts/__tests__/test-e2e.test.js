import { jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const scriptPath = path.resolve(__dirname, '../bin/test-e2e.js');

describe('test-e2e.js', () => {
  test('script file exists', () => {
    const exists = fs.existsSync(scriptPath);
    expect(exists).toBe(true);
  });

  test('script is executable', () => {
    const stats = fs.statSync(scriptPath);
    // Check if the file has executable permissions
    // 73 is 'x' permission for user (100), 1 is 'x' permission for others (001)
    const isExecutable = (stats.mode & 73) !== 0;
    expect(isExecutable).toBe(true);
  });
});
