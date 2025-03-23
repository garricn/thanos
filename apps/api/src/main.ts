import { createApp } from './app.ts';

// Extracted server creation function that can be tested
export function createServer() {
  const app = createApp();
  const port = process.env.PORT || 3000;

  const server = app.listen(port, () => {
    console.log(`API is running on http://localhost:${port}`);
  });

  return server;
}

// Only execute when directly run, not when imported in tests
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  createServer();
}
