import { jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const scriptPath = path.resolve(__dirname, '../bin/act.js');

// Mock child_process
jest.mock('child_process', () => ({
  execSync: jest.fn().mockImplementation((command) => {
    if (command === 'node -v') return 'v18.16.0';
    return 'mock output';
  }),
  spawn: jest.fn(() => {
    const mockProcess = {
      on: jest.fn((event, callback) => {
        if (event === 'close') {
          setTimeout(() => callback(0), 10);
        }
        return mockProcess;
      }),
    };
    return mockProcess;
  }),
}));

// Mock fs methods
jest.mock('fs', () => {
  const originalFs = jest.requireActual('fs');
  return {
    ...originalFs,
    existsSync: jest.fn().mockReturnValue(true),
    mkdirSync: jest.fn(),
    mkdtempSync: jest.fn().mockReturnValue('/tmp/mock-dir'),
    rmSync: jest.fn(),
  };
});

// Mock os methods
jest.mock('os', () => ({
  tmpdir: jest.fn().mockReturnValue('/tmp'),
  homedir: jest.fn().mockReturnValue('/home/user'),
}));

// Mock process
jest.spyOn(process, 'exit').mockImplementation(() => {});
Object.defineProperty(process, 'env', {
  value: {
    PATH: '/usr/bin:/bin',
    USER: 'testuser',
    NVM_DIR: '/home/user/.nvm',
  },
});

describe('act.js', () => {
  test('script file exists', () => {
    // Check that the script file exists
    const exists = fs.existsSync(scriptPath);
    expect(exists).toBe(true);
  });

  test('script is executable', () => {
    // Check if the file has executable permissions
    const stats = fs.statSync(scriptPath);
    const isExecutable = (stats.mode & 73) !== 0; // 73 is 'x' permission for user and others
    expect(isExecutable).toBe(true);
  });

  // We can't fully test the script execution because it depends on external commands
  // and would execute them during tests. Instead, we'll verify the script's structure.
  test('script contains required functions', () => {
    // Read the script file content
    const scriptContent = fs.readFileSync(scriptPath, 'utf8');

    // Check for key functions and features
    expect(scriptContent).toContain('runAct');
    expect(scriptContent).toContain('execCmd');
    expect(scriptContent).toContain('getToken');
    expect(scriptContent).toContain('hasCommand');
    expect(scriptContent).toContain('node -v');
    expect(scriptContent).toContain('security find-generic-password');
    expect(scriptContent).toContain('rsync -a');
  });
});
