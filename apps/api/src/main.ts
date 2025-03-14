import express from 'express';

// Import the log model
const logModel = require('../../../db/models/log');

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();

// Disable X-Powered-By header to prevent information disclosure
app.disable('x-powered-by');

app.get('/', (req, res) => {
  res.send({ message: 'Hello API' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// New hello endpoint with database logging
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

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
  console.log(`Try the new endpoint at http://${host}:${port}/api/hello`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  logModel.closeDb();
  process.exit(0);
});
