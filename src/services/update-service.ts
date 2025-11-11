import { autoUpdater } from 'electron-updater';
import { app, BrowserWindow } from 'electron';

export interface UpdateInfo {
  version: string;
  releaseDate: string;
  releaseNotes: string;
}

export interface UpdateProgress {
  percent: number;
  bytesPerSecond: number;
  transferred: number;
  total: number;
}

class UpdateService {
  private mainWindow: BrowserWindow | null = null;
  private updateAvailable: boolean = false;
  private updateInfo: UpdateInfo | null = null;

  initialize(window: BrowserWindow) {
    this.mainWindow = window;
    this.setupAutoUpdater();
  }

  private setupAutoUpdater() {
    // Configure auto-updater
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;

    // Check for updates on startup (after 10 seconds)
    setTimeout(() => {
      this.checkForUpdates();
    }, 10000);

    // Set up event listeners
    autoUpdater.on('checking-for-update', () => {
      this.sendToRenderer('update:checking');
    });

    autoUpdater.on('update-available', (info) => {
      this.updateAvailable = true;
      this.updateInfo = {
        version: info.version,
        releaseDate: info.releaseDate,
        releaseNotes: this.formatReleaseNotes(info.releaseNotes as string),
      };
      this.sendToRenderer('update:available', this.updateInfo);
    });

    autoUpdater.on('update-not-available', () => {
      this.updateAvailable = false;
      this.sendToRenderer('update:not-available');
    });

    autoUpdater.on('error', (error) => {
      console.error('Update error:', error);
      this.sendToRenderer('update:error', error.message);
    });

    autoUpdater.on('download-progress', (progress) => {
      const updateProgress: UpdateProgress = {
        percent: progress.percent,
        bytesPerSecond: progress.bytesPerSecond,
        transferred: progress.transferred,
        total: progress.total,
      };
      this.sendToRenderer('update:download-progress', updateProgress);
    });

    autoUpdater.on('update-downloaded', (info) => {
      this.sendToRenderer('update:downloaded', {
        version: info.version,
        releaseNotes: this.formatReleaseNotes(info.releaseNotes as string),
      });
    });
  }

  async checkForUpdates(): Promise<void> {
    if (app.isPackaged) {
      try {
        await autoUpdater.checkForUpdates();
      } catch (error) {
        console.error('Failed to check for updates:', error);
      }
    } else {
      console.log('Skipping update check in development mode');
    }
  }

  async downloadUpdate(): Promise<void> {
    if (this.updateAvailable) {
      try {
        await autoUpdater.downloadUpdate();
      } catch (error) {
        console.error('Failed to download update:', error);
        this.sendToRenderer('update:error', 'Failed to download update');
      }
    }
  }

  quitAndInstall(): void {
    autoUpdater.quitAndInstall(false, true);
  }

  getUpdateInfo(): UpdateInfo | null {
    return this.updateInfo;
  }

  isUpdateAvailable(): boolean {
    return this.updateAvailable;
  }

  private formatReleaseNotes(notes: string): string {
    // Format release notes for display
    if (!notes) return 'No release notes available';
    
    // Remove markdown formatting for simple display
    return notes
      .replace(/#{1,6}\s/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .trim();
  }

  private sendToRenderer(channel: string, data?: any) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(channel, data);
    }
  }

  // Format helpers
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  formatSpeed(bytesPerSecond: number): string {
    return this.formatBytes(bytesPerSecond) + '/s';
  }
}

// Singleton instance
export const updateService = new UpdateService();
