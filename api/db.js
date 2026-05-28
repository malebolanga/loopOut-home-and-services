// db.js – SQLite helper for offender tracking
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.resolve(__dirname, 'moderation.db');

// Initialize DB and create table if not exists
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Failed to open DB:', err);
  } else {
    db.run(`
      CREATE TABLE IF NOT EXISTS offenders (
        userId TEXT PRIMARY KEY,
        imageCount INTEGER DEFAULT 0,
        textCount INTEGER DEFAULT 0,
        lastSeen INTEGER
      )
    `);
  }
});

function getOffender(userId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM offenders WHERE userId = ?', [userId], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function upsertOffender(userId, imageDelta = 0, textDelta = 0) {
  const now = Date.now();
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO offenders (userId, imageCount, textCount, lastSeen)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(userId) DO UPDATE SET
         imageCount = imageCount + excluded.imageCount,
         textCount = textCount + excluded.textCount,
         lastSeen = excluded.lastSeen;`,
      [userId, imageDelta, textDelta, now],
      function (err) {
        if (err) return reject(err);
        resolve();
      }
    );
  });
}

module.exports = { getOffender, upsertOffender, DB_PATH };
