import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const dataDir = process.env.DATA_DIR || './data';

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'app.db'));

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    telegram_id TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'CLIENT' -- CLIENT, ADMIN, COURIER
  );

  CREATE TABLE IF NOT EXISTS bouquets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    discount_price INTEGER,
    image_url TEXT,
    is_hidden BOOLEAN DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    courier_id INTEGER,
    status TEXT DEFAULT 'PENDING', -- PENDING, PREPARING, DELIVERING, COMPLETED, CANCELLED
    total_price INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (courier_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS order_items (
    order_id INTEGER NOT NULL,
    bouquet_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (order_id) REFERENCES orders (id),
    FOREIGN KEY (bouquet_id) REFERENCES bouquets (id),
    PRIMARY KEY (order_id, bouquet_id)
  );
`);

// Insert default admin if provided
if (process.env.ADMIN_TG_ID) {
  const adminId = process.env.ADMIN_TG_ID;
  const existing = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(adminId);
  if (!existing) {
      db.prepare('INSERT INTO users (telegram_id, name, role) VALUES (?, ?, ?)').run(adminId, 'Admin', 'ADMIN');
  } else if (existing.role !== 'ADMIN') {
      db.prepare('UPDATE users SET role = ? WHERE telegram_id = ?').run('ADMIN', adminId);
  }
}

export default db;
