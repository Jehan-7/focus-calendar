# Focus Calendar - Electron Setup Instructions

This document explains how to set up the Focus Calendar app as an Electron desktop application.

## Project Structure

First, set up your project directory with the following structure:

```
focus-calendar-electron/
├── package.json              # NPM configuration 
├── main.js                   # Electron main process
├── preload.js                # Secure API bridge
├── assets/                   # App icons and other assets
│   └── icon.png              # Application icon (create or download one)
└── renderer/                 # Frontend files
    ├── index.html            # Main HTML file
    ├── css/                  # CSS files (if you have any)
    └── js/
        ├── app.js            # Main application logic
        ├── calendar.js       # Calendar functionality
        ├── charts.js         # Chart visualization
        ├── storage.js        # Data storage handling
```

## Setup Steps

1. **Create the project directory:**
   ```bash
   mkdir focus-calendar-electron
   cd focus-calendar-electron
   ```

2. **Initialize npm and install dependencies:**
   ```bash
   npm init -y
   npm install --save-dev electron electron-builder
   ```

3. **Copy the files provided in the artifacts:**
   - `main.js` - Electron's main process script
   - `preload.js` - Secure bridge between Electron and renderer
   - `package.json` - Project configuration (replace the one from npm init)

4. **Create the renderer directory and subdirectories:**
   ```bash
   mkdir -p renderer/js
   mkdir -p assets
   ```

5. **Move your existing web files:**
   - Copy your `index.html` file to `renderer/index.html`
   - Copy your JavaScript files to `renderer/js/` directory
   - **Important**: Replace the `storage.js` file with the modified version provided

6. **Update file paths in index.html:**
   Open `renderer/index.html` and change the script paths:
   ```html
   <!-- Change from -->
   <script src="js/storage.js"></script>
   <script src="js/calendar.js"></script>
   <script src="js/charts.js"></script>
   <script src="js/app.js"></script>

   <!-- To -->
   <script src="./js/storage.js"></script>
   <script src="./js/calendar.js"></script>
   <script src="./js/charts.js"></script>
   <script src="./js/app.js"></script>
   ```

7. **Add an application icon:**
   Place an icon image (preferably in PNG format) in the `assets` directory.

## Running the Application

To run the application in development mode:

```bash
npm start
```

## Building the Application

To build installable packages for your operating system:

```bash
npm run build
```

To build for specific platforms:

```bash
npm run build:mac    # macOS
npm run build:win    # Windows
npm run build:linux  # Linux
```

The built applications will be available in the `dist` directory.

## Key Changes from Web App to Electron App

1. **Data Persistence**: 
   - The web app used `localStorage` for saving data
   - The Electron app stores data in a JSON file in the user's app data directory
   - This ensures data persists between sessions and is more reliable than browser storage

2. **File Operations**:
   - Import/export operations now use native file dialogs
   - Data is automatically loaded and saved to a file in the user's app data folder

3. **Security**:
   - Electron uses a secure preload script to safely expose file system capabilities to the renderer
   - All file operations happen in the main process to maintain security

4. **Deployment**:
   - The app can be packaged as a native application for Windows, macOS, and Linux
   - `electron-builder` handles creating installable packages

## Troubleshooting

If you encounter issues:

1. **Blank Screen on Startup**:
   - Check the console for errors (Ctrl+Shift+I or Cmd+Option+I)
   - Ensure all file paths are correct in relative form (starting with `./`)

2. **Data Not Saving**:
   - Verify the storage.js file has been updated to the Electron version
   - Check that the electronAPI object is available in the console

3. **Import/Export Not Working**:
   - Ensure the IPC handlers in main.js match the function calls in storage.js
   - Check for any error messages in the console

4. **Build Errors**:
   - Make sure you have all dependencies installed with `npm install`
   - For platform-specific builds, ensure you have the required tools installed

## Next Steps for Enhancement

1. **Add Auto-updates**: Implement Electron's autoUpdater for seamless updates
2. **Implement Data Backup**: Add automatic backup functionality
3. **Add System Tray Icon**: For quick access to the app
4. **Add Keyboard Shortcuts**: For power users to navigate efficiently
5. **Improve Performance**: Optimize data loading for larger datasets