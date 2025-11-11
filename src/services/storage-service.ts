import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'path';

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  folderId?: string;
  favicon?: string;
  createdAt: Date;
  tags?: string[];
}

export interface HistoryEntry {
  id: string;
  url: string;
  title: string;
  visitTime: Date;
  visitCount: number;
}

export interface Download {
  id: string;
  url: string;
  filename: string;
  path: string;
  totalBytes: number;
  receivedBytes: number;
  state: 'progressing' | 'completed' | 'cancelled' | 'interrupted';
  startTime: Date;
  endTime?: Date;
}

export interface HistoryOptions {
  limit?: number;
  offset?: number;
  startDate?: Date;
  endDate?: Date;
}

class StorageService {
  private db: Database.Database | null = null;
  private dbPath: string;

  constructor() {
    const userDataPath = app.getPath('userData');
    this.dbPath = path.join(userDataPath, 'wing-browser.db');
  }

  initialize(): void {
    this.db = new Database(this.dbPath);
    this.db.pragma('journal_mode = WAL');
    this.createTables();
    this.runMigrations();
  }

  private createTables(): void {
    if (!this.db) return;

    // Bookmarks table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS bookmarks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        folder_id TEXT,
        favicon TEXT,
        created_at INTEGER NOT NULL,
        tags TEXT
      )
    `);

    // Bookmark folders table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS bookmark_folders (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        parent_id TEXT,
        created_at INTEGER NOT NULL
      )
    `);

    // History table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS history (
        id TEXT PRIMARY KEY,
        url TEXT NOT NULL,
        title TEXT NOT NULL,
        visit_time INTEGER NOT NULL,
        visit_count INTEGER DEFAULT 1
      )
    `);

    // Create index for history queries
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_history_visit_time 
      ON history(visit_time DESC)
    `);

    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_history_url 
      ON history(url)
    `);

    // Settings table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);

    // Downloads table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS downloads (
        id TEXT PRIMARY KEY,
        url TEXT NOT NULL,
        filename TEXT NOT NULL,
        path TEXT NOT NULL,
        total_bytes INTEGER NOT NULL,
        received_bytes INTEGER NOT NULL,
        state TEXT NOT NULL,
        start_time INTEGER NOT NULL,
        end_time INTEGER
      )
    `);
  }

  private runMigrations(): void {
    // Future migrations will go here
    // Example: ALTER TABLE, CREATE INDEX, etc.
  }

  // Bookmarks
  addBookmark(bookmark: Omit<Bookmark, 'id' | 'createdAt'>): Bookmark {
    if (!this.db) throw new Error('Database not initialized');

    const id = this.generateId();
    const createdAt = new Date();
    const tags = bookmark.tags ? JSON.stringify(bookmark.tags) : null;

    const stmt = this.db.prepare(`
      INSERT INTO bookmarks (id, title, url, folder_id, favicon, created_at, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      bookmark.title,
      bookmark.url,
      bookmark.folderId || null,
      bookmark.favicon || null,
      createdAt.getTime(),
      tags
    );

    return {
      id,
      ...bookmark,
      createdAt,
    };
  }

  removeBookmark(id: string): void {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('DELETE FROM bookmarks WHERE id = ?');
    stmt.run(id);
  }

  getBookmarks(folderId?: string): Bookmark[] {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = folderId
      ? this.db.prepare('SELECT * FROM bookmarks WHERE folder_id = ? ORDER BY created_at DESC')
      : this.db.prepare(
          'SELECT * FROM bookmarks WHERE folder_id IS NULL ORDER BY created_at DESC'
        );

    const rows = folderId ? stmt.all(folderId) : stmt.all();

    return rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      url: row.url,
      folderId: row.folder_id,
      favicon: row.favicon,
      createdAt: new Date(row.created_at),
      tags: row.tags ? JSON.parse(row.tags) : undefined,
    }));
  }

  searchBookmarks(query: string): Bookmark[] {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      SELECT * FROM bookmarks 
      WHERE title LIKE ? OR url LIKE ?
      ORDER BY created_at DESC
      LIMIT 50
    `);

    const searchPattern = `%${query}%`;
    const rows = stmt.all(searchPattern, searchPattern);

    return rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      url: row.url,
      folderId: row.folder_id,
      favicon: row.favicon,
      createdAt: new Date(row.created_at),
      tags: row.tags ? JSON.parse(row.tags) : undefined,
    }));
  }

  // History
  addHistoryEntry(entry: Omit<HistoryEntry, 'id' | 'visitCount'>): void {
    if (!this.db) throw new Error('Database not initialized');

    // Check if URL already exists
    const existing = this.db
      .prepare('SELECT id, visit_count FROM history WHERE url = ?')
      .get(entry.url) as any;

    if (existing) {
      // Update existing entry
      this.db
        .prepare(
          `
        UPDATE history 
        SET title = ?, visit_time = ?, visit_count = visit_count + 1
        WHERE id = ?
      `
        )
        .run(entry.title, entry.visitTime.getTime(), existing.id);
    } else {
      // Insert new entry
      const id = this.generateId();
      this.db
        .prepare(
          `
        INSERT INTO history (id, url, title, visit_time, visit_count)
        VALUES (?, ?, ?, ?, 1)
      `
        )
        .run(id, entry.url, entry.title, entry.visitTime.getTime());
    }
  }

  getHistory(options: HistoryOptions = {}): HistoryEntry[] {
    if (!this.db) throw new Error('Database not initialized');

    const { limit = 100, offset = 0, startDate, endDate } = options;

    let query = 'SELECT * FROM history WHERE 1=1';
    const params: any[] = [];

    if (startDate) {
      query += ' AND visit_time >= ?';
      params.push(startDate.getTime());
    }

    if (endDate) {
      query += ' AND visit_time <= ?';
      params.push(endDate.getTime());
    }

    query += ' ORDER BY visit_time DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const stmt = this.db.prepare(query);
    const rows = stmt.all(...params);

    return rows.map((row: any) => ({
      id: row.id,
      url: row.url,
      title: row.title,
      visitTime: new Date(row.visit_time),
      visitCount: row.visit_count,
    }));
  }

  clearHistory(timeRange: 'hour' | 'day' | 'week' | 'month' | 'all'): void {
    if (!this.db) throw new Error('Database not initialized');

    if (timeRange === 'all') {
      this.db.prepare('DELETE FROM history').run();
      return;
    }

    const now = Date.now();
    const ranges = {
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
    };

    const cutoff = now - ranges[timeRange];
    this.db.prepare('DELETE FROM history WHERE visit_time >= ?').run(cutoff);
  }

  searchHistory(query: string): HistoryEntry[] {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      SELECT * FROM history 
      WHERE title LIKE ? OR url LIKE ?
      ORDER BY visit_time DESC
      LIMIT 50
    `);

    const searchPattern = `%${query}%`;
    const rows = stmt.all(searchPattern, searchPattern);

    return rows.map((row: any) => ({
      id: row.id,
      url: row.url,
      title: row.title,
      visitTime: new Date(row.visit_time),
      visitCount: row.visit_count,
    }));
  }

  // Settings
  getSetting<T>(key: string): T | null {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('SELECT value FROM settings WHERE key = ?');
    const row = stmt.get(key) as any;

    if (!row) return null;

    try {
      return JSON.parse(row.value);
    } catch {
      return row.value as T;
    }
  }

  setSetting<T>(key: string, value: T): void {
    if (!this.db) throw new Error('Database not initialized');

    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    const now = Date.now();

    const stmt = this.db.prepare(`
      INSERT INTO settings (key, value, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = ?
    `);

    stmt.run(key, serialized, now, serialized, now);
  }

  // Downloads
  addDownload(download: Omit<Download, 'id'>): Download {
    if (!this.db) throw new Error('Database not initialized');

    const id = this.generateId();

    const stmt = this.db.prepare(`
      INSERT INTO downloads (id, url, filename, path, total_bytes, received_bytes, state, start_time, end_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      download.url,
      download.filename,
      download.path,
      download.totalBytes,
      download.receivedBytes,
      download.state,
      download.startTime.getTime(),
      download.endTime ? download.endTime.getTime() : null
    );

    return { id, ...download };
  }

  updateDownload(id: string, updates: Partial<Download>): void {
    if (!this.db) throw new Error('Database not initialized');

    const fields: string[] = [];
    const values: any[] = [];

    if (updates.receivedBytes !== undefined) {
      fields.push('received_bytes = ?');
      values.push(updates.receivedBytes);
    }

    if (updates.state !== undefined) {
      fields.push('state = ?');
      values.push(updates.state);
    }

    if (updates.endTime !== undefined) {
      fields.push('end_time = ?');
      values.push(updates.endTime.getTime());
    }

    if (fields.length === 0) return;

    values.push(id);
    const stmt = this.db.prepare(`UPDATE downloads SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values);
  }

  getDownloads(): Download[] {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('SELECT * FROM downloads ORDER BY start_time DESC LIMIT 100');
    const rows = stmt.all();

    return rows.map((row: any) => ({
      id: row.id,
      url: row.url,
      filename: row.filename,
      path: row.path,
      totalBytes: row.total_bytes,
      receivedBytes: row.received_bytes,
      state: row.state,
      startTime: new Date(row.start_time),
      endTime: row.end_time ? new Date(row.end_time) : undefined,
    }));
  }

  // Utility
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Backup and restore
  backup(backupPath: string): void {
    if (!this.db) throw new Error('Database not initialized');
    this.db.backup(backupPath);
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// Singleton instance
export const storageService = new StorageService();
