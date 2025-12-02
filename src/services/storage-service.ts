import Store from 'electron-store';

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
  private store: Store<{
    bookmarks: Bookmark[];
    history: HistoryEntry[];
    downloads: Download[];
    settings: Record<string, any>;
  }>;

  constructor() {
    this.store = new Store<{
      bookmarks: Bookmark[];
      history: HistoryEntry[];
      downloads: Download[];
      settings: Record<string, any>;
    }>({
      name: 'wing-browser',
      defaults: {
        bookmarks: [] as Bookmark[],
        history: [] as HistoryEntry[],
        downloads: [] as Download[],
        settings: {} as Record<string, any>
      }
    });
  }

  initialize(): void {
    // No initialization needed for electron-store
  }



  // Bookmarks
  addBookmark(bookmark: Omit<Bookmark, 'id' | 'createdAt'>): Bookmark {
    const id = this.generateId();
    const createdAt = new Date();
    const newBookmark: Bookmark = {
      id,
      ...bookmark,
      createdAt,
    };

    const bookmarks = this.store.get('bookmarks');
    bookmarks.push(newBookmark);
    this.store.set('bookmarks', bookmarks);

    return newBookmark;
  }

  removeBookmark(id: string): void {
    const bookmarks = this.store.get('bookmarks');
    const filteredBookmarks = bookmarks.filter(b => b.id !== id);
    this.store.set('bookmarks', filteredBookmarks);
  }

  getBookmarks(folderId?: string): Bookmark[] {
    const bookmarks = this.store.get('bookmarks', []);
    if (folderId) {
      return bookmarks.filter(b => b.folderId === folderId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    return bookmarks.filter(b => !b.folderId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  searchBookmarks(query: string): Bookmark[] {
    const bookmarks = this.store.get('bookmarks', []);
    const searchPattern = query.toLowerCase();
    return bookmarks
      .filter(b =>
        b.title.toLowerCase().includes(searchPattern) ||
        b.url.toLowerCase().includes(searchPattern)
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 50);
  }

  // History
  addHistoryEntry(entry: Omit<HistoryEntry, 'id' | 'visitCount'>): void {
    const history = this.store.get('history');
    const existingIndex = history.findIndex(h => h.url === entry.url);

    if (existingIndex !== -1) {
      // Update existing entry
      history[existingIndex] = {
        ...history[existingIndex],
        title: entry.title,
        visitTime: entry.visitTime,
        visitCount: history[existingIndex].visitCount + 1,
      };
    } else {
      // Insert new entry
      const id = this.generateId();
      const newEntry: HistoryEntry = {
        id,
        ...entry,
        visitCount: 1,
      };
      history.push(newEntry);
    }

    this.store.set('history', history);
  }

  getHistory(options: HistoryOptions = {}): HistoryEntry[] {
    const { limit = 100, offset = 0, startDate, endDate } = options;
    let history = this.store.get('history', []);

    // Filter by date range
    if (startDate) {
      history = history.filter(h => h.visitTime >= startDate);
    }
    if (endDate) {
      history = history.filter(h => h.visitTime <= endDate);
    }

    // Sort by visit time descending
    history.sort((a, b) => b.visitTime.getTime() - a.visitTime.getTime());

    // Apply pagination
    return history.slice(offset, offset + limit);
  }

  clearHistory(timeRange: 'hour' | 'day' | 'week' | 'month' | 'all'): void {
    if (timeRange === 'all') {
      this.store.set('history', []);
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
    const history = this.store.get('history');
    const filteredHistory = history.filter(h => h.visitTime.getTime() >= cutoff);
    this.store.set('history', filteredHistory);
  }

  searchHistory(query: string): HistoryEntry[] {
    const history = this.store.get('history', []);
    const searchPattern = query.toLowerCase();
    return history
      .filter(h =>
        h.title.toLowerCase().includes(searchPattern) ||
        h.url.toLowerCase().includes(searchPattern)
      )
      .sort((a, b) => b.visitTime.getTime() - a.visitTime.getTime())
      .slice(0, 50);
  }

  // Settings
  getSetting<T>(key: string): T | null {
    const settings = this.store.get('settings');
    return settings[key] || null;
  }

  setSetting<T>(key: string, value: T): void {
    const settings = this.store.get('settings');
    settings[key] = value;
    this.store.set('settings', settings);
  }

  // Downloads
  addDownload(download: Omit<Download, 'id'>): Download {
    const id = this.generateId();
    const downloads = this.store.get('downloads');
    const newDownload = { id, ...download };
    downloads.push(newDownload);
    this.store.set('downloads', downloads);
    return newDownload;
  }

  updateDownload(id: string, updates: Partial<Download>): void {
    const downloads = this.store.get('downloads');
    const index = downloads.findIndex(d => d.id === id);
    if (index !== -1) {
      downloads[index] = { ...downloads[index], ...updates };
      this.store.set('downloads', downloads);
    }
  }

  getDownloads(): Download[] {
    return this.store.get('downloads')
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, 100);
  }

  // Utility
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Backup and restore
  backup(_backupPath: string): void {
    // For electron-store, backup is handled automatically
    // We could implement custom backup logic here if needed
    console.log('Backup not implemented for electron-store');
  }

  close(): void {
    // No need to close electron-store
  }
}

// Singleton instance
export const storageService = new StorageService();
