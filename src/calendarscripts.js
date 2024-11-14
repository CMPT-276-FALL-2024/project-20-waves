// DEBUGGING: Set to false to use mock data, true to use API data
let isApiConnected = false;

// Reference to the FullCalendar instance
let calendar;
// Keeps track of the event being edited
let selectedEvent = null;

// Function to initialize the FullCalendar
function initializeCalendar() {
    const calendarEl = document.getElementById('calendar');
        calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            selectable: true,
            events: fetchEvents(),
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            dateClick: function(info) {
                openCreateEventSidebar(info.date);
            },
            select: function(info) {
                console.log("Date range selected from:", info.start, "to", info.end);
                populateSidebarForDateRange(info.start, info.end);
                openSidebar();
            },
            eventClick: function(info) {
                openEditEventSidebar(info.event);
            },
            // Tooltip functions for hovering over events
            eventMouseEnter: function(info) {
                showEventTooltip(info.event);
            },
            eventMouseLeave: function(info) {
                hideEventTooltip();
            }
        });
        calendar.render();
    }

// Function to show the tooltip for an event
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

function populateSidebarForDateRange(start, end) {
    document.getElementById('event-start-date').value = start.toISOString().split('T')[0];
    document.getElementById('event-start-time').value = start.toTimeString().slice(0, 5);
    document.getElementById('event-end-date').value = end.toISOString().split('T')[0];
    document.getElementById('event-end-time').value = end.toTimeString().slice(0, 5);
}

function openCreateEventSidebar(date) {
    // Clear form for a new event and adjust buttons
    clearEventForm();
    document.getElementById('create-event').style.display = 'block';
    document.getElementById('delete-event').style.display = 'none';
    document.getElementById('edit-event').style.display = 'none';
    populateSidebarWithDate(date);
    openSidebar();
    selectedEvent = null; // Ensure no event is selected for editing
}

function openEditEventSidebar(event) {
    selectedEvent = event;
    populateSidebarWithEventDetails(event);

    // Show edit and delete buttons, hide create button
    document.getElementById('create-event').style.display = 'none';
    document.getElementById('edit-event').style.display = 'block';
    document.getElementById('delete-event').style.display = 'block';

    openSidebar();
}

function populateSidebarWithEventDetails(event) {
    document.getElementById('event-title').value = event.title;
    document.getElementById('event-start-date').value = event.start.toISOString().split('T')[0];
    document.getElementById('event-start-time').value = event.start.toTimeString().slice(0, 5);
    if (event.end) {
        document.getElementById('event-end-date').value = event.end.toISOString().split('T')[0];
        document.getElementById('event-end-time').value = event.end.toTimeString().slice(0, 5);
    }
}

function populateSidebarWithDate(date) {
    const currentDate = date.toISOString().split('T')[0];
    const currentTime = date.toTimeString().slice(0, 5);

    document.getElementById('event-start-date').value = currentDate;
    document.getElementById('event-start-time').value = currentTime;

    // Set a default end time 15 minutes later
    const endDate = new Date(date);
    endDate.setMinutes(endDate.getMinutes() + 15);
    document.getElementById('event-end-date').value = endDate.toISOString().split('T')[0];
    document.getElementById('event-end-time').value = endDate.toTimeString().slice(0, 5);
}

function setupCreateEventButton() {
    const createEventButton = document.getElementById('create-event-button');
    if (createEventButton) {
        createEventButton.addEventListener('click', () => {
            openCreateEventSidebar(new Date()); // Open sidebar with the current date as default
        });
    }
}

