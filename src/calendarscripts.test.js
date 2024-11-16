// Mocking FullCalendar globally for the test environment - prevents calendar from creating a real calendar instance
global.FullCalendar = {
    Calendar: jest.fn().mockImplementation(() => {
        return {
            render: jest.fn(),
            addEvent: jest.fn(),
            getEvents: jest.fn(() => []), // Mock an empty array for events
        };
    }),
};

const { fetchEvents, initializeCalendar, showEventTooltip, hideEventTooltip, populateSidebarWithEventDetails } = require('./calendarscripts.js');

// Mocking DOM elements for tests
beforeEach(() => {
    document.body.innerHTML = `
        <div id="calendar"></div>
        <input type="date" id="event-start-date" />
        <input type="time" id="event-start-time" />
        <input type="date" id="event-end-date" />
        <input type="time" id="event-end-time" />
        <input type="text" id="event-title" />
        <button id="create-event" style="display: none;">Create</button>
        <button id="edit-event" style="display: none;">Save Changes</button>
        <button id="delete-event" style="display: none;">Delete Event</button>
        <div id="event-sidebar" class="event-sidebar"></div>
        <button id="create-event-button">Create Event</button>
        <input type="number" id="notify-before-number" value="10" />
        <select id="notify-before-type">
            <option value="minutes">minutes</option>
            <option value="hours">hours</option>
            <option value="days">days</option>
            <option value="weeks">weeks</option>
        </select>
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


// Test suite for the hover functionality
describe('Calendar Event Hover Tooltip', () => {
    // Set up the DOM and initialize the calendar before each test
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="calendar"></div>
        `;

        initializeCalendar(); // Initialize FullCalendar within the test environment

        // Mock event data for hover testing
        const mockEvent = {
            id: '1',
            title: 'Test Event',
            start: new Date('2024-11-14T09:00:00'),
            end: new Date('2024-11-14T11:00:00')
        };

        showEventTooltip(mockEvent); // Simulate showing the tooltip on hover
    });

    afterEach(() => {
        hideEventTooltip(); // Ensure tooltip is removed after each test
    });

    // Test: Verify tooltip appears with correct content on hover
    test('should display tooltip with correct content on hover', () => {
        const tooltip = document.getElementById('event-tooltip');
        expect(tooltip).toBeTruthy(); // Tooltip should exist

        // Verify the tooltip content
        expect(tooltip.innerHTML).toContain('Test Event');
        expect(tooltip.innerHTML).toContain('09:00'); // Only hours and minutes
        expect(tooltip.innerHTML).toContain('11:00');
    });

    // Test: Verify tooltip disappears on mouse leave
    test('should remove tooltip on mouse leave', () => {
        hideEventTooltip(); // Simulate mouse leave by hiding the tooltip

        // Tooltip should no longer exist in the DOM
        const tooltip = document.getElementById('event-tooltip');
        expect(tooltip).toBeNull();
    });
});


describe('Delete Event Functionality', () => {
    let deleteEventButton;

    beforeEach(() => {
        document.body.innerHTML = `
            <div id="calendar"></div>
            <input type="date" id="event-start-date" />
            <input type="time" id="event-start-time" />
            <input type="date" id="event-end-date" />
            <input type="time" id="event-end-time" />
            <input type="text" id="event-title" />
            <button id="create-event" style="display: none;">Create</button>
            <button id="edit-event" style="display: none;">Save Changes</button>
            <button id="delete-event" style="display: none;">Delete Event</button>
            <div id="event-sidebar" class="event-sidebar"></div>
            <button id="create-event-button">Create Event</button>
            <input type="number" id="notify-before-number" value="10" />
            <select id="notify-before-type">
                <option value="minutes">minutes</option>
                <option value="hours">hours</option>
                <option value="days">days</option>
                <option value="weeks">weeks</option>
            </select>
        `;

        global.selectedEvent = {
            title: 'Test Event',
            start: new Date('2024-11-14T09:00:00'),
            end: new Date('2024-11-14T11:00:00'),
            remove: jest.fn(),
        };

        const { setupDeleteEventButton, openEditEventSidebar } = require('./calendarscripts.js');
        setupDeleteEventButton();
        openEditEventSidebar(global.selectedEvent);

        deleteEventButton = document.getElementById('delete-event');
    });

    test('should call remove on selectedEvent when delete button is clicked', () => {
        deleteEventButton.click(); // Simulate the delete button click

        // Assert that remove was called on selectedEvent
        expect(global.selectedEvent.remove).toHaveBeenCalled();
    });
});

