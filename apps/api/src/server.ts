import { Express } from 'express';

export interface Logger {
  info(message: string): void;
  error(message: string): void;
}

export interface ServerConfig {
  port: number;
}

export interface ProcessSignals {
  onShutdown(handler: () => void): void;
}

// Default configuration
export const defaultConfig: ServerConfig = {
  port: 3000,
};

// Extracted server creation function that can be tested
export function createServer(
  app: Express,
  config: ServerConfig = defaultConfig,
  logger: Logger,
  signals: ProcessSignals
) {
  const server = app.listen(config.port, () => {
    logger.info(`API is running on http://localhost:${config.port}`);
  });

  signals.onShutdown(() => {
    logger.info('Shutting down server...');
    server.close();
  });

  return server;
}
