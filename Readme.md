# Focus Calendar Desktop App

A desktop productivity tracking application with calendar visualization, built with Electron.

![Focus Calendar Screenshot](./assets/screenshot.png)

## Features

- **Calendar View with Heat Map**: Visualize your productivity with a color-coded calendar
- **Quick-Add Daily Logs**: Track hours worked and add notes for each day
- **Task Management**: Add, complete, and delete tasks for specific days
- **Productivity Statistics**: See your monthly totals, daily averages, and best performing days
- **Trend Visualization**: Track productivity trends with an interactive chart
- **Dark/Light Theme**: Switch between dark and light modes for comfortable viewing
- **Data Persistence**: Your data is automatically saved to your computer
- **Import/Export**: Back up your data or move it between devices

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or newer)
- npm (comes with Node.js)

### Installation

1. Clone this repository or download the source code
   ```bash
   git clone https://github.com/yourusername/focus-calendar-electron.git
   cd focus-calendar-electron
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the application
   ```bash
   npm start
   ```

### Building the Application

Create installable packages for your platform:

```bash
# Build for your current platform
npm run build

# Or build for specific platforms
npm run build:mac
npm run build:win
npm run build:linux
```

## Usage

### Adding Hours

1. Click on any date in the calendar
2. Use the slider or input field to set hours worked
3. Add notes about what you accomplished
4. Click "Save"

### Managing Tasks

1. Open a day by clicking on it in the calendar
2. Add tasks in the task section
3. Click on a task to mark it as complete
4. Click the "×" button to delete a task

### Viewing Statistics

The top section displays:
- Monthly total hours
- Daily average (for days with data)
- Your best day with total hours

### Data Management

- Click "Export" to save your data to a file
- Click "Import" to load data from a previously exported file

## Technical Overview

### Architecture

- **Electron Framework**: Provides cross-platform desktop capabilities
- **FullCalendar**: Powers the interactive calendar display
- **Chart.js**: Creates the productivity trend visualization
- **Tailwind CSS**: Handles styling and UI components

### Data Storage

Data is stored in a JSON file in the user's application data directory:
- Windows: `%APPDATA%\focus-calendar-electron\data.json`
- macOS: `~/Library/Application Support/focus-calendar-electron/data.json` 
- Linux: `~/.config/focus-calendar-electron/data.json`

## Customization

### Changing Theme Colors

Edit the Tailwind configuration in `index.html` to customize the color scheme:

```js
tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: {
                    // Blues
                    500: '#0ea5e9',
                    // Add other shades as needed
                }

### Modifying Heat Map Colors

The heat map colors can be customized by editing the CSS in `index.html`:

```css
/* Heat map colors - light theme */
.heat-0 { background-color: #f8f9fa; }
.heat-1 { background-color: #dcf6ed; }
/* ... other colors ... */
```

## Project Structure

```
focus-calendar-electron/
├── main.js                   # Electron main process
├── preload.js                # Secure API bridge
├── package.json              # Project configuration
├── assets/                   # Static assets like icons
└── renderer/                 # Frontend files
    ├── index.html            # Main HTML file
    └── js/
        ├── app.js            # Main application logic
        ├── calendar.js       # Calendar functionality
        ├── charts.js         # Chart visualization
        ├── storage.js        # Data storage handling
```

## Development

### Technologies Used

- **Electron**: For creating cross-platform desktop applications
- **Node.js**: For file system operations and backend logic
- **FullCalendar**: For the calendar interface
- **Chart.js**: For data visualization
- **Tailwind CSS**: For styling

### IPC Communication

The app uses Electron's IPC (Inter-Process Communication) to safely bridge operations between:
- The main process (which handles file operations)
- The renderer process (which runs the UI)

This ensures security while allowing file access.

## License

[MIT License](LICENSE)

## Acknowledgments

- [FullCalendar](https://fullcalendar.io/) for the calendar component
- [Chart.js](https://www.chartjs.org/) for data visualization
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Electron](https://www.electronjs.org/) for the desktop application framework,
                accent: {
                    // Pinks
                    500: '#ec4899',
                    // Add other shades as needed
                },
            }
        }
    }
}