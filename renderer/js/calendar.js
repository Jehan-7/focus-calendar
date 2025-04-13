// [file name]: calendar.js
class FocusCalendar {
    // *** MODIFIED: Accept update callback ***
    constructor(storage, onDatesSetCallback) {
        this.storage = storage;
        this.calendarEl = document.getElementById('calendar');
        this.onDatesSetCallback = onDatesSetCallback; // Store the callback
        this.calendar = null; // Initialize calendar instance variable
        this.initCalendar();
    }

    initCalendar() {
        if (!this.calendarEl) {
            console.error("Calendar element #calendar not found!");
            return;
        }
        this.calendar = new FullCalendar.Calendar(this.calendarEl, {
            initialView: 'dayGridMonth',
            headerToolbar: false, // Using custom controls
            height: 'auto', // Adjust height automatically
            fixedWeekCount: false, // Avoid showing 6 weeks if not needed
            dayCellContent: this.handleDayCellContent.bind(this),
            datesSet: this.handleDatesSet.bind(this), // Called when view changes
            dayCellDidMount: this.handleDayCellMount.bind(this), // Called after cell renders
            eventSources: [ // Use eventSources for potential future event display
               // Can add event sources later if needed
            ],
            // Add a click handler for dates via FullCalendar API
            dateClick: this.handleDateClick.bind(this)
        });

        this.calendar.render();

        // *** Trigger initial datesSet logic after render to load initial stats ***
        // Use setTimeout to ensure the view object is fully ready
        setTimeout(() => {
            if (this.calendar && this.calendar.view) {
                 this.handleDatesSet({ view: this.calendar.view });
            }
        }, 0);
    }

    // Called when a date is clicked (replaces the listener in app.js)
    handleDateClick(info) {
       // info.date contains the clicked date object
       // info.dayEl contains the DOM element
       // Trigger the modal opening logic (can be passed in or called via a global reference/event)
       // Assuming a global or passed-in function `openDayModal` exists:
       if (typeof openDayModal === 'function') {
           openDayModal(info.date);
       } else {
           console.warn('openDayModal function not found for date click');
       }
    }


    // Called AFTER a day cell is added to the DOM
    handleDayCellMount(info) {
        // `info.date` is the date for the cell
        // `info.el` is the cell's element <td>
        const dateKey = this.storage.getDateKey(info.date);
        const log = this.storage.getLog(dateKey);
        const tasks = this.storage.getTasks(dateKey);

        // Apply heat map class
        const heatLevel = Math.min(Math.floor(log.hours), 9); // Cap at 9 (0-9)
        info.el.classList.add(`heat-${heatLevel}`);

        // Add task dot if tasks exist and are not all completed
        const hasIncompleteTasks = tasks.some(task => !task.completed); // Check if any task is not done
        const taskDot = info.el.querySelector('.task-dot'); // Check if dot already exists

        if (tasks.length > 0 && !taskDot) { // Only add if tasks exist and dot isn't there
             // Create the dot element
             const dotEl = document.createElement('div');
             dotEl.className = 'task-dot absolute bottom-1 right-1 w-2 h-2 rounded-full';
             // Style dot based on completion status
             dotEl.classList.add(hasIncompleteTasks ? 'bg-accent-500' : 'bg-gray-400'); // Accent if incomplete, gray if all done
             info.el.appendChild(dotEl);
        } else if (tasks.length === 0 && taskDot) {
             taskDot.remove(); // Remove dot if no tasks exist
        } else if (taskDot) {
             // Update existing dot color if tasks exist
             taskDot.classList.toggle('bg-accent-500', hasIncompleteTasks);
             taskDot.classList.toggle('bg-gray-400', !hasIncompleteTasks);
        }

         // Highlight today's date
         const todayKey = this.storage.getDateKey(new Date());
         if (dateKey === todayKey) {
            info.el.classList.add('fc-day-today'); // Use FullCalendar's class
         } else {
            info.el.classList.remove('fc-day-today');
         }
    }

    // Customizes the content (number) inside the cell - simpler approach
    handleDayCellContent(info) {
        // Just return the day number text, FullCalendar handles the container
        return info.dayNumberText;
    }

    // Called when the calendar navigates to a new date range (month change)
    handleDatesSet(dateInfo) {
        // Update the month/year display title
        const titleEl = document.getElementById('current-month-year');
        if (titleEl) {
            titleEl.textContent = dateInfo.view.title;
        }

        // *** Trigger the callback to update stats/currentDate in app.js ***
        if (this.onDatesSetCallback) {
            // Pass a representative date for the current view (e.g., the 15th of the month)
            const viewStartDate = dateInfo.view.currentStart;
            const representativeDate = new Date(viewStartDate.getFullYear(), viewStartDate.getMonth(), 15);
            this.onDatesSetCallback(representativeDate);
        }
    }

    // Navigation methods
    navigate(date) {
        if (this.calendar) {
            this.calendar.gotoDate(date);
        }
    }

    prev() {
        if (this.calendar) {
            this.calendar.prev();
        }
    }

    next() {
        if (this.calendar) {
            this.calendar.next();
        }
    }

    // *** ADDED: Method to force redraw ***
    // In calendar.js
rerender() {
    if (this.calendar) {
        // Use a more aggressive approach to force redraw
        this.calendar.render();
        
        // Get all day cells and manually update them
        const allDayCells = document.querySelectorAll('.fc-daygrid-day');
        allDayCells.forEach(cell => {
            const dateAttr = cell.getAttribute('data-date');
            if (dateAttr) {
                const cellDate = new Date(dateAttr);
                const dateKey = this.storage.getDateKey(cellDate);
                const log = this.storage.getLog(dateKey);
                
                // Remove all heat classes first
                for (let i = 0; i <= 9; i++) {
                    cell.classList.remove(`heat-${i}`);
                }
                
                // Apply heat map class
                const heatLevel = Math.min(Math.floor(log.hours || 0), 9);
                cell.classList.add(`heat-${heatLevel}`);
            }
        });
    }
}
}