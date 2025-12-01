// backend/db.js
const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const USE_SQLITE = process.env.DB_CLIENT === 'sqlite';

// API común: db.query(sql, params)
let db = {};

if (USE_SQLITE) {

  const dbPath = process.env.SQLITE_PATH || path.join(__dirname, 'data.sqlite');
  const sqlite = new sqlite3.Database(dbPath);

  // Crear tablas SQLite
  sqlite.serialize(() => {

    // TABLE: books
    sqlite.run(`
      CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        year INTEGER NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        price REAL NOT NULL DEFAULT 0
      )
    `);

    // TABLE: loans
    sqlite.run(`
      CREATE TABLE IF NOT EXISTS loans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        book_id INTEGER NOT NULL,
        borrower_name TEXT NOT NULL,
        borrower_email TEXT NOT NULL,
        start_date TEXT NOT NULL,
        due_date TEXT NOT NULL,
        status TEXT NOT NULL,
        FOREIGN KEY (book_id) REFERENCES books(id)
      )
    `);

    // TABLE: sales
    sqlite.run(`
      CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        book_id INTEGER NOT NULL,
        buyer_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        total_price REAL NOT NULL,
        sale_date TEXT NOT NULL,
        FOREIGN KEY (book_id) REFERENCES books(id)
      )
    `);

  });

  // Implementación de db.query para SQLite
  db.query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
      const q = sql.trim().toLowerCase();

      if (q.startsWith('select')) {
        sqlite.all(sql, params, (err, rows) => {
          if (err) return reject(err);
          resolve([rows, []]);
        });
      } else {
        sqlite.run(sql, params, function (err) {
          if (err) return reject(err);
          resolve([{ insertId: this.lastID, affectedRows: this.changes }, []]);
        });
      }
    });
  };

} else {
  // MODO MYSQL (LOCAL)
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  db.query = (...args) => pool.query(...args);
}

module.exports = db;
