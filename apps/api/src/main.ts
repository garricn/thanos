import { createApp } from './app.ts';

interface ServerConfig {
  port: number;
}

// Default configuration
const defaultConfig: ServerConfig = {
  port: 3000,
};

// Extracted server creation function that can be tested
export function createServer(config: ServerConfig = defaultConfig) {
  const app = createApp();
  const port = config.port;

  const server = app.listen(port, () => {
    console.log(`API is running on http://localhost:${port}`);
  });

  return server;
}

// Only execute when directly run, not when imported in tests
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  // Use environment variables in the main entry point
  const port = Number(process.env.PORT) || defaultConfig.port;
  createServer({ port });
}
