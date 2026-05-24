import * as SQLite from 'expo-sqlite';
import { DB_NAME } from '../../constants/config';

let _db: SQLite.SQLiteDatabase | null = null;

// Open (or create) the database and run migrations
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;
  _db = await SQLite.openDatabaseAsync(DB_NAME);
  await migrate(_db);
  return _db;
}

// Run all DDL statements to set up tables
async function migrate(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS assignments (
      id          TEXT PRIMARY KEY NOT NULL,
      title       TEXT NOT NULL,
      subject     TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      dueDate     TEXT NOT NULL,
      priority    TEXT NOT NULL DEFAULT 'Medium',
      status      TEXT NOT NULL DEFAULT 'Pending',
      notes       TEXT NOT NULL DEFAULT '',
      imageUri    TEXT,
      userId      TEXT NOT NULL,
      createdAt   TEXT NOT NULL,
      updatedAt   TEXT NOT NULL,
      syncStatus  TEXT NOT NULL DEFAULT 'synced'
    );

    CREATE TABLE IF NOT EXISTS study_locations (
      id          TEXT PRIMARY KEY NOT NULL,
      name        TEXT NOT NULL,
      latitude    REAL NOT NULL,
      longitude   REAL NOT NULL,
      description TEXT,
      userId      TEXT NOT NULL,
      createdAt   TEXT NOT NULL,
      syncStatus  TEXT NOT NULL DEFAULT 'synced'
    );

    CREATE TABLE IF NOT EXISTS notes (
      id           TEXT PRIMARY KEY NOT NULL,
      title        TEXT NOT NULL,
      content      TEXT NOT NULL DEFAULT '',
      audioUri     TEXT,
      assignmentId TEXT,
      userId       TEXT NOT NULL,
      createdAt    TEXT NOT NULL,
      updatedAt    TEXT NOT NULL,
      syncStatus   TEXT NOT NULL DEFAULT 'synced'
    );

    CREATE TABLE IF NOT EXISTS sync_queue (
      id         TEXT PRIMARY KEY NOT NULL,
      operation  TEXT NOT NULL,
      tableName  TEXT NOT NULL,
      data       TEXT NOT NULL,
      createdAt  TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_assignments_userId ON assignments(userId);
    CREATE INDEX IF NOT EXISTS idx_assignments_dueDate ON assignments(dueDate);
    CREATE INDEX IF NOT EXISTS idx_notes_userId ON notes(userId);
  `);
  // Additive migration for existing databases — silently ignored if column already exists
  await db.execAsync(`ALTER TABLE notes ADD COLUMN audioUri TEXT;`).catch(() => {});
}

export async function closeDatabase(): Promise<void> {
  if (_db) {
    await _db.closeAsync();
    _db = null;
  }
}
