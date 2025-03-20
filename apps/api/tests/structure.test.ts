import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('API Database Structure', () => {
  it('should have a valid database file', () => {
    // Get the path to the database file
    const dbPath = path.join(__dirname, '..', 'db', 'database.db');

    // Check if the database file exists
    const dbExists = fs.existsSync(dbPath);

    // Assert that the database file exists
    expect(dbExists).toBe(true);

    // Log the result for clarity
    if (dbExists) {
      // eslint-disable-next-line no-console
      console.log(`Database file found at: ${dbPath}`);
    } else {
      console.error(`Database file not found at: ${dbPath}`);
    }
  });

  it('should have the correct database directory structure', () => {
    // Check if the models directory exists
    const modelsPath = path.join(__dirname, '..', 'db', 'models');
    const modelsExist = fs.existsSync(modelsPath);

    // Assert that the models directory exists
    expect(modelsExist).toBe(true);

    // Check if the log model file exists
    const logModelPath = path.join(modelsPath, 'log.js');
    const logModelExists = fs.existsSync(logModelPath);

    // Assert that the log model file exists
    expect(logModelExists).toBe(true);
  });
});
