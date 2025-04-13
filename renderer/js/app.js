// app.js - Modified for Electron

// Make modal opening globally accessible for calendar's dateClick
let openDayModal;

document.addEventListener('DOMContentLoaded', async () => {
    const storage = new FocusStorage();
    // Wait for data to load from file system
    await storage.loadData();
    
    const charts = new FocusCharts(storage);
    let currentDate = new Date(); // Tracks the month/year the stats are for

    const themeToggleButton = document.getElementById('theme-toggle');
    const darkIcon = document.getElementById('theme-toggle-dark-icon');
    const lightIcon = document.getElementById('theme-toggle-light-icon');
    const modalElement = document.getElementById('day-modal');
    const hoursInput = document.getElementById('hours-input');
    const hoursSlider = document.getElementById('hours-slider');
    const taskListElement = document.getElementById('task-list');
    const taskInputElement = document.getElementById('task-input');

    // --- Calendar Initialization ---
    // Pass the callback function to update stats and currentDate when view changes
    const calendar = new FocusCalendar(storage, (newDate) => {
        currentDate = newDate; // Update the date reference
        updateStats(); // Update stats for the new month/year
    });

    // --- Stats Calculation & Update ---
    function updateStats() {
        if (!currentDate) return; // Don't run if date isn't set yet

        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        const monthLogs = storage.getMonthLogs(currentYear, currentMonth);

        let totalHours = 0;
        let daysWithData = 0;
        let bestDayHours = 0;
        let bestDayKey = null;

        // Use Object.entries to get both dateKey and log data
        Object.entries(monthLogs).forEach(([dateKey, log]) => {
            const hours = log.hours || 0; // Ensure hours is a number
            if (hours > 0) {
                totalHours += hours;
                daysWithData++;
                if (hours > bestDayHours) {
                    bestDayHours = hours;
                    bestDayKey = dateKey;
                }
            }
        });

        let bestDayDateStr = 'N/A';
        if (bestDayKey) {
            // Parse YYYY-MM-DD reliably, considering timezone
            try {
                 // Split and construct Date object using UTC to avoid timezone shifts from midnight interpretation
                 const parts = bestDayKey.split('-').map(Number);
                 // new Date(year, monthIndex, day) - month is 0-indexed
                 const bestDate = new Date(parts[0], parts[1] - 1, parts[2]);

                 // Check if date is valid before formatting
                 if (!isNaN(bestDate.getTime())) {
                     bestDayDateStr = bestDate.toLocaleDateString('en-US', {
                         month: 'short',
                         day: 'numeric'
                     });
                 } else {
                     console.warn("Could not parse best day date:", bestDayKey);
                     bestDayDateStr = 'Error';
                 }
            } catch(e) {
                 console.error("Error formatting best day date:", e);
                 bestDayDateStr = 'Error';
            }
        }

        // Update DOM Elements
        document.getElementById('monthly-total').textContent = `${totalHours.toFixed(1)}h`;
        document.getElementById('daily-average').textContent =
            daysWithData > 0 ? `${(totalHours / daysWithData).toFixed(1)}h` : '0h';
        document.getElementById('best-day').textContent =
            bestDayHours > 0 ? `${bestDayHours.toFixed(1)}h (${bestDayDateStr})` : '0h';

        // Update the trend chart
        charts.updateTrend(monthLogs);
    }

    // --- Theme Handling ---
    function updateThemeIcons(isDark) {
        if (darkIcon && lightIcon) {
            darkIcon.classList.toggle('hidden', !isDark);
            lightIcon.classList.toggle('hidden', isDark);
        }
    }

    function applyTheme(theme) {
        const isDark = theme === 'dark';
        document.documentElement.classList.toggle('dark', isDark);
        updateThemeIcons(isDark);
    }

    async function toggleTheme() {
        const isDark = !document.documentElement.classList.contains('dark');
        const newTheme = isDark ? 'dark' : 'light';
        applyTheme(newTheme);
        await storage.saveTheme(newTheme);
    }

    // --- Modal Handling ---
    const modal = {
        el: modalElement,
        date: null, // Store the date associated with the open modal
        open(date) {
            if (!this.el) return;
            this.date = date;
            const dateKey = storage.getDateKey(date);
            const log = storage.getLog(dateKey);
            const tasks = storage.getTasks(dateKey);

            // Update modal content
            document.getElementById('modal-date').textContent =
                date.toLocaleDateString('en-US', { dateStyle: 'long' });
            // Set both input and slider, ensure value is within bounds
            const initialHours = Math.max(0, Math.min(12, log.hours || 0));
            hoursInput.value = initialHours;
            hoursSlider.value = initialHours;
            document.getElementById('day-notes').value = log.notes || '';

            // Render tasks
            renderTasks(tasks);

            // Show modal with animation
            this.el.classList.remove('hidden');
            setTimeout(() => { // Allow display change before starting transition
                this.el.classList.add('opacity-100');
                this.el.querySelector('.modal-content').classList.remove('scale-95');
            }, 10); // Small delay
        },
        close() {
            if (!this.el) return;
            this.el.classList.remove('opacity-100');
            this.el.querySelector('.modal-content').classList.add('scale-95');
            // Wait for animation before hiding
            setTimeout(() => {
                this.el.classList.add('hidden');
                this.date = null; // Clear date when closing
                taskInputElement.value = ''; // Clear task input on close
            }, 300); // Match transition duration
        }
    };

    // Assign to global variable for calendar dateClick
    openDayModal = modal.open.bind(modal);

    // Function to render tasks in the modal
    function renderTasks(tasks) {
        taskListElement.innerHTML = tasks.map((task, index) => `
            <div class="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded group" data-task-index="${index}">
                <span class="task-text cursor-pointer flex-grow mr-2 ${task.completed ? 'line-through opacity-50' : ''}">${task.text}</span>
                <button class="delete-task text-red-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">×</button>
            </div>
        `).join('');
    }

    // --- Event Listeners ---

    // Navigation
    document.getElementById('prev-month')?.addEventListener('click', () => calendar.prev());
    document.getElementById('next-month')?.addEventListener('click', () => calendar.next());
    document.getElementById('today-button')?.addEventListener('click', () => calendar.navigate(new Date()));
    // Refresh button - add this to the Event Listeners section in app.js
    document.getElementById('refresh-btn')?.addEventListener('click', () => {
        // This will perform a full page reload, exactly like pressing Ctrl+R
        window.location.reload();
    });
    // Theme Toggle
    themeToggleButton?.addEventListener('click', toggleTheme);

    // Data Export/Import - Modified for Electron
    document.getElementById('save-file-btn')?.addEventListener('click', () => storage.exportData());
    document.getElementById('load-file-btn')?.addEventListener('click', () => {
        storage.importData((success) => {
            if (success) {
                // Refresh UI after successful import
                const currentTheme = storage.getTheme();
                applyTheme(currentTheme); // Apply imported theme
                calendar.rerender(); // Rerender calendar for heat map/dots
                updateStats(); // Update statistics
                alert('Data imported successfully!');
            }
        });
    });

    // Modal: Close button
    document.getElementById('close-modal-btn')?.addEventListener('click', () => modal.close());

    // Modal: Backdrop click to close
    modal.el?.addEventListener('click', (e) => {
        if (e.target === modal.el) {
            modal.close();
        }
    });

    // Modal: Hours Input/Slider Syncing
    hoursInput?.addEventListener('input', () => {
        let value = parseFloat(hoursInput.value);
        if (isNaN(value)) value = 0;
        value = Math.max(0, Math.min(12, value)); // Clamp value
        hoursInput.value = value; // Update input in case it was clamped
        hoursSlider.value = value;
    });

    hoursSlider?.addEventListener('input', () => {
        hoursInput.value = hoursSlider.value;
    });

    // Modal: Task Adding
    document.getElementById('add-task-btn')?.addEventListener('click', async () => {
        const text = taskInputElement.value.trim();
        if (text && modal.date) {
             const dateKey = storage.getDateKey(modal.date);
             const tasks = storage.getTasks(dateKey);
             tasks.push({ text: text, completed: false });
             await storage.saveTasks(dateKey, tasks); // Save immediately
             renderTasks(tasks); // Re-render task list
             taskInputElement.value = ''; // Clear input
             calendar.rerender();
        }
    });
    
    // Allow adding task by pressing Enter
    taskInputElement?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent form submission if it were in a form
            document.getElementById('add-task-btn').click(); // Trigger the add button click
        }
    });

    // Modal: Task List Delegation (Toggle Complete / Delete)
    taskListElement?.addEventListener('click', async (e) => {
        const taskDiv = e.target.closest('div[data-task-index]');
        if (!taskDiv || !modal.date) return;

        const index = parseInt(taskDiv.dataset.taskIndex, 10);
        const dateKey = storage.getDateKey(modal.date);
        const tasks = storage.getTasks(dateKey);

        if (isNaN(index) || index < 0 || index >= tasks.length) return; // Invalid index check

        if (e.target.classList.contains('delete-task')) {
            // Delete task
            tasks.splice(index, 1);
            await storage.saveTasks(dateKey, tasks);
            renderTasks(tasks); // Re-render
            calendar.rerender(); // Update calendar dot
        } else if (e.target.classList.contains('task-text')) {
            // Toggle completion
            tasks[index].completed = !tasks[index].completed;
            await storage.saveTasks(dateKey, tasks);
            renderTasks(tasks); // Re-render
            calendar.rerender(); // Update calendar dot color
        }
    });

    // Modal: Save Day Button - FIXED VERSION
    document.getElementById('save-day-btn')?.addEventListener('click', async () => {
        if (!modal.date) return; // No date associated with the modal
        const dateKey = storage.getDateKey(modal.date);
        
        // Validate and get hours (already clamped by input listener)
        let hoursValue = parseFloat(hoursInput.value);
        if (isNaN(hoursValue)) hoursValue = 0;
        hoursValue = Math.max(0, Math.min(12, hoursValue));
        const logData = {
            hours: hoursValue,
            notes: document.getElementById('day-notes').value.trim()
        };
        // Save the log
        await storage.saveLog(dateKey, logData);
        modal.close();
        
        // Remove the automatic rerender code - no refresh after save
    });

    // --- Initial Setup ---
    const initialTheme = storage.getTheme();
    applyTheme(initialTheme); // Apply theme and set icons

    // Set initial calendar view to current month
    calendar.navigate(new Date());
    
    // Update stats (will happen via datesSet callback after initial render)
}); // End DOMContentLoaded