import { createApp } from './app.ts';
import { Express } from 'express';

interface ServerConfig {
  port: number;
}

// Default configuration
const defaultConfig: ServerConfig = {
  port: 3000,
};

// Extracted server creation function that can be tested
export function createServer(app: Express, config: ServerConfig = defaultConfig) {
  const server = app.listen(config.port, () => {
    console.log(`API is running on http://localhost:${config.port}`);
  });

  return server;
}

// Only execute when directly run, not when imported in tests
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  const app = createApp();
  createServer(app);
}
