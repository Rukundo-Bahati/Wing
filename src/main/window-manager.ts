import { BrowserWindow } from 'electron';
import path from 'path';
import { getWindowState, trackWindowState } from './window-state';

export class WindowManager {
  private windows: Map<string, BrowserWindow> = new Map();

  createWindow(options?: { incognito?: boolean }): BrowserWindow {
    const windowState = getWindowState();

    const window = new BrowserWindow({
      x: windowState.x,
      y: windowState.y,
      width: windowState.width,
      height: windowState.height,
      title: 'Wing Browser',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        preload: path.join(__dirname, 'preload.js'),
      },
      show: false,
      backgroundColor: options?.incognito ? '#1a1a1a' : '#ffffff',
    });

    // Restore maximized state
    if (windowState.isMaximized) {
      window.maximize();
    }

    // Track window state changes
    trackWindowState(window);

    // Load the app
    if (process.env.NODE_ENV === 'development') {
      window.loadURL('http://localhost:5173');
      window.webContents.openDevTools();
    } else {
      window.loadFile(path.join(__dirname, '../renderer/index.html'));
    }

    // Show window when ready
    window.once('ready-to-show', () => {
      window.show();
    });

    // Store window reference
    const windowId = `window-${Date.now()}`;
    this.windows.set(windowId, window);

    // Remove from map when closed
    window.on('closed', () => {
      this.windows.delete(windowId);
    });

    return window;
  }

  getAllWindows(): BrowserWindow[] {
    return Array.from(this.windows.values());
  }

  getFocusedWindow(): BrowserWindow | null {
    return BrowserWindow.getFocusedWindow();
  }

  closeWindow(windowId: string): void {
    const window = this.windows.get(windowId);
    window?.close();
  }

  minimizeWindow(windowId: string): void {
    const window = this.windows.get(windowId);
    window?.minimize();
  }

  maximizeWindow(windowId: string): void {
    const window = this.windows.get(windowId);
    if (window?.isMaximized()) {
      window.unmaximize();
    } else {
      window?.maximize();
    }
  }
}

// Singleton instance
export const windowManager = new WindowManager();
