# Focus Calendar - Development Setup Guide

## Project Overview

Focus Calendar is an Electron-based desktop application for tracking daily productivity. This guide will help you set up the development environment and understand the project structure.

## Prerequisites

- **Node.js** (v14 or newer)
- **npm** (comes with Node.js)
- **Git** (optional, but recommended)

## Project Structure

```
focus-calendar/
├── main.js           # Electron main process
├── preload.js        # Secure API bridge
├── package.json      # Project configuration
├── assets/           # Application icons and assets
└── renderer/
    ├── index.html    # Main UI template
    ├── css/          # Optional custom styles
    └── js/
        ├── app.js    # Core application logic
        ├── calendar.js  # Calendar rendering
        ├── charts.js    # Data visualization
        └── storage.js   # Data management
```

## Setup Steps

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/focus-calendar.git
cd focus-calendar
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies, including:
- Electron
- Electron Builder
- Development dependencies

### 3. Configuration Files

Ensure you have these key files:
- `main.js`: Electron's main process script
- `preload.js`: Secure IPC bridge
- `package.json`: Project configuration
- `renderer/index.html`: Main application UI

### 4. Development Workflow

#### Running the Application

```bash
npm start
```

This launches the application in development mode.

#### Building for Distribution

```bash
# Build for current platform
npm run build

# Platform-specific builds
npm run build:mac    # macOS
npm run build:win    # Windows
npm run build:linux  # Linux
```

## Key Architectural Concepts

### 1. Inter-Process Communication (IPC)

- `main.js` handles system-level operations
- `preload.js` exposes a secure, limited API to the renderer
- Renderer processes communicate via `window.electronAPI`

### 2. Data Persistence

- Data is stored in a JSON file in the user's application directory
- Uses Electron's `app.getPath('userData')` for consistent storage location
- Automatic saving and loading of user data

### 3. Security Considerations

- Context isolation enabled
- Node integration disabled
- Only specific methods exposed via `contextBridge`

## Debugging Tips

1. **Open Developer Tools**
   - Use `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (macOS)
   - Inspect console for any errors

2. **Common Issues**
   - Verify file paths are relative
   - Check IPC method implementations
   - Ensure all dependencies are installed

## Customization Points

### Styling
- Modify Tailwind configuration in `index.html`
- Adjust color schemes and utility classes

### Functionality
- Extend `storage.js` for additional data management
- Modify `calendar.js` for calendar interactions
- Update `charts.js` for more complex visualizations

## Recommended Extensions

For VS Code:
- Electron React Devtools
- ESLint
- Prettier
- Tailwind CSS IntelliSense

## Deployment Preparation

1. Update `package.json`
   - Set correct repository URL
   - Configure build scripts
   - Update metadata

2. Add Application Icons
   - Replace `assets/icon.png` and `assets/icon.ico`
   - Ensure icons meet platform requirements

## Future Enhancements

- Implement automatic updates
- Add more advanced statistics
- Create custom export formats
- Develop advanced filtering and reporting

## Troubleshooting

### Build Failures
- Ensure all dependencies are installed
- Check Node.js and npm versions
- Verify platform-specific build tools are installed

### Runtime Errors
- Check console logs
- Verify IPC method implementations
- Ensure all required scripts are loaded

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is open-source, typically under the MIT License.

## Support

For issues and questions, please use the GitHub Issues section of the repository.
