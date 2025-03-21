import { jest } from '@jest/globals';
import {
  cleanDeep,
  checkNodeVersion,
  switchNodeVersion,
} from '../shell-utils.js';

// Mock process.exit to prevent tests from exiting
jest.spyOn(process, 'exit').mockImplementation(() => {});

// Mock console methods to keep output clean
jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

describe('shell-utils', () => {
  // Basic smoke tests to verify module loading
  test('exports cleanDeep function', () => {
    expect(typeof cleanDeep).toBe('function');
  });

  test('exports checkNodeVersion function', () => {
    expect(typeof checkNodeVersion).toBe('function');
  });

  test('exports switchNodeVersion function', () => {
    expect(typeof switchNodeVersion).toBe('function');
  });
});
