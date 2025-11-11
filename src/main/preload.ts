import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  maximizeWindow: () => ipcRenderer.send('window:maximize'),
  closeWindow: () => ipcRenderer.send('window:close'),

  // Navigation
  navigateTo: (url: string) => ipcRenderer.send('navigation:go', url),
  goBack: () => ipcRenderer.send('navigation:back'),
  goForward: () => ipcRenderer.send('navigation:forward'),
  reload: () => ipcRenderer.send('navigation:reload'),
  stop: () => ipcRenderer.send('navigation:stop'),

  // Tabs
  createTab: (url: string) => ipcRenderer.send('tab:create', url),
  closeTab: (tabId: string) => ipcRenderer.send('tab:close', tabId),
  switchTab: (tabId: string) => ipcRenderer.send('tab:switch', tabId),

  // Event listeners
  onTabUpdate: (callback: (tab: any) => void) => {
    ipcRenderer.on('tab:update', (_event, tab) => callback(tab));
  },
  onNavigationUpdate: (callback: (data: any) => void) => {
    ipcRenderer.on('navigation:update', (_event, data) => callback(data));
  },

  // Spellchecker
  checkWord: (word: string, language: string) => ipcRenderer.invoke('spellcheck:check-word', word, language),
  getSuggestions: (word: string, language: string) => ipcRenderer.invoke('spellcheck:get-suggestions', word, language),
  addWordToDictionary: (word: string, language: string) => ipcRenderer.send('spellcheck:add-word', word, language),
  removeWordFromDictionary: (word: string, language: string) => ipcRenderer.send('spellcheck:remove-word', word, language),
  checkText: (text: string, language: string) => ipcRenderer.invoke('spellcheck:check-text', text, language),
});

// Type definitions for TypeScript
declare global {
  interface Window {
    electronAPI: {
      minimizeWindow: () => void;
      maximizeWindow: () => void;
      closeWindow: () => void;
      navigateTo: (url: string) => void;
      goBack: () => void;
      goForward: () => void;
      reload: () => void;
      stop: () => void;
      createTab: (url: string) => void;
      closeTab: (tabId: string) => void;
      switchTab: (tabId: string) => void;
      onTabUpdate: (callback: (tab: any) => void) => void;
      onNavigationUpdate: (callback: (data: any) => void) => void;
      checkWord: (word: string, language: string) => Promise<boolean>;
      getSuggestions: (word: string, language: string) => Promise<string[]>;
      addWordToDictionary: (word: string, language: string) => void;
      removeWordFromDictionary: (word: string, language: string) => void;
      checkText: (text: string, language: string) => Promise<Array<{ word: string; correct: boolean; index: number }>>;
    };
  }
}
