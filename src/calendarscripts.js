// DEBUGGING: Set to false to use mock data, true to use API data
let isApiConnected = false;

// Reference to the FullCalendar instance
let calendar;

// Keeps track of the event being edited
let selectedEvent = null;

// Initialize FullCalendar
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
        // Tooltop functions for hovering over events
        eventMouseEnter: function(info) {
            showEventTooltip(info.event);
        },
        eventMouseLeave: function(info) {
            hideEventTooltip();
        }
    });
    calendar.render();
}

// Tooltip functionality
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

    // Set tooltip to follow cursor
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
// Helper function to position tooltip near cursor
function positionTooltip(event) {
    const tooltip = document.getElementById('event-tooltip');
    if (tooltip) {
        tooltip.style.left = `${event.pageX + 15}px`;
        tooltip.style.top = `${event.pageY + 15}px`;
    }
}

// Open and closing of sidebar
function openCreateEventSidebar(date) {
// clear form for a new event and adjust buttons
    clearEventForm();
    document.getElementById('create-event').style.display = 'block';
    document.getElementById('delete-event').style.display = 'none';
    document.getElementById('edit-event').style.display = 'none';
    populateSidebarWithDate(date);
    openSidebar();
    selectedEvent = null;
}

function openEditEventSidebar(event) {
    selectedEvent = event;
    populateSidebarWithEventDetails(event);
    document.getElementById('create-event').style.display = 'none';
    document.getElementById('edit-event').style.display = 'block';
    document.getElementById('delete-event').style.display = 'block';
    openSidebar();
}

// Sidebar population functions
// Populate sidebar with date range
function populateSidebarForDateRange(start, end) {
    document.getElementById('event-start-date').value = start.toISOString().split('T')[0];
    document.getElementById('event-start-time').value = start.toTimeString().slice(0, 5);
    document.getElementById('event-end-date').value = end.toISOString().split('T')[0];
    document.getElementById('event-end-time').value = end.toTimeString().slice(0, 5);
}
// Populate sidebar with event details (for editing)
function populateSidebarWithEventDetails(event) {
    document.getElementById('event-title').value = event.title;
    document.getElementById('event-start-date').value = event.start.toISOString().split('T')[0];
    document.getElementById('event-start-time').value = event.start.toTimeString().slice(0, 5);

    const notifyNumberElement = document.getElementById('notify-before-number');
    const notifyTypeElement = document.getElementById('notify-before-type');

    if (event.extendedProps && event.extendedProps.notification && notifyNumberElement && notifyTypeElement) {
        const { notifyBeforeNumber, notifyBeforeType } = event.extendedProps.notification;
        notifyNumberElement.value = notifyBeforeNumber;
        notifyTypeElement.value = notifyBeforeType;
    } else if (notifyNumberElement && notifyTypeElement) {
        notifyNumberElement.value = 10;
        notifyTypeElement.value = 'minutes';
    }

    if (event.end) {
        document.getElementById('event-end-date').value = event.end.toISOString().split('T')[0];
        document.getElementById('event-end-time').value = event.end.toTimeString().slice(0, 5);
    }
}

// Populate sidebar with date (from click)
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

// Event creation and editing
function setupCreateEventButton() {
    const createEventButton = document.getElementById('create-event-button');
    if (createEventButton) {
        createEventButton.addEventListener('click', () => {
            openCreateEventSidebar(new Date());
        });
    }
}

function setupEditEventButton() {
    const editEventButton = document.getElementById('edit-event');
    if (editEventButton) {
        editEventButton.addEventListener('click', () => {
            if (!selectedEvent) return;

            // Get updated details from the sidebar form
            const title = document.getElementById('event-title').value;
            const startDate = document.getElementById('event-start-date').value;
            const startTime = document.getElementById('event-start-time').value;
            const endDate = document.getElementById('event-end-date').value;
            const endTime = document.getElementById('event-end-time').value;

            const newStart = `${startDate}T${startTime}`;
            const newEnd = `${endDate}T${endTime}`;

            // Update event properties
            selectedEvent.setProp('title', title);
            selectedEvent.setStart(newStart);
            selectedEvent.setEnd(newEnd);

            // Clear selected event and close the sidebar
            selectedEvent = null;
            closeSidebar();
        });
    }
}

function setupEventCreation() {
    const createButton = document.getElementById('create-event'); // Button in the sidebar
    if (createButton) {
        createButton.addEventListener('click', () => {
            // Retrieve form values
            const title = document.getElementById('event-title').value.trim();
            const startDate = document.getElementById('event-start-date').value;
            const startTime = document.getElementById('event-start-time').value;
            const endDate = document.getElementById('event-end-date').value;
            const endTime = document.getElementById('event-end-time').value;

            // Check for required fields
            if (!title) {
                alert("Please enter a title for the event.");
                return;
            }
            if (!startDate || !startTime) {
                alert("Please enter a valid start date and time.");
                return;
            }
            if (!endDate || !endTime) {
                alert("Please enter a valid end date and time.");
                return;
            }

            // Check that end date/time is after start date/time
            const start = new Date(`${startDate}T${startTime}`);
            const end = new Date(`${endDate}T${endTime}`);
            if (end <= start) {
                alert("End time must be after start time.");
                return;
            }

            const notifyBeforeNumber = document.getElementById('notify-before-number').value;
            const notifyBeforeType = document.getElementById('notify-before-type').value;

            const notification = {
                notifyBeforeNumber: parseInt(notifyBeforeNumber),
                notifyBeforeType
            };

            if (calendar) {
                calendar.addEvent({
                    title,
                    start,
                    end,
                    extendedProps: { notification }
                });
            }

            closeSidebar();
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

// Event fetching
function fetchEvents() {
    return isApiConnected ? fetchApiEvents() : getMockEvents();
}

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
    setupCloseSidebarListeners();
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
    setupCloseSidebarListeners
};