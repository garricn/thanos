import { setupApp } from './app';
import path from 'path';
import fs from 'fs';

// Import the log model with a path that works in both development and production
let logModelPath;

// Try different possible paths to find the log model
const possiblePaths = [
  path.join(__dirname, '..', 'db', 'models', 'log'), // Development path
  path.join(__dirname, '..', '..', 'db', 'models', 'log'), // Production path from root
  path.join(__dirname, '..', '..', '..', 'db', 'models', 'log'), // Another possible path
];

// Find the first path that exists
for (const p of possiblePaths) {
  try {
    // Check if the file exists by trying to access it
    fs.accessSync(`${p}.js`, fs.constants.F_OK);
    logModelPath = p;
    break;
  } catch {
    // Path doesn't exist, try the next one
    continue;
  }
}

// If no path was found, use a default path and let it fail with a more descriptive error
if (!logModelPath) {
  console.error('Could not find log model at any of the expected paths:');
  possiblePaths.forEach((p) => console.error(`- ${p}.js`));
  logModelPath = path.join(__dirname, '..', 'db', 'models', 'log');
}

const logModel = require(logModelPath);

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
