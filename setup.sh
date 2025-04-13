#!/bin/bash
# Focus Calendar Electron - Setup Script
# This script creates the project directory structure and copies files to the right locations

# Create project directory
mkdir -p focus-calendar-electron/renderer/js
mkdir -p focus-calendar-electron/assets

# Change to project directory
cd focus-calendar-electron

# Create package.json
echo "Creating package.json..."
cat > package.json << 'EOL'
{
  "name": "focus-calendar-electron",
  "version": "1.0.0",
  "description": "A desktop productivity tracking app with calendar visualization",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "dev": "electron . --debug",
    "build": "electron-builder",
    "build:all": "electron-builder -mwl",
    "build:mac": "electron-builder --mac",
    "build:win": "electron-builder --win",
    "build:linux": "electron-builder --linux"
  },
  "author": "Your Name",
  "license": "MIT",
  "devDependencies": {
    "electron": "^25.0.0",
    "electron-builder": "^24.6.4"
  },
  "build": {
    "appId": "com.yourname.focuscalendar",
    "productName": "Focus Calendar",
    "directories": {
      "output": "dist"
    },
    "files": [
      "main.js",
      "preload.js",
      "renderer/**/*",
      "assets/**/*"
    ],
    "mac": {
      "category": "public.app-category.productivity",
      "target": ["dmg", "zip"]
    },
    "win": {
      "target": ["nsis", "portable"]
    },
    "linux": {
      "target": ["AppImage", "deb"],
      "category": "Office"
    }
  }
}
EOL

# Create main.js
echo "Creating main.js..."
cat > main.js << 'EOL'
// main.js - Electron main process
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Define the data file path in the user's app data folder
const DATA_FILE = path.join(app.getPath('userData'), 'data.json');

// Create the main application window
function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    // Set application icon (optional)
    icon: path.join(__dirname, 'assets', 'icon.png')
  });

  // Load the main HTML file
  win.loadFile('renderer/index.html');
  
  // Open DevTools automatically in development (optional)
  // if (process.env.NODE_ENV === 'development') {
  //   win.webContents.openDevTools();
  // }
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
EOL

# Create preload.js
echo "Creating preload.js..."
cat > preload.js << 'EOL'
// preload.js - Securely expose Electron APIs to renderer process
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Data operations
  readData: async () => await ipcRenderer.invoke('read-data'),
  saveData: async (data) => await ipcRenderer.invoke('save-data', data),
  
  // Import/Export operations with file dialogs
  exportData: async (data) => await ipcRenderer.invoke('export-data', data),
  importData: async () => await ipcRenderer.invoke('import-data')
});
EOL

# Create modified storage.js for Electron
echo "Creating renderer/js/storage.js..."
cat > renderer/js/storage.js << 'EOL'
// storage.js - Modified for Electron
class FocusStorage {
    constructor() {
        this.data = {
            logs: {},
            tasks: {},
            settings: { theme: 'light' }
        };
        this.loadData();
    }

    // Load data from file system using Electron's IPC
    async loadData() {
        try {
            // Use the exposed electronAPI from preload.js
            const data = await window.electronAPI.readData();
            if (data) {
                this.data = data;
                // Ensure nested objects exist
                this.data.logs = this.data.logs || {};
                this.data.tasks = this.data.tasks || {};
                this.data.settings = this.data.settings || { theme: 'light' };
            }
        } catch (e) {
            console.error("Error loading data from file:", e);
            // Reset to default if loading fails
            this.data = { logs: {}, tasks: {}, settings: { theme: 'light' } };
        }
    }

    // Save data to file system using Electron's IPC
    async saveData() {
        try {
            const result = await window.electronAPI.saveData(this.data);
            if (!result.success) {
                console.error("Error saving data:", result.error);
            }
            return result.success;
        } catch (e) {
            console.error("Error saving data:", e);
            return false;
        }
    }

    // Date key format YYYY-MM-DD
    getDateKey(date = new Date()) {
        // Adjust for timezone offset to ensure 'YYYY-MM-DD' reflects the local date
        const adjustedDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
        return adjustedDate.toISOString().split('T')[0];
    }

    // Logs management
    getLog(dateKey) {
        return this.data.logs[dateKey] || { hours: 0, notes: '' };
    }

