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

    getDateKey(date = new Date()) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed.
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
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