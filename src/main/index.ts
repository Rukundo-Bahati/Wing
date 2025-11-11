import { app, BrowserWindow } from 'electron';
import { setupIpcHandlers } from './ipc-handlers';
import { windowManager } from './window-manager';
import { createApplicationMenu } from './menu';

// App lifecycle
app.whenReady().then(() => {
  setupIpcHandlers();
  createApplicationMenu();
  windowManager.createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      windowManager.createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
