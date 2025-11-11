import { Tab } from '../shared/types';
import { v4 as uuidv4 } from 'uuid';

export interface TabSession {
  tabs: Tab[];
  activeTabId: string;
}

class TabManagerService {
  private tabs: Map<string, Tab> = new Map();
  private tabOrder: string[] = [];
  private activeTabId: string | null = null;
  private listeners: Set<(session: TabSession) => void> = new Set();

  constructor() {
    // Initialize with a new tab
    this.createTab('wing://newtab');
  }

  createTab(url: string, options?: { active?: boolean; pinned?: boolean }): Tab {
    const tab: Tab = {
      id: uuidv4(),
      url,
      title: 'New Tab',
      favicon: '🦋',
      loading: false,
      canGoBack: false,
      canGoForward: false,
      isPinned: options?.pinned || false,
      isMuted: false,
    };

    this.tabs.set(tab.id, tab);
    this.tabOrder.push(tab.id);

    if (options?.active !== false) {
      this.activeTabId = tab.id;
    }

    this.notifyListeners();
    return tab;
  }

  closeTab(tabId: string): void {
    const index = this.tabOrder.indexOf(tabId);
    if (index === -1) return;

    this.tabs.delete(tabId);
    this.tabOrder.splice(index, 1);

    // If closing active tab, switch to adjacent tab
    if (this.activeTabId === tabId) {
      if (this.tabOrder.length === 0) {
        // Create a new tab if all tabs are closed
        this.createTab('wing://newtab');
      } else {
        // Switch to the tab to the right, or left if at the end
        const newIndex = Math.min(index, this.tabOrder.length - 1);
        this.activeTabId = this.tabOrder[newIndex];
      }
    }

    this.notifyListeners();
  }

  switchTab(tabId: string): void {
    if (this.tabs.has(tabId)) {
      this.activeTabId = tabId;
      this.notifyListeners();
    }
  }

  getTab(tabId: string): Tab | undefined {
    return this.tabs.get(tabId);
  }

  getActiveTab(): Tab | undefined {
    return this.activeTabId ? this.tabs.get(this.activeTabId) : undefined;
  }

  getAllTabs(): Tab[] {
    return this.tabOrder.map((id) => this.tabs.get(id)!).filter(Boolean);
  }

  updateTab(tabId: string, updates: Partial<Tab>): void {
    const tab = this.tabs.get(tabId);
    if (tab) {
      this.tabs.set(tabId, { ...tab, ...updates });
      this.notifyListeners();
    }
  }

  reloadTab(tabId: string, ignoreCache?: boolean): void {
    const tab = this.tabs.get(tabId);
    if (tab) {
      this.updateTab(tabId, { loading: true });
      // TODO: Trigger actual reload in webview
      console.log('Reload tab:', tabId, 'ignoreCache:', ignoreCache);
    }
  }

  duplicateTab(tabId: string): Tab | undefined {
    const tab = this.tabs.get(tabId);
    if (!tab) return undefined;

    const newTab = this.createTab(tab.url, { active: true });
    return newTab;
  }

  pinTab(tabId: string): void {
    this.updateTab(tabId, { isPinned: true });
  }

  unpinTab(tabId: string): void {
    this.updateTab(tabId, { isPinned: false });
  }

  muteTab(tabId: string): void {
    this.updateTab(tabId, { isMuted: true });
  }

  unmuteTab(tabId: string): void {
    this.updateTab(tabId, { isMuted: false });
  }

  moveTab(fromIndex: number, toIndex: number): void {
    if (
      fromIndex < 0 ||
      fromIndex >= this.tabOrder.length ||
      toIndex < 0 ||
      toIndex >= this.tabOrder.length
    ) {
      return;
    }

    const [movedTabId] = this.tabOrder.splice(fromIndex, 1);
    this.tabOrder.splice(toIndex, 0, movedTabId);
    this.notifyListeners();
  }

  // Session management
  getSession(): TabSession {
    return {
      tabs: this.getAllTabs(),
      activeTabId: this.activeTabId || '',
    };
  }

  restoreSession(session: TabSession): void {
    this.tabs.clear();
    this.tabOrder = [];

    session.tabs.forEach((tab) => {
      this.tabs.set(tab.id, tab);
      this.tabOrder.push(tab.id);
    });

    this.activeTabId = session.activeTabId;
    this.notifyListeners();
  }

  saveSession(): string {
    return JSON.stringify(this.getSession());
  }

  loadSession(sessionData: string): void {
    try {
      const session = JSON.parse(sessionData) as TabSession;
      this.restoreSession(session);
    } catch (error) {
      console.error('Failed to load session:', error);
    }
  }

  // Event listeners
  subscribe(listener: (session: TabSession) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const session = this.getSession();
    this.listeners.forEach((listener) => listener(session));
  }
}

// Singleton instance
export const tabManager = new TabManagerService();
