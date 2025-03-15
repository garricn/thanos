import express from 'express';
import path from 'path';

// Import the log model with a path that works in both development and production
const logModel = require(path.join(__dirname, '..', 'db', 'models', 'log'));

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
