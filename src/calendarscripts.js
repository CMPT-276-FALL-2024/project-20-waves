// Mock reminder data
const mockReminders = [
    { id: '1', title: 'Math Study Group Reminder', time: '2024-11-14T16:00:00', frequency: 'daily' },
    { id: '2', title: 'History Review Session Reminder', time: '2024-11-16T16:00:00', frequency: 'weekly' }
];

// Flag to toggle between mock data and real API data
let isApiConnected = false;

// Reference to the FullCalendar instance
let calendar;

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
            },
            // Ensures date click functionality works independently
            dateClick: function(info) {
                const clickedDate = info.dateStr; // Get the date string in 'YYYY-MM-DD' format
                document.getElementById('event-start-date').value = clickedDate;
                document.getElementById('event-end-date').value = clickedDate;
                openSidebar();
            },
            selectable: true,
            select: function(info) {
                populateSidebarForDateRange(info.start, info.end);
                setTimeout(openSidebar, 10); // Open the sidebar
            },
            // Event hover callbacks
            eventMouseEnter: function(info) {
                showEventTooltip(info.event);
            },
            eventMouseLeave: function(info) {
                hideEventTooltip();
            }
        });
        calendar.render();
    }
}


function showEventTooltip(event) {
    const tooltip = document.createElement('div');
    tooltip.id = 'event-tooltip';
    tooltip.className = 'event-tooltip';

    // Format start and end times to display only hours and minutes
    const startTime = event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endTime = event.end ? event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

    tooltip.innerHTML = `
        <strong>${event.title}</strong><br>
        Start: ${startTime}<br>
        ${endTime ? `End: ${endTime}` : ''}
    `;

    // Set the tooltip position to follow the mouse
    document.addEventListener('mousemove', positionTooltip);
    document.body.appendChild(tooltip);
}

function hideEventTooltip() {
    const tooltip = document.getElementById('event-tooltip');
    if (tooltip) {
        tooltip.remove();
    }
    document.removeEventListener('mousemove', positionTooltip);
}

// Helper function to position the tooltip near the mouse cursor
function positionTooltip(event) {
    const tooltip = document.getElementById('event-tooltip');
    if (tooltip) {
        tooltip.style.left = `${event.pageX + 15}px`;
        tooltip.style.top = `${event.pageY + 15}px`;
    }
}

// Populate the sidebar with start and end times based on a range selection
function populateSidebarForDateRange(start, end) {
    const startDateStr = start.toISOString().split('T')[0];
    const startTime = start.toTimeString().slice(0, 5); // format HH:MM

    const endDateStr = end.toISOString().split('T')[0];
    const endTime = end.toTimeString().slice(0, 5); // format HH:MM

    // Set the start and end date/time fields in the sidebar
    document.getElementById('event-start-date').value = startDateStr;
    document.getElementById('event-end-date').value = endDateStr;
    document.getElementById('event-start-time').value = startTime;
    document.getElementById('event-end-time').value = endTime;
}

// Open the sidebar
function openSidebar() {
    const eventSidebar = document.getElementById('event-sidebar');
    if (!eventSidebar.classList.contains('open')) {
        eventSidebar.classList.add('open');
    }
}

// Close the sidebar
function closeSidebar() {
    const eventSidebar = document.getElementById('event-sidebar');
    eventSidebar.classList.remove('open');
}

// Setup DOM event listeners for sidebar behavior and Create Event button
function setupDOMListeners() {
    const createEventButton = document.getElementById('create-event-button');
    const eventSidebar = document.getElementById('event-sidebar');

    if (createEventButton && eventSidebar) {
        // Open sidebar with current date and time on Create Event button click
        createEventButton.addEventListener('click', () => {
            const now = new Date();
            const currentDate = now.toISOString().split('T')[0];
            const currentTime = now.toTimeString().slice(0, 5);

            // Set the start and end dates and times for the default event
            document.getElementById('event-start-date').value = currentDate;
            document.getElementById('event-start-time').value = currentTime;

            // Set the end time to one hour later on the same date
            const endDate = new Date(now);
            endDate.setHours(endDate.getHours() + 1);
            document.getElementById('event-end-date').value = endDate.toISOString().split('T')[0];
            document.getElementById('event-end-time').value = endDate.toTimeString().slice(0, 5);

            // Open the sidebar
            openSidebar();
        });

        // Close sidebar only if clicking outside both the sidebar and the button
        document.addEventListener('click', (event) => {
            const isClickInsideSidebar = eventSidebar.contains(event.target);
            const isClickOnButton = createEventButton.contains(event.target);

            if (!isClickInsideSidebar && !isClickOnButton) {
                closeSidebar();
            }
        });
    }
}

// Setup the create event action in the sidebar
function setupEventCreation() {
    const createEventButton = document.getElementById('create-event');
    if (createEventButton) {
        createEventButton.addEventListener('click', () => {
            const title = document.getElementById('event-title').value;
            const startDate = document.getElementById('event-start-date').value;
            const endDate = document.getElementById('event-end-date').value;
            const startTime = document.getElementById('event-start-time').value;
            const endTime = document.getElementById('event-end-time').value;

            if (!title || !startDate || !startTime || !endDate || !endTime) {
                alert("Please fill out all fields.");
                return;
            }

            const start = `${startDate}T${startTime}`;
            const end = `${endDate}T${endTime}`;

            calendar.addEvent({
                title: title,
                start: start,
                end: end,
                allDay: false
            });

            // Clear form fields and close the sidebar
            document.getElementById('event-title').value = '';
            document.getElementById('event-start-date').value = '';
            document.getElementById('event-start-time').value = '';
            document.getElementById('event-end-date').value = '';
            document.getElementById('event-end-time').value = '';

            closeSidebar();
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

// Initialize the calendar and setup listeners on DOM load
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeCalendar();
        setupEventCreation();
        setupDOMListeners();
    });
}

module.exports = { fetchEvents, initializeCalendar, showEventTooltip, hideEventTooltip };