import { tabManager } from './tab-manager';

interface NavigationEntry {
  url: string;
  title: string;
  timestamp: Date;
}

interface NavigationHistory {
  entries: NavigationEntry[];
  currentIndex: number;
}

class NavigationControllerService {
  private histories: Map<string, NavigationHistory> = new Map();

  navigateTo(url: string, tabId: string): void {
    // Validate URL
    const validatedUrl = this.validateUrl(url);
    if (!validatedUrl) {
      console.error('Invalid URL:', url);
      return;
    }

    const tab = tabManager.getTab(tabId);
    if (!tab) {
      console.error('Tab not found:', tabId);
      return;
    }

    // Update tab state
    tabManager.updateTab(tabId, {
      url: validatedUrl,
      loading: true,
    });

    // Add to history
    this.addToHistory(tabId, validatedUrl, 'Loading...');

    // Update navigation buttons
    this.updateNavigationState(tabId);

    // TODO: Load URL in webview (Task 5.3)
    console.log('Navigate to:', validatedUrl);

    // Simulate page load completion
    setTimeout(() => {
      tabManager.updateTab(tabId, {
        loading: false,
        title: this.getTitleFromUrl(validatedUrl),
      });
    }, 500);
  }

  goBack(tabId: string): void {
    const history = this.histories.get(tabId);
    if (!history || history.currentIndex <= 0) return;

    history.currentIndex--;
    const entry = history.entries[history.currentIndex];

    tabManager.updateTab(tabId, {
      url: entry.url,
      title: entry.title,
      loading: true,
    });

    this.updateNavigationState(tabId);

    // TODO: Load URL in webview
    setTimeout(() => {
      tabManager.updateTab(tabId, { loading: false });
    }, 300);
  }

  goForward(tabId: string): void {
    const history = this.histories.get(tabId);
    if (!history || history.currentIndex >= history.entries.length - 1) return;

    history.currentIndex++;
    const entry = history.entries[history.currentIndex];

    tabManager.updateTab(tabId, {
      url: entry.url,
      title: entry.title,
      loading: true,
    });

    this.updateNavigationState(tabId);

    // TODO: Load URL in webview
    setTimeout(() => {
      tabManager.updateTab(tabId, { loading: false });
    }, 300);
  }

  reload(tabId: string): void {
    const tab = tabManager.getTab(tabId);
    if (!tab) return;

    tabManager.updateTab(tabId, { loading: true });

    // TODO: Reload in webview
    console.log('Reload:', tab.url);

    setTimeout(() => {
      tabManager.updateTab(tabId, { loading: false });
    }, 500);
  }

  stop(tabId: string): void {
    const tab = tabManager.getTab(tabId);
    if (!tab) return;

    tabManager.updateTab(tabId, { loading: false });

    // TODO: Stop loading in webview
    console.log('Stop loading:', tab.url);
  }

  search(query: string): string {
    // Default search engine (Google for now, will be configurable in Task 8)
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    return searchUrl;
  }

  private validateUrl(url: string): string | null {
    // Handle special URLs
    if (url.startsWith('wing://')) {
      return url;
    }

    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    // Validate URL format
    try {
      new URL(url);
      return url;
    } catch {
      return null;
    }
  }

  private addToHistory(tabId: string, url: string, title: string): void {
    let history = this.histories.get(tabId);

    if (!history) {
      history = {
        entries: [],
        currentIndex: -1,
      };
      this.histories.set(tabId, history);
    }

    // Remove forward history if navigating from middle of history
    if (history.currentIndex < history.entries.length - 1) {
      history.entries = history.entries.slice(0, history.currentIndex + 1);
    }

    // Add new entry
    history.entries.push({
      url,
      title,
      timestamp: new Date(),
    });

    history.currentIndex = history.entries.length - 1;

    // Limit history size
    const MAX_HISTORY = 50;
    if (history.entries.length > MAX_HISTORY) {
      history.entries.shift();
      history.currentIndex--;
    }
  }

  private updateNavigationState(tabId: string): void {
    const history = this.histories.get(tabId);
    if (!history) return;

    const canGoBack = history.currentIndex > 0;
    const canGoForward = history.currentIndex < history.entries.length - 1;

    tabManager.updateTab(tabId, {
      canGoBack,
      canGoForward,
    });
  }

  private getTitleFromUrl(url: string): string {
    if (url.startsWith('wing://')) {
      return 'New Tab';
    }

    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url;
    }
  }

  getHistory(tabId: string): NavigationEntry[] {
    const history = this.histories.get(tabId);
    return history ? [...history.entries] : [];
  }

  clearHistory(tabId: string): void {
    this.histories.delete(tabId);
    tabManager.updateTab(tabId, {
      canGoBack: false,
      canGoForward: false,
    });
  }

  // Handle navigation errors
  handleNavigationError(tabId: string, error: string): void {
    const errorMessages: Record<string, string> = {
      ERR_CONNECTION_REFUSED: 'Ntibyashobotse guhuza na seriveri',
      ERR_NAME_NOT_RESOLVED: 'Ntibyashobotse kubona izina rya domaine',
      ERR_INTERNET_DISCONNECTED: 'Nta murongo wa interineti',
      ERR_CONNECTION_TIMED_OUT: "Igihe cy'uguhuza cyarengeje",
    };

    const message = errorMessages[error] || error;

    tabManager.updateTab(tabId, {
      loading: false,
      title: 'Error',
    });

    console.error('Navigation error:', message);
    // TODO: Show error page in webview
  }
}

// Singleton instance
export const navigationController = new NavigationControllerService();
