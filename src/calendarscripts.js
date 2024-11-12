// Mock reminder data
const mockReminders = [
    { id: '1', title: 'Math Study Group Reminder', time: '2024-11-11T16:00:00', frequency: 'daily' },
    { id: '2', title: 'History Review Session Reminder', time: '2024-11-11T16:00:00', frequency: 'weekly' }
];

// Flag to toggle between mock data and real API data
let isApiConnected = false;

// Function to create a toast notification
// Function to add a reminder notification to the dropdown
function addNotification(message) {
    const notificationList = document.getElementById('notification-list');
    const notificationCount = document.getElementById('notification-count');

    // Check if the notification already exists
    const existingNotification = Array.from(notificationList.children).find(
        item => item.textContent === message
    );

    if (!existingNotification) {
        const listItem = document.createElement('li');
        listItem.textContent = message;
        notificationList.appendChild(listItem);

        // Update notification count
        const currentCount = parseInt(notificationCount.textContent, 10) || 0;
        notificationCount.textContent = currentCount + 1;
    }
}

// Toggle dropdown visibility on bell icon click
document.getElementById('notification-container').addEventListener('click', function() {
    this.classList.toggle('active');
});

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

// Placeholder for API events (to be implemented with Google Calendar API)
function fetchApiEvents() {
    return [];
}

// Sorting function by criteria ('date' or 'title') for events
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

// Initialize FullCalendar in the browser
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

// Setup listener for reminder frequency changes
function setupReminderFrequencyListener() {
    const reminderFrequencyElement = document.getElementById('reminder-frequency');
    if (reminderFrequencyElement) {
        reminderFrequencyElement.addEventListener('change', (event) => {
            const selectedFrequency = event.target.value;
            mockReminders.forEach(reminder => {
                reminder.frequency = selectedFrequency;
            });
            console.log(`Reminder frequency updated to ${selectedFrequency}`);
        });
    }
}

// Function to retrieve user-defined reminder settings
function getReminderSettings() {
    const number = parseInt(document.getElementById('remind-before-number').value, 10);
    const type = document.getElementById('remind-before-type').value;
    return { number, type };
}

// Calculate adjusted reminder time based on event and settings
function calculateReminderTime(eventTime, settings) {
    const eventDate = new Date(eventTime);
    const { number, type } = settings;

    switch (type) {
        case 'minutes':
            eventDate.setMinutes(eventDate.getMinutes() - number);
            break;
        case 'hours':
            eventDate.setHours(eventDate.getHours() - number);
            break;
        case 'days':
            eventDate.setDate(eventDate.getDate() - number);
            break;
        case 'weeks':
            eventDate.setDate(eventDate.getDate() - number * 7);
            break;
    }
    return eventDate.toISOString();
}

// Function to check reminders based on user-defined time
function checkReminders() {
    const now = new Date().toISOString();
    const reminderSettings = getReminderSettings();

    mockReminders.forEach(reminder => {
        const adjustedTime = calculateReminderTime(reminder.time, reminderSettings);
        if (adjustedTime <= now) {
            console.log(`Reminder: ${reminder.title}`);
            addNotification(`Reminder: ${reminder.title}`);
            updateReminderTime(reminder);
        }
    });
}

// Update reminder time based on frequency
function updateReminderTime(reminder) {
    const time = new Date(reminder.time);
    const reminderSettings = getReminderSettings();
    reminder.time = calculateReminderTime(time, reminderSettings);
}

// Run initializations on DOM load
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeCalendar();
        setupReminderFrequencyListener();
    });
}

// Check reminders at regular intervals
setInterval(checkReminders, 10000); // Check every 10 seconds

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { fetchEvents, sortEvents, filterEvents, getMockEvents, checkReminders, updateReminderTime, mockReminders };
}