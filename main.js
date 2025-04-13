// main.js - Electron main process
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
// Define the data file path in the user's app data folder
const DATA_FILE = path.join(app.getPath('userData'), 'data.json');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 900,
    minWidth: 1000, // Set minimum window size
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    icon: path.join(__dirname, 'assets', 'icon.png')
  });

  // Add this line to maximize window on start
  win.maximize();
  
  win.loadFile('renderer/index.html');
}

// Initialize app when ready
app.whenReady().then(() => {
  createWindow();

  // On macOS, recreate window when dock icon is clicked and no windows are open
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit the app when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers for file operations

// Read data from the JSON file
ipcMain.handle('read-data', async () => {
  try {
    // Check if the data file exists
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    } else {
      // Return default data structure if file doesn't exist
      return { 
        logs: {}, 
        tasks: {}, 
        settings: { theme: 'light' } 
      };
    }
  } catch (error) {
    console.error('Error reading data file:', error);
    return { 
      logs: {}, 
      tasks: {}, 
      settings: { theme: 'light' } 
    };
  }
});

// Save data to the JSON file
ipcMain.handle('save-data', async (event, data) => {
  try {
    // Create the directory if it doesn't exist
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write data to file
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return { success: true };
  } catch (error) {
    console.error('Error saving data file:', error);
    return { success: false, error: error.message };
  }
});

// Export data to a user-selected location
ipcMain.handle('export-data', async (event, data) => {
  try {
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: 'Export Focus Calendar Data',
      defaultPath: `focus-calendar-backup-${new Date().toISOString().split('T')[0]}.json`,
      filters: [
        { name: 'JSON Files', extensions: ['json'] }
      ]
    });

    if (!canceled && filePath) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return { success: true, path: filePath };
    } else {
      return { success: false, canceled: true };
    }
  } catch (error) {
    console.error('Error exporting data:', error);
    return { success: false, error: error.message };
  }
});

// Import data from a user-selected file
ipcMain.handle('import-data', async () => {
  try {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Import Focus Calendar Data',
      filters: [
        { name: 'JSON Files', extensions: ['json'] }
      ],
      properties: ['openFile']
    });

    if (!canceled && filePaths && filePaths.length > 0) {
      const data = fs.readFileSync(filePaths[0], 'utf-8');
      return { success: true, data: JSON.parse(data) };
    } else {
      return { success: false, canceled: true };
    }
  } catch (error) {
    console.error('Error importing data:', error);
    return { success: false, error: error.message };
  }
});