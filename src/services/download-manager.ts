import { app } from 'electron';
import path from 'path';
import { storageService, Download } from './storage-service';
import { securityService } from './security-service';

export interface DownloadProgress {
  id: string;
  filename: string;
  totalBytes: number;
  receivedBytes: number;
  progress: number;
  speed: number;
  state: 'progressing' | 'completed' | 'cancelled' | 'interrupted' | 'paused';
}

class DownloadManager {
  private activeDownloads: Map<string, DownloadProgress> = new Map();
  private listeners: Set<(downloads: DownloadProgress[]) => void> = new Set();
  private downloadPath: string;

  constructor() {
    this.downloadPath = app.getPath('downloads');
  }

  async startDownload(url: string, filename?: string): Promise<string> {
    const downloadId = this.generateId();
    
    // Extract filename from URL if not provided
    if (!filename) {
      const urlObj = new URL(url);
      filename = path.basename(urlObj.pathname) || 'download';
    }

    // Security check
    const securityCheck = await securityService.scanDownload(filename);
    if (!securityCheck.safe) {
      throw new Error(`Download blocked: ${securityCheck.threat}`);
    }

    const downloadPath = path.join(this.downloadPath, filename);

    // Create download record
    const download: DownloadProgress = {
      id: downloadId,
      filename,
      totalBytes: 0,
      receivedBytes: 0,
      progress: 0,
      speed: 0,
      state: 'progressing',
    };

    this.activeDownloads.set(downloadId, download);

    // Save to storage
    storageService.addDownload({
      url,
      filename,
      path: downloadPath,
      totalBytes: 0,
      receivedBytes: 0,
      state: 'progressing',
      startTime: new Date(),
    });

    this.notifyListeners();
    return downloadId;
  }

  updateDownloadProgress(
    downloadId: string,
    receivedBytes: number,
    totalBytes: number,
    speed: number
  ): void {
    const download = this.activeDownloads.get(downloadId);
    if (!download) return;

    download.receivedBytes = receivedBytes;
    download.totalBytes = totalBytes;
    download.progress = totalBytes > 0 ? (receivedBytes / totalBytes) * 100 : 0;
    download.speed = speed;

    // Update storage
    storageService.updateDownload(downloadId, {
      receivedBytes,
      totalBytes,
    });

    this.notifyListeners();
  }

  completeDownload(downloadId: string): void {
    const download = this.activeDownloads.get(downloadId);
    if (!download) return;

    download.state = 'completed';
    download.progress = 100;

    // Update storage
    storageService.updateDownload(downloadId, {
      state: 'completed',
      endTime: new Date(),
    });

    this.notifyListeners();
  }

  pauseDownload(downloadId: string): void {
    const download = this.activeDownloads.get(downloadId);
    if (!download) return;

    download.state = 'paused';
    this.notifyListeners();
  }

  resumeDownload(downloadId: string): void {
    const download = this.activeDownloads.get(downloadId);
    if (!download) return;

    download.state = 'progressing';
    this.notifyListeners();
  }

  cancelDownload(downloadId: string): void {
    const download = this.activeDownloads.get(downloadId);
    if (!download) return;

    download.state = 'cancelled';

    // Update storage
    storageService.updateDownload(downloadId, {
      state: 'cancelled',
      endTime: new Date(),
    });

    this.activeDownloads.delete(downloadId);
    this.notifyListeners();
  }

  getActiveDownloads(): DownloadProgress[] {
    return Array.from(this.activeDownloads.values());
  }

  getAllDownloads(): Download[] {
    return storageService.getDownloads();
  }

  clearCompletedDownloads(): void {
    const completed = Array.from(this.activeDownloads.entries())
      .filter(([_, download]) => download.state === 'completed')
      .map(([id]) => id);

    completed.forEach((id) => this.activeDownloads.delete(id));
    this.notifyListeners();
  }

  getDownloadPath(): string {
    return this.downloadPath;
  }

  setDownloadPath(newPath: string): void {
    this.downloadPath = newPath;
  }

  // Format helpers
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  formatSpeed(bytesPerSecond: number): string {
    return this.formatBytes(bytesPerSecond) + '/s';
  }

  formatTimeRemaining(bytesRemaining: number, speed: number): string {
    if (speed === 0) return 'Unknown';
    
    const secondsRemaining = bytesRemaining / speed;
    
    if (secondsRemaining < 60) {
      return `${Math.round(secondsRemaining)}s`;
    } else if (secondsRemaining < 3600) {
      return `${Math.round(secondsRemaining / 60)}m`;
    } else {
      return `${Math.round(secondsRemaining / 3600)}h`;
    }
  }

  // Event listeners
  subscribe(listener: (downloads: DownloadProgress[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const downloads = this.getActiveDownloads();
    this.listeners.forEach((listener) => listener(downloads));
  }

  private generateId(): string {
    return `download-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
export const downloadManager = new DownloadManager();