function setupEditEventButton() {
    const editEventButton = document.getElementById('edit-event');
    if (editEventButton) {
        editEventButton.addEventListener('click', () => {
            if (!selectedEvent) return; // Ensure an event is selected

            // Get updated details from the sidebar form
            const title = document.getElementById('event-title').value;
            const startDate = document.getElementById('event-start-date').value;
            const startTime = document.getElementById('event-start-time').value;
            const endDate = document.getElementById('event-end-date').value;
            const endTime = document.getElementById('event-end-time').value;

            // Create new date-time strings to avoid unintended date mutations
            const newStart = `${startDate}T${startTime}`;
            const newEnd = `${endDate}T${endTime}`;

            // Update event properties
            selectedEvent.setProp('title', title);
            selectedEvent.setStart(newStart); // Set the new start date-time
            selectedEvent.setEnd(newEnd); // Set the new end date-time

            // Clear selected event and close the sidebar
            selectedEvent = null;
            closeSidebar();
        });
    }
}

function setupEventCreation() {
    const createButton = document.getElementById('create-event');
    if (createButton) {
        createButton.addEventListener('click', () => {
            const title = document.getElementById('event-title').value;
            const startDate = document.getElementById('event-start-date').value;
            const startTime = document.getElementById('event-start-time').value;
            const endDate = document.getElementById('event-end-date').value;
            const endTime = document.getElementById('event-end-time').value;

            const start = `${startDate}T${startTime}`;
            const end = `${endDate}T${endTime}`;

            if (calendar) {
                calendar.addEvent({ title, start, end });
            }
        });
    }
}

function setupDeleteEventButton() {
    const deleteEventButton = document.getElementById('delete-event');
    if (deleteEventButton) {
        deleteEventButton.addEventListener('click', () => {
            if (selectedEvent) {
                selectedEvent.remove();
                closeSidebar();
                selectedEvent = null;
            }
        });
    }
}

function clearEventForm() {
    document.getElementById('event-title').value = '';
    document.getElementById('event-start-date').value = '';
    document.getElementById('event-start-time').value = '';
    document.getElementById('event-end-date').value = '';
    document.getElementById('event-end-time').value = '';
}

// Modify setupCloseSidebarListeners to directly reference closeSidebar
function setupCloseSidebarListeners() {
    const closeSidebarButton = document.getElementById('close-sidebar-button');

    if (closeSidebarButton) {
        closeSidebarButton.addEventListener('click', closeSidebar); // Direct reference to closeSidebar
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeSidebar();
        }
    });
}

// Sidebar control functions
function openSidebar() {
    const eventSidebar = document.getElementById('event-sidebar');
    if (!eventSidebar.classList.contains('open')) {
        eventSidebar.classList.add('open');
    }
}

function closeSidebar() {
    const eventSidebar = document.getElementById('event-sidebar');
    if (eventSidebar.classList.contains('open')) {
        eventSidebar.classList.remove('open');
        console.log("Sidebar closed."); // Debugging log
    }
}

// Mock event data for testing without API calls
function fetchEvents() {
    return isApiConnected ? fetchApiEvents() : getMockEvents();
}

// Mock events
function getMockEvents() {
    return [
        { id: '1', title: 'Math Study Group', start: '2024-11-10T10:00:00', end: '2024-11-10T12:00:00' },
        { id: '2', title: 'History Review Session', start: '2024-11-11T14:00:00', end: '2024-11-11T15:30:00' },
        { id: '3', title: 'Science Project', start: '2024-11-12T09:00:00', end: '2024-11-12T10:30:00' }
    ];
}

// Ensure all listeners are set up on DOM load
document.addEventListener('DOMContentLoaded', () => {
    initializeCalendar();
    setupEventCreation();
    setupCreateEventButton();
    setupEditEventButton();
    setupDeleteEventButton();
    setupCloseSidebarListeners(); // Set up close listeners for sidebar
    setupDOMListeners();
});


module.exports = {
    fetchEvents,
    initializeCalendar,
    showEventTooltip,
    hideEventTooltip,
    openSidebar,
    closeSidebar,
    setupEventCreation,
    setupDeleteEventButton,
    openCreateEventSidebar,
    openEditEventSidebar,
    setupCloseSidebarListeners,
};