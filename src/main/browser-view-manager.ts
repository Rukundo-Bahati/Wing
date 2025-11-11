import { BrowserView, BrowserWindow } from 'electron';

interface ViewBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

class BrowserViewManager {
  private views: Map<string, BrowserView> = new Map();
  private activeViewId: string | null = null;
  private window: BrowserWindow | null = null;

  setWindow(window: BrowserWindow) {
    this.window = window;
  }

  createView(tabId: string, url: string): BrowserView {
    const view = new BrowserView({
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        webSecurity: true,
      },
    });

    // Set initial bounds (will be updated)
    const bounds = this.calculateBounds();
    view.setBounds(bounds);

    // Auto-resize with window
    view.setAutoResize({
      width: true,
      height: true,
    });

    // Load URL
    view.webContents.loadURL(url);

    // Handle navigation events
    view.webContents.on('did-start-loading', () => {
      this.window?.webContents.send('tab:loading-start', tabId);
    });

    view.webContents.on('did-finish-load', () => {
      const title = view.webContents.getTitle();
      this.window?.webContents.send('tab:loading-complete', {
        tabId,
        title,
        url: view.webContents.getURL(),
      });
    });

    view.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
      this.window?.webContents.send('tab:loading-error', {
        tabId,
        error: errorDescription,
        code: errorCode,
      });
    });

    view.webContents.on('page-title-updated', (_event, title) => {
      this.window?.webContents.send('tab:title-update', { tabId, title });
    });

    view.webContents.on('page-favicon-updated', (_event, favicons) => {
      if (favicons.length > 0) {
        this.window?.webContents.send('tab:favicon-update', {
          tabId,
          favicon: favicons[0],
        });
      }
    });

    // Handle new window requests
    view.webContents.setWindowOpenHandler(({ url }) => {
      this.window?.webContents.send('tab:new-window-request', url);
      return { action: 'deny' };
    });

    this.views.set(tabId, view);
    return view;
  }

  showView(tabId: string): void {
    if (!this.window) return;

    const view = this.views.get(tabId);
    if (!view) return;

    // Hide current view
    if (this.activeViewId && this.activeViewId !== tabId) {
      const currentView = this.views.get(this.activeViewId);
      if (currentView) {
        this.window.removeBrowserView(currentView);
      }
    }

    // Show new view
    this.window.addBrowserView(view);
    const bounds = this.calculateBounds();
    view.setBounds(bounds);

    this.activeViewId = tabId;
  }

  hideView(tabId: string): void {
    if (!this.window) return;

    const view = this.views.get(tabId);
    if (view) {
      this.window.removeBrowserView(view);
    }

    if (this.activeViewId === tabId) {
      this.activeViewId = null;
    }
  }

  destroyView(tabId: string): void {
    const view = this.views.get(tabId);
    if (view) {
      if (this.window) {
        this.window.removeBrowserView(view);
      }
      // @ts-ignore - webContents.destroy() exists
      view.webContents.destroy();
      this.views.delete(tabId);
    }

    if (this.activeViewId === tabId) {
      this.activeViewId = null;
    }
  }

  navigateTo(tabId: string, url: string): void {
    const view = this.views.get(tabId);
    if (view) {
      view.webContents.loadURL(url);
    }
  }

  goBack(tabId: string): void {
    const view = this.views.get(tabId);
    if (view && view.webContents.canGoBack()) {
      view.webContents.goBack();
    }
  }

  goForward(tabId: string): void {
    const view = this.views.get(tabId);
    if (view && view.webContents.canGoForward()) {
      view.webContents.goForward();
    }
  }

  reload(tabId: string): void {
    const view = this.views.get(tabId);
    if (view) {
      view.webContents.reload();
    }
  }

  stop(tabId: string): void {
    const view = this.views.get(tabId);
    if (view) {
      view.webContents.stop();
    }
  }

  setZoom(tabId: string, zoomLevel: number): void {
    const view = this.views.get(tabId);
    if (view) {
      view.webContents.setZoomLevel(zoomLevel);
    }
  }

  private calculateBounds(): ViewBounds {
    if (!this.window) {
      return { x: 0, y: 0, width: 800, height: 600 };
    }

    const windowBounds = this.window.getBounds();
    // Account for tab bar (40px) + toolbar (52px) + address bar (52px) = 144px
    const topOffset = 144;

    return {
      x: 0,
      y: topOffset,
      width: windowBounds.width,
      height: windowBounds.height - topOffset,
    };
  }

  updateBounds(): void {
    if (!this.activeViewId) return;

    const view = this.views.get(this.activeViewId);
    if (view) {
      const bounds = this.calculateBounds();
      view.setBounds(bounds);
    }
  }
}

export const browserViewManager = new BrowserViewManager();
