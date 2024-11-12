// Mock reminder data
const mockReminders = [
    { id: '1', title: 'Math Study Group Reminder', time: '2024-11-11T16:00:00', frequency: 'daily' },
    { id: '2', title: 'History Review Session Reminder', time: '2024-11-11T16:00:00', frequency: 'weekly' }
];

// Flag to toggle between mock data and real API data - update once API in place
let isApiConnected = false;

// Reference to the FullCalendar instance
let calendar;

// Function to initialize the FullCalendar instance
function initializeCalendar() {
    const calendarEl = document.getElementById('calendar');
    if (calendarEl) {
        calendar = new FullCalendar.Calendar(calendarEl, {
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

// Add event to calendar from sidebar input
function setupEventCreation() {
    const createEventButton = document.getElementById('create-event');
    if (createEventButton) {
        createEventButton.addEventListener('click', () => {
            const title = document.getElementById('event-title').value;
            const date = document.getElementById('event-date').value;
            const startTime = document.getElementById('event-start-time').value;
            const endTime = document.getElementById('event-end-time').value;

            if (title && date && startTime && endTime) {
                const start = `${date}T${startTime}`;
                const end = `${date}T${endTime}`;

                calendar.addEvent({
                    title: title,
                    start: start,
                    end: end
                });

                // Clear form fields and close the sidebar
                document.getElementById('event-title').value = '';
                document.getElementById('event-date').value = '';
                document.getElementById('event-start-time').value = '';
                document.getElementById('event-end-time').value = '';
                document.getElementById('event-sidebar').classList.remove('open');
            } else {
                alert("Please fill out all fields.");
            }
        });
    }
}

// Function to add a reminder notification to the dropdown
function addNotification(message) {
    const notificationList = document.getElementById('notification-list');
    const notificationCount = document.getElementById('notification-count');

    if (notificationList && notificationCount) {
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
}

// Setup DOM event listeners (only run if elements exist)
function setupDOMListeners() {
    const notificationContainer = document.getElementById('notification-container');
    if (notificationContainer) {
        notificationContainer.addEventListener('click', function () {
            this.classList.toggle('active');
        });
    }

    const createEventButton = document.getElementById('create-event-button');
    const eventSidebar = document.getElementById('event-sidebar');
    if (createEventButton && eventSidebar) {
        createEventButton.addEventListener('click', () => {
            eventSidebar.classList.toggle('open');
        });

        // Close sidebar when clicking outside of it
        document.addEventListener('click', (event) => {
            const isClickInsideSidebar = eventSidebar.contains(event.target);
            const isClickOnButton = createEventButton.contains(event.target);

            if (!isClickInsideSidebar && !isClickOnButton) {
                eventSidebar.classList.remove('open');
            }
        });
    }
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
    const numberElement = document.getElementById('remind-before-number');
    const typeElement = document.getElementById('remind-before-type');

    if (numberElement && typeElement) {
        const number = parseInt(numberElement.value, 10);
        const type = typeElement.value;
        return { number, type };
    }
    return { number: 10, type: 'days' };
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

// Initialize the calendar and setup listeners on DOM load
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeCalendar();
        setupEventCreation();
        setupDOMListeners();
    });
}

module.exports = { fetchEvents, sortEvents, filterEvents, checkReminders, updateReminderTime, mockReminders };