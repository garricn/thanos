import { createApp } from './app.ts';
import { Express } from 'express';

export interface Logger {
  info(message: string): void;
  error(message: string): void;
}

interface ServerConfig {
  port: number;
}

// Default configuration
const defaultConfig: ServerConfig = {
  port: 3000,
};

// Extracted server creation function that can be tested
export function createServer(app: Express, config: ServerConfig = defaultConfig, logger: Logger) {
  const server = app.listen(config.port, () => {
    logger.info(`API is running on http://localhost:${config.port}`);
  });

  return server;
}

// Only execute when directly run, not when imported in tests
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  const app = createApp();
  // Create a simple console logger for the main module
  const consoleLogger: Logger = {
    info: (message: string) => console.log(message),
    error: (message: string) => console.error(message),
  };
  createServer(app, defaultConfig, consoleLogger);
}