    async saveLog(dateKey, logData) {
        // Only save if there are hours or notes to prevent empty entries
        if (logData.hours > 0 || logData.notes.trim() !== '') {
            this.data.logs[dateKey] = { ...this.getLog(dateKey), ...logData };
        } else {
            // If hours are 0 and notes are empty, remove the log entry
            delete this.data.logs[dateKey];
        }
        return await this.saveData();
    }

    // Get all logs for a specific month
    getMonthLogs(year, month) {
        const prefix = `${year}-${String(month + 1).padStart(2, '0')}-`;
        const monthLogs = {};
        for (const dateKey in this.data.logs) {
            if (dateKey.startsWith(prefix)) {
                monthLogs[dateKey] = this.data.logs[dateKey];
            }
        }
        return monthLogs;
    }

    // Tasks management
    getTasks(dateKey) {
        return this.data.tasks[dateKey] || [];
    }

    async saveTasks(dateKey, tasks) {
        // Only save if there are tasks, otherwise remove the entry
        if (tasks && tasks.length > 0) {
            this.data.tasks[dateKey] = tasks;
        } else {
            delete this.data.tasks[dateKey];
        }
        return await this.saveData();
    }

    // Theme management
    getTheme() {
        return this.data.settings.theme || 'light'; // Default to light if undefined
    }

    async saveTheme(theme) {
        this.data.settings.theme = theme;
        return await this.saveData();
    }

    // Export data using Electron's dialog
    async exportData() {
        try {
            const result = await window.electronAPI.exportData(this.data);
            if (result.success) {
                console.log(`Data exported successfully to ${result.path}`);
                return true;
            } else if (result.canceled) {
                console.log("Export canceled by user");
                return false;
            } else {
                console.error("Failed to export data:", result.error);
                alert("Error exporting data.");
                return false;
            }
        } catch (error) {
            console.error("Failed to export data:", error);
            alert("Error exporting data.");
            return false;
        }
    }

    // Import data using Electron's dialog
    async importData(callback) {
        try {
            const result = await window.electronAPI.importData();
            
            if (result.success) {
                const importedData = result.data;
                
                // Basic validation
                if (importedData && 
                    typeof importedData.logs === 'object' && 
                    typeof importedData.tasks === 'object' && 
                    typeof importedData.settings === 'object') {
                    
                    this.data = importedData;
                    await this.saveData();
                    console.log('Data imported successfully.');
                    if (callback) callback(true); // Signal success
                    return true;
                } else {
                    throw new Error("Invalid data structure in imported file.");
                }
            } else if (result.canceled) {
                console.log("Import canceled by user");
                if (callback) callback(false);
                return false;
            } else {
                throw new Error(result.error || "Unknown error during import");
            }
        } catch (error) {
            console.error("Failed to import data:", error);
            alert(`Failed to import data: ${error.message}`);
            if (callback) callback(false); // Signal failure
            return false;
        }
    }
}
EOL

# Create placeholder for README.md
echo "Creating README.md..."
cat > README.md << 'EOL'
# Focus Calendar Desktop App

A desktop productivity tracking application with calendar visualization, built with Electron.

## Installation

1. Install dependencies
   ```bash
   npm install
   ```

2. Start the application
   ```bash
   npm start
   ```

3. Build the application
   ```bash
   npm run build
   ```
EOL

# Create placeholder icon.png in assets directory
echo "Creating placeholder icon file..."
touch assets/icon.png
echo "A real icon image (PNG) should be placed in this location" > assets/icon-readme.txt

# Create placeholder for index.html
echo "Creating renderer/index.html placeholder..."
cat > renderer/index.html << 'EOL'
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Focus Calendar</title>
</head>
<body>
    <h1>Focus Calendar</h1>
    <p>Replace this file with the full index.html content</p>
</body>
</html>
EOL

# Create placeholders for other JS files
echo "Creating placeholder for JS files..."
touch renderer/js/app.js
touch renderer/js/calendar.js
touch renderer/js/charts.js

# Install dependencies
echo "Setup complete! To finish installation:"
echo "1. Copy your HTML and JavaScript files into their respective folders"
echo "2. Add an icon.png file to the assets directory"
echo "3. Run 'npm install' to install dependencies"
echo "4. Run 'npm start' to launch the application"