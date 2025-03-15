import { setupApp } from './app';

// Import the log model
const logModel = require('../db/models/log');

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

// Set up the Express application
const app = setupApp();

// Start the server
app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
  console.log(`Try the new endpoint at http://${host}:${port}/api/hello`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  logModel.closeDb();
  process.exit(0);
});
