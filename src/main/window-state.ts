import { BrowserWindow, screen } from 'electron';
import Store from 'electron-store';

interface WindowState {
  x?: number;
  y?: number;
  width: number;
  height: number;
  isMaximized: boolean;
}

const store = new Store<{ windowState: WindowState }>();

export function getWindowState(): WindowState {
  const defaultState: WindowState = {
    width: 1200,
    height: 800,
    isMaximized: false,
  };

  const savedState = store.get('windowState', defaultState);

  // Ensure window is visible on screen
  const { bounds } = screen.getPrimaryDisplay();
  if (
    savedState.x !== undefined &&
    savedState.y !== undefined &&
    (savedState.x < bounds.x ||
      savedState.y < bounds.y ||
      savedState.x + savedState.width > bounds.x + bounds.width ||
      savedState.y + savedState.height > bounds.y + bounds.height)
  ) {
    // Window is off-screen, reset position
    delete savedState.x;
    delete savedState.y;
  }

  return savedState;
}

export function saveWindowState(window: BrowserWindow) {
  const bounds = window.getBounds();
  const isMaximized = window.isMaximized();

  const state: WindowState = {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    isMaximized,
  };

  store.set('windowState', state);
}

export function trackWindowState(window: BrowserWindow) {
  // Save state on resize and move
  let saveTimeout: NodeJS.Timeout;

  const saveState = () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      saveWindowState(window);
    }, 500);
  };

  window.on('resize', saveState);
  window.on('move', saveState);
  window.on('maximize', saveState);
  window.on('unmaximize', saveState);

  // Save state before closing
  window.on('close', () => {
    clearTimeout(saveTimeout);
    saveWindowState(window);
  });
}
