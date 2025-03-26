import { createApp } from './app.ts';
import { createServer, defaultConfig, type ProcessSignals } from './server.ts';
import express from 'express';

// Create a real process signals implementation
const processSignals: ProcessSignals = {
  onShutdown: (handler: () => void) => {
    process.on('SIGTERM', handler);
    process.on('SIGINT', handler);
  },
};

// Create and start the server
const app = createApp(express());
createServer(
  app,
  defaultConfig,
  {
    info: (message: string) => console.log(message),
    error: (message: string) => console.error(message),
  },
  processSignals
);
