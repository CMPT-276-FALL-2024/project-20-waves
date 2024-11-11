// Import FullCalendar if necessary for your module system
// const FullCalendar = require('@fullcalendar/core');

document.addEventListener('DOMContentLoaded', function() {
    const calendarEl = document.getElementById('calendar');

    if (calendarEl) {
        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            events: fetchEvents(), // Fetch events (mock or API-based)
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }
        });

        calendar.render();
    }
});

// Flag to toggle between mock data and real API data
let isApiConnected = false;

// Function to decide which data source to use
function fetchEvents() {
    return isApiConnected ? fetchApiEvents() : getMockEvents();
}

// Mock data for testing without API calls
function getMockEvents() {
    return [
        { id: '1', title: 'Math Study Group', start: '2024-11-10T10:00:00', end: '2024-11-10T12:00:00' },
        { id: '2', title: 'History Review Session', start: '2024-11-11T14:00:00', end: '2024-11-11T15:30:00' },
        { id: '3', title: 'Science Project', start: '2024-11-12T09:00:00', end: '2024-11-12T10:30:00' }
    ];
}

// Placeholder function for API events (to be implemented with Google Calendar API)
function fetchApiEvents() {
    // Replace with API logic in the future
    return []; // Placeholder, return real API data when connected
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

// Function to update the calendar view
function updateCalendar(events) {
    const calendarEl = document.getElementById('calendar');
    if (calendarEl) {
        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            events: events,
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }
        });
        calendar.render();
    }
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { fetchEvents, sortEvents, filterEvents, getMockEvents };
}