import { Menu, MenuItemConstructorOptions, app, BrowserWindow } from 'electron';

export function createApplicationMenu() {
  const isMac = process.platform === 'darwin';

  const template: MenuItemConstructorOptions[] = [
    // App Menu (macOS only)
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about' as const },
              { type: 'separator' as const },
              { role: 'services' as const },
              { type: 'separator' as const },
              { role: 'hide' as const },
              { role: 'hideOthers' as const },
              { role: 'unhide' as const },
              { type: 'separator' as const },
              { role: 'quit' as const },
            ],
          },
        ]
      : []),

    // File Menu (Dosiye)
    {
      label: 'Dosiye', // File in Kinyarwanda
      submenu: [
        {
          label: 'Itab nshya', // New Tab
          accelerator: 'CmdOrCtrl+T',
          click: () => {
            const window = BrowserWindow.getFocusedWindow();
            window?.webContents.send('menu:new-tab');
          },
        },
        {
          label: 'Idirishya rishya', // New Window
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            // Will be implemented with window manager
            console.log('New window');
          },
        },
        {
          label: 'Idirishya ry\'ibanga', // Incognito Window
          accelerator: 'CmdOrCtrl+Shift+N',
          click: () => {
            console.log('New incognito window');
          },
        },
        { type: 'separator' },
        {
          label: 'Fungura dosiye...', // Open File
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            console.log('Open file');
          },
        },
        { type: 'separator' },
        {
          label: 'Funga itab', // Close Tab
          accelerator: 'CmdOrCtrl+W',
          click: () => {
            const window = BrowserWindow.getFocusedWindow();
            window?.webContents.send('menu:close-tab');
          },
        },
        {
          label: 'Funga idirishya', // Close Window
          accelerator: 'CmdOrCtrl+Shift+W',
          role: 'close',
        },
        { type: 'separator' },
        ...(!isMac ? [{ role: 'quit' as const }] : []),
      ],
    },

    // Edit Menu (Hindura)
    {
      label: 'Hindura', // Edit
      submenu: [
        { label: 'Subiza', role: 'undo' as const }, // Undo
        { label: 'Ongera', role: 'redo' as const }, // Redo
        { type: 'separator' },
        { label: 'Kata', role: 'cut' as const }, // Cut
        { label: 'Kopi', role: 'copy' as const }, // Copy
        { label: 'Shyiramo', role: 'paste' as const }, // Paste
        { label: 'Siba', role: 'delete' as const }, // Delete
        { type: 'separator' },
        { label: 'Hitamo byose', role: 'selectAll' as const }, // Select All
        { type: 'separator' },
        {
          label: 'Shakisha...', // Find
          accelerator: 'CmdOrCtrl+F',
          click: () => {
            const window = BrowserWindow.getFocusedWindow();
            window?.webContents.send('menu:find');
          },
        },
      ],
    },

    // View Menu (Reba)
    {
      label: 'Reba', // View
      submenu: [
        {
          label: 'inyuma', // Back
          accelerator: 'Alt+Left',
          click: () => {
            const window = BrowserWindow.getFocusedWindow();
            window?.webContents.send('menu:back');
          },
        },
        {
          label: 'imbere', // Forward
          accelerator: 'Alt+Right',
          click: () => {
            const window = BrowserWindow.getFocusedWindow();
            window?.webContents.send('menu:forward');
          },
        },
        {
          label: 'Ongera upakirishe', // Reload
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            const window = BrowserWindow.getFocusedWindow();
            window?.webContents.send('menu:reload');
          },
        },
        {
          label: 'Hagarika', // Stop
          accelerator: 'Esc',
          click: () => {
            const window = BrowserWindow.getFocusedWindow();
            window?.webContents.send('menu:stop');
          },
        },
        { type: 'separator' },
        { label: 'Kora nini', role: 'zoomIn' as const }, // Zoom In
        { label: 'Kora gito', role: 'zoomOut' as const }, // Zoom Out
        { label: 'Garura ingano', role: 'resetZoom' as const }, // Reset Zoom
        { type: 'separator' },
        { label: 'Uzuza ecran', role: 'togglefullscreen' as const }, // Full Screen
      ],
    },

    // Bookmarks Menu (Iby'ingenzi)
    {
      label: 'Iby\'ingenzi', // Bookmarks
      submenu: [
        {
          label: 'Bika uyu rupapuro', // Bookmark This Page
          accelerator: 'CmdOrCtrl+D',
          click: () => {
            const window = BrowserWindow.getFocusedWindow();
            window?.webContents.send('menu:bookmark-page');
          },
        },
        {
          label: 'Bika amataburo yose', // Bookmark All Tabs
          accelerator: 'CmdOrCtrl+Shift+D',
          click: () => {
            const window = BrowserWindow.getFocusedWindow();
            window?.webContents.send('menu:bookmark-all-tabs');
          },
        },
        { type: 'separator' },
        {
          label: 'Reba iby\'ingenzi byose', // Show All Bookmarks
          accelerator: 'CmdOrCtrl+Shift+B',
          click: () => {
            const window = BrowserWindow.getFocusedWindow();
            window?.webContents.send('menu:show-bookmarks');
          },
        },
      ],
    },

    // History Menu (Amateka)
    {
      label: 'Amateka', // History
      submenu: [
        {
          label: 'Reba amateka', // Show History
          accelerator: 'CmdOrCtrl+H',
          click: () => {
            const window = BrowserWindow.getFocusedWindow();
            window?.webContents.send('menu:show-history');
          },
        },
        { type: 'separator' },
        {
          label: 'Siba amateka', // Clear History
          click: () => {
            const window = BrowserWindow.getFocusedWindow();
            window?.webContents.send('menu:clear-history');
          },
        },
      ],
    },

    // Window Menu (Idirishya)
    {
      label: 'Idirishya', // Window
      submenu: [
        { label: 'Kora gito', role: 'minimize' as const }, // Minimize
        { label: 'Kora nini', role: 'zoom' as const }, // Zoom
        ...(isMac
          ? [
              { type: 'separator' as const },
              { label: 'Zana imbere', role: 'front' as const }, // Bring to Front
              { type: 'separator' as const },
              { label: 'Idirishya', role: 'window' as const },
            ]
          : [{ label: 'Funga', role: 'close' as const }]),
      ],
    },

    // Help Menu (Ubufasha)
    {
      label: 'Ubufasha', // Help
      submenu: [
        {
          label: 'Aho Wing Browser iherereye', // About Wing Browser
          click: () => {
            const window = BrowserWindow.getFocusedWindow();
            window?.webContents.send('menu:about');
          },
        },
        { type: 'separator' },
        {
          label: 'Ubufasha bwa Wing', // Wing Help
          accelerator: 'F1',
          click: () => {
            const window = BrowserWindow.getFocusedWindow();
            window?.webContents.send('menu:help');
          },
        },
        {
          label: 'Raporo ikibazo', // Report Issue
          click: () => {
            console.log('Report issue');
          },
        },
        { type: 'separator' },
        {
          label: 'Ibikoresho by\'abatunganya', // Developer Tools
          accelerator: isMac ? 'Alt+Command+I' : 'Ctrl+Shift+I',
          role: 'toggleDevTools',
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
