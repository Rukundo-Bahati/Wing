import { ipcMain, BrowserWindow } from 'electron';
import { spellcheckerService } from '../services/spellchecker-service';

export function setupIpcHandlers() {
  // Initialize spellchecker
  spellcheckerService.initialize();
  // Window controls
  ipcMain.on('window:minimize', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    window?.minimize();
  });

  ipcMain.on('window:maximize', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window?.isMaximized()) {
      window.unmaximize();
    } else {
      window?.maximize();
    }
  });

  ipcMain.on('window:close', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    window?.close();
  });

  // Navigation handlers
  ipcMain.on('navigation:go', (_event, data: { url: string; tabId: string }) => {
    console.log('Navigate to:', data.url, 'in tab:', data.tabId);
    // Navigation will be handled by renderer for now
    // In production, use browserViewManager.navigateTo(data.tabId, data.url)
  });

  ipcMain.on('navigation:back', (_event, tabId: string) => {
    console.log('Navigate back in tab:', tabId);
    // In production, use browserViewManager.goBack(tabId)
  });

  ipcMain.on('navigation:forward', (_event, tabId: string) => {
    console.log('Navigate forward in tab:', tabId);
    // In production, use browserViewManager.goForward(tabId)
  });

  ipcMain.on('navigation:reload', (_event, tabId: string) => {
    console.log('Reload tab:', tabId);
    // In production, use browserViewManager.reload(tabId)
  });

  ipcMain.on('navigation:stop', (_event, tabId: string) => {
    console.log('Stop loading tab:', tabId);
    // In production, use browserViewManager.stop(tabId)
  });

  // Tab handlers
  ipcMain.on('tab:create', (_event, url: string) => {
    console.log('Create tab:', url);
    // Tab creation handled in renderer
  });

  ipcMain.on('tab:close', (_event, tabId: string) => {
    console.log('Close tab:', tabId);
    // Tab closing handled in renderer
    // In production, also call browserViewManager.destroyView(tabId)
  });

  ipcMain.on('tab:switch', (_event, tabId: string) => {
    console.log('Switch to tab:', tabId);
    // In production, use browserViewManager.showView(tabId)
  });

  // Spellchecker handlers
  ipcMain.handle('spellcheck:check-word', (_event, word: string, language: string) => {
    return spellcheckerService.checkWord(word, language);
  });

  ipcMain.handle('spellcheck:get-suggestions', (_event, word: string, language: string) => {
    return spellcheckerService.getSuggestions(word, language);
  });

  ipcMain.on('spellcheck:add-word', (_event, word: string, language: string) => {
    spellcheckerService.addToDictionary(word, language);
  });

  ipcMain.on('spellcheck:remove-word', (_event, word: string, language: string) => {
    spellcheckerService.removeFromDictionary(word, language);
  });

  ipcMain.handle('spellcheck:check-text', (_event, text: string, language: string) => {
    return spellcheckerService.checkText(text, language);
  });
}
