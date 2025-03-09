/**
 * Log Model for SQLite Database
 *
 * This module provides functions to initialize the database,
 * create the logs table, and perform CRUD operations on logs.
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, '..', 'database.db');

// Initialize database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    // Create logs table if it doesn't exist
    initDb();
  }
});

/**
 * Initialize the database by creating the logs table if it doesn't exist
 */
function initDb() {
  db.run(
    `
    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL,
      endpoint TEXT NOT NULL
    )
  `,
    (err) => {
      if (err) {
        console.error('Error creating logs table:', err.message);
      } else {
        console.log('Logs table initialized');
      }
    }
  );
}

/**
 * Insert a new log entry into the database
 *
 * @param {string} endpoint - The API endpoint that was accessed
 * @returns {Promise<number>} - The ID of the inserted log
 */
function insertLog(endpoint) {
  return new Promise((resolve, reject) => {
    const timestamp = new Date().toISOString();

    db.run(
      'INSERT INTO logs (timestamp, endpoint) VALUES (?, ?)',
      [timestamp, endpoint],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      }
    );
  });
}

/**
 * Get all logs from the database
 *
 * @returns {Promise<Array>} - Array of log objects
 */
function getLogs() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM logs ORDER BY id DESC', (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

/**
 * Get a log by ID
 *
 * @param {number} id - The log ID
 * @returns {Promise<Object>} - The log object
 */
function getLogById(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM logs WHERE id = ?', [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

/**
 * Get logs by endpoint
 *
 * @param {string} endpoint - The endpoint to filter by
 * @returns {Promise<Array>} - Array of log objects
 */
function getLogsByEndpoint(endpoint) {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM logs WHERE endpoint = ? ORDER BY id DESC',
      [endpoint],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
  });
}

/**
 * Close the database connection
 */
function closeDb() {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed');
    }
  });
}

// Export functions
module.exports = {
  initDb,
  insertLog,
  getLogs,
  getLogById,
  getLogsByEndpoint,
  closeDb,
};
