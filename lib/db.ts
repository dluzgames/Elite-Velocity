import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'elite_velocity.db');
const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    data TEXT NOT NULL,
    FOREIGN KEY(userId) REFERENCES users(id)
  );
`);

export default db;