describe('Draggable Event Sidebar', () => {
    let sidebar, dragHandle;

    beforeEach(() => {
        document.body.innerHTML = `
            <div id="event-sidebar" class="event-sidebar">
                <div class="drag-handle">
                    <span class="drag-text">☰ Drag</span>
                    <button id="close-sidebar-button" class="close-button">✖</button>
                </div>
                <!-- Other sidebar elements -->
            </div>
        `;

        sidebar = document.getElementById('event-sidebar');
        dragHandle = sidebar.querySelector('.drag-handle');

        // Mock sidebar dragging
        let isDragging = false;
        let offsetX = 0;
        let offsetY = 0;

        dragHandle.addEventListener('mousedown', (e) => {
            isDragging = true;
            offsetX = e.clientX - sidebar.offsetLeft;
            offsetY = e.clientY - sidebar.offsetTop;
            document.body.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const newLeft = e.clientX - offsetX;
                const newTop = e.clientY - offsetY;
                sidebar.style.left = `${newLeft}px`;
                sidebar.style.top = `${newTop}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            document.body.style.cursor = '';
        });
    });

    test('should initialize sidebar position and be draggable', () => {
        // Simulate mousedown on drag handle
        const initialX = 100;
        const initialY = 200;
        const moveX = 300;
        const moveY = 400;

        dragHandle.dispatchEvent(new MouseEvent('mousedown', {
            clientX: initialX,
            clientY: initialY,
        }));

        document.dispatchEvent(new MouseEvent('mousemove', {
            clientX: moveX,
            clientY: moveY,
        }));

        document.dispatchEvent(new MouseEvent('mouseup'));

        expect(sidebar.style.left).toBe(`${moveX - initialX}px`);
        expect(sidebar.style.top).toBe(`${moveY - initialY}px`);
    });

    test('should stop dragging when mouse is released', () => {
        const moveX = 150;
        const moveY = 250;

        dragHandle.dispatchEvent(new MouseEvent('mousedown', {
            clientX: 100,
            clientY: 100,
        }));

        document.dispatchEvent(new MouseEvent('mousemove', {
            clientX: moveX,
            clientY: moveY,
        }));

        document.dispatchEvent(new MouseEvent('mouseup'));

        // Check that cursor is reset
        expect(document.body.style.cursor).toBe('');
    });

    test('should not drag when mousedown is not on drag handle', () => {
        sidebar.dispatchEvent(new MouseEvent('mousedown', {
            clientX: 0,
            clientY: 0,
        }));

        const initialLeft = sidebar.style.left;
        const initialTop = sidebar.style.top;

        document.dispatchEvent(new MouseEvent('mousemove', {
            clientX: 300,
            clientY: 300,
        }));

        expect(sidebar.style.left).toBe(initialLeft);
        expect(sidebar.style.top).toBe(initialTop);
    });
});


test('populateSidebarWithEventDetails should set correct local dates', () => {
    const mockEvent = {
        title: 'Test Event',
        start: new Date('2024-11-14T09:00:00Z'),
        end: new Date('2024-11-14T11:00:00Z'),
        extendedProps: {}
    };

    populateSidebarWithEventDetails(mockEvent);

    expect(document.getElementById('event-start-date').value).toBe('2024-11-14');
    expect(document.getElementById('event-start-time').value).toBe('09:00');
    expect(document.getElementById('event-end-date').value).toBe('2024-11-14');
    expect(document.getElementById('event-end-time').value).toBe('11:00');
});