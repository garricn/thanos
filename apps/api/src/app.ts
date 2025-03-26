import { Express } from 'express';

export function createApp(express: Express): Express {
  express.get('/', (req, res) => {
    res.send('Hello World');
  });

  return express;
}
