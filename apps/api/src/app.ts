import express from 'express';
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
  } catch (_) {
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

/**
 * Sets up the Express application with all routes and middleware
 * @returns {express.Application} The configured Express app
 */
export function setupApp(): express.Application {
  const app = express();

  // Disable X-Powered-By header to prevent information disclosure
  app.disable('x-powered-by');

  app.get('/', (req, res) => {
    res.send({ message: 'Hello API' });
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Hello endpoint with database logging
  app.get('/api/hello', async (req, res) => {
    try {
      // Log the request to the database
      await logModel.insertLog('/api/hello');

      // Return the response
      res.json({ message: 'Hello from the backend!' });
    } catch (error) {
      console.error('Error logging request:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return app;
}
