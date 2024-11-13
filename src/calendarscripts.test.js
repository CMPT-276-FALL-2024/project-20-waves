const { fetchEvents, mockReminders } = require('./calendarscripts.js');

// Mocking DOM elements for tests
beforeEach(() => {
    document.body.innerHTML = `
        <div id="calendar"></div>
        <input type="date" id="event-start-date" />
        <input type="time" id="event-start-time" />
        <input type="date" id="event-end-date" />
        <input type="time" id="event-end-time" />
        <input type="text" id="event-title" />
        <button id="create-event">Create</button>
        <div id="event-sidebar" class="event-sidebar"></div>
        <button id="create-event-button">Create Event</button>
    `;

    // Mock the calendar object with an addEvent function for tests
    global.calendar = { addEvent: jest.fn() };
});

// Mock the setupEventCreation function to add the click event listener to the Create button
function setupEventCreation() {
    const createEventButton = document.getElementById('create-event');
    if (createEventButton) {
        createEventButton.addEventListener('click', () => {
            const title = document.getElementById('event-title').value;
            const startDate = document.getElementById('event-start-date').value;
            const startTime = document.getElementById('event-start-time').value;
            const endDate = document.getElementById('event-end-date').value;
            const endTime = document.getElementById('event-end-time').value;

            const start = `${startDate}T${startTime}`;
            const end = `${endDate}T${endTime}`;

            calendar.addEvent({
                title: title,
                start: start,
                end: end,
                allDay: false
            });
        });
    }
}

describe('Calendar Scripts', () => {

    // Test: Fetch Events
    test('fetchEvents should return mock events when API is not connected', () => {
        const events = fetchEvents();
        expect(events).toEqual([
            { id: '1', title: 'Math Study Group', start: '2024-11-10T10:00:00', end: '2024-11-10T12:00:00' },
            { id: '2', title: 'History Review Session', start: '2024-11-11T14:00:00', end: '2024-11-11T15:30:00' },
            { id: '3', title: 'Science Project', start: '2024-11-12T09:00:00', end: '2024-11-12T10:30:00' }
        ]);
    });

    // Mocking openSidebar and closeSidebar functionality directly
    function openSidebar() {
        document.getElementById('event-sidebar').classList.add('open');
    }

    function closeSidebar() {
        document.getElementById('event-sidebar').classList.remove('open');
    }

    // Test: Open Sidebar
    test('openSidebar should add "open" class to the event sidebar', () => {
        const sidebar = document.getElementById('event-sidebar');
        sidebar.classList.remove('open'); // Ensure it's initially closed
        openSidebar();
        expect(sidebar.classList.contains('open')).toBe(true);
    });

    // Test: Close Sidebar
    test('closeSidebar should remove "open" class from the event sidebar', () => {
        const sidebar = document.getElementById('event-sidebar');
        sidebar.classList.add('open'); // Ensure it's initially open
        closeSidebar();
        expect(sidebar.classList.contains('open')).toBe(false);
    });

    // Mocking populateSidebarForDateRange functionality directly
    function populateSidebarForDateRange(start, end) {
        document.getElementById('event-start-date').value = start.toISOString().split('T')[0];
        document.getElementById('event-start-time').value = start.toTimeString().slice(0, 5);
        document.getElementById('event-end-date').value = end.toISOString().split('T')[0];
        document.getElementById('event-end-time').value = end.toTimeString().slice(0, 5);
    }

    // Test: Populate Sidebar for Date Range
    test('populateSidebarForDateRange should set start and end date and time fields', () => {
        const start = new Date('2024-11-12T09:00:00');
        const end = new Date('2024-11-12T12:30:00');

        populateSidebarForDateRange(start, end);

        expect(document.getElementById('event-start-date').value).toBe('2024-11-12');
        expect(document.getElementById('event-start-time').value).toBe('09:00');
        expect(document.getElementById('event-end-date').value).toBe('2024-11-12');
        expect(document.getElementById('event-end-time').value).toBe('12:30');
    });

    // Test: Adding an event with start and end date-time
    test('should add an event with start and end date-time', () => {
        document.getElementById('event-start-date').value = '2024-11-14';
        document.getElementById('event-start-time').value = '09:00';
        document.getElementById('event-end-date').value = '2024-11-14';
        document.getElementById('event-end-time').value = '11:00';

        const mockAddEvent = jest.fn();
        global.calendar.addEvent = mockAddEvent;

        setupEventCreation();
        document.getElementById('create-event').click();

        expect(mockAddEvent).toHaveBeenCalledWith({
            title: '',
            start: '2024-11-14T09:00',
            end: '2024-11-14T11:00',
            allDay: false
        });
    });
});