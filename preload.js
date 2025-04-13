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