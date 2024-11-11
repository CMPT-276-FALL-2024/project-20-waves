// Mock reminder data
const mockReminders = [
    { id: '1', title: 'Math Study Group Reminder', time: '2024-11-11T16:00:00', frequency: 'daily' },
    { id: '2', title: 'History Review Session Reminder', time: '2024-11-11T16:00:00', frequency: 'weekly' }
];

// Flag to toggle between mock data and real API data
let isApiConnected = false;

// Function to check and display reminders
function checkReminders() {
    console.log("Checking reminders...");
    const now = new Date().toISOString();
    const reminderList = document.getElementById('reminder-list'); // Get the list element

    mockReminders.forEach(reminder => {
        if (reminder.time <= now) {
            console.log(`Reminder: ${reminder.title}`); // Log reminder to console

            // Display the reminder in the UI list
            const listItem = document.createElement('li');
            listItem.textContent = `Reminder: ${reminder.title}`;
            reminderList.appendChild(listItem);

            // Update the reminder time based on its frequency
            updateReminderTime(reminder);
        }
    });
}

// Update reminder time based on frequency
function updateReminderTime(reminder) {
    const time = new Date(reminder.time);
    if (reminder.frequency === 'daily') {
        time.setDate(time.getDate() + 1);
    } else if (reminder.frequency === 'weekly') {
        time.setDate(time.getDate() + 7);
    }
    reminder.time = time.toISOString();
}

// Function to fetch events (mock or API-based)
function fetchEvents() {
    return isApiConnected ? fetchApiEvents() : getMockEvents();
}

// Mock event data for testing without API calls
function getMockEvents() {
    return [
        { id: '1', title: 'Math Study Group', start: '2024-11-10T10:00:00', end: '2024-11-10T12:00:00' },
        { id: '2', title: 'History Review Session', start: '2024-11-11T14:00:00', end: '2024-11-11T15:30:00' },
        { id: '3', title: 'Science Project', start: '2024-11-12T09:00:00', end: '2024-11-12T10:30:00' }
    ];
}

// Placeholder function for API events (to be implemented with Google Calendar API)
function fetchApiEvents() {
    return []; // Placeholder, to be replaced with real API data in the future
}

// Sorting function with criteria ('date' or 'title') and events array
function sortEvents(criteria, events) {
    if (criteria === 'date') {
        return events.slice().sort((a, b) => new Date(a.start) - new Date(b.start));
    } else if (criteria === 'title') {
        return events.slice().sort((a, b) => a.title.localeCompare(b.title));
    }
    return events;
}

// Filtering function with keyword and events array
function filterEvents(keyword, events) {
    return events.filter(event => event.title.toLowerCase().includes(keyword.toLowerCase()));
}

// Initialize FullCalendar in the browser environment
function initializeCalendar() {
    const calendarEl = document.getElementById('calendar');
    if (calendarEl) {
        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            events: fetchEvents(),
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }
        });
        calendar.render();
    }
}

// Set up reminder frequency listener in the browser environment
function setupReminderFrequencyListener() {
    const reminderFrequencyElement = document.getElementById('reminder-frequency');
    if (reminderFrequencyElement) {
        reminderFrequencyElement.addEventListener('change', (event) => {
            const selectedFrequency = event.target.value;
            mockReminders.forEach(reminder => {
                reminder.frequency = selectedFrequency; // Update frequency for all reminders as a simple demo
            });
            console.log(`Reminder frequency updated to ${selectedFrequency}`);
        });
    }
}

// Run browser-specific initializations if document is defined
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeCalendar();
        setupReminderFrequencyListener();
    });
}

// Check reminders periodically
setInterval(checkReminders, 60000); // Every minute

// Export functions and mock data for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { fetchEvents, sortEvents, filterEvents, getMockEvents, checkReminders, updateReminderTime, mockReminders };
}