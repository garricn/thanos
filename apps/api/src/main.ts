import { createApp } from './app';

// Extracted server creation function that can be tested
export function createServer() {
  const app = createApp();
  const port = process.env.PORT || 3333;

  const server = app.listen(port, () => {
    console.log(`API is running on http://localhost:${port}`);
  });

  return server;
}

// Only execute when directly run, not when imported in tests
if (require.main === module) {
  createServer();
}
