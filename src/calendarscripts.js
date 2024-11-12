// calendarscripts.js

// Mock reminder data
const mockReminders = [
    { id: '1', title: 'Math Study Group Reminder', time: '2024-11-11T16:00:00', frequency: 'daily' },
    { id: '2', title: 'History Review Session Reminder', time: '2024-11-11T16:00:00', frequency: 'weekly' }
];

// Flag to toggle between mock data and real API data
let isApiConnected = false;

// Function to add a reminder notification to the dropdown
function addNotification(message) {
    const notificationList = document.getElementById('notification-list');
    const notificationCount = document.getElementById('notification-count');

    const existingNotification = Array.from(notificationList.children).find(
        item => item.textContent === message
    );

    if (!existingNotification) {
        const listItem = document.createElement('li');
        listItem.textContent = message;
        notificationList.appendChild(listItem);

        const currentCount = parseInt(notificationCount.textContent, 10) || 0;
        notificationCount.textContent = currentCount + 1;
    }
}

// Function to set up DOM listeners (only run in browser environment)
function setupDOMListeners() {
    const notificationContainer = document.getElementById('notification-container');
    if (notificationContainer) {
        notificationContainer.addEventListener('click', function () {
            this.classList.toggle('active');
        });
    }
}

if (typeof document !== 'undefined') {
    setupDOMListeners();
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

// Function to retrieve user-defined reminder settings
function getReminderSettings() {
    const number = parseInt(document.getElementById('remind-before-number').value, 10);
    const type = document.getElementById('remind-before-type').value;
    return { number, type };
}

// Calculate adjusted reminder time based on event time and settings
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

// Function to update reminder time based on frequency
function updateReminderTime(reminder) {
    const time = new Date(reminder.time);
    if (reminder.frequency === 'daily') {
        time.setDate(time.getDate() + 1);
    } else if (reminder.frequency === 'weekly') {
        time.setDate(time.getDate() + 7);
    }
    reminder.time = time.toISOString();
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

module.exports = { fetchEvents, sortEvents, filterEvents, checkReminders, updateReminderTime, mockReminders };