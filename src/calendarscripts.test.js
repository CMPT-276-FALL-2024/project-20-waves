// calendarscripts.test.js

const { fetchEvents, sortEvents, filterEvents, checkReminders, updateReminderTime } = require('./calendarscripts');

// Mock data for events testing
const mockEvents = [
    { id: '1', title: 'Math Study Group', start: '2024-11-10T10:00:00', end: '2024-11-10T12:00:00' },
    { id: '2', title: 'History Review Session', start: '2024-11-11T14:00:00', end: '2024-11-11T15:30:00' },
    { id: '3', title: 'Science Project', start: '2024-11-12T09:00:00', end: '2024-11-12T10:30:00' }
];

// Mock data for reminders testing
const mockReminders = [
    { id: '1', title: 'Math Study Group Reminder', time: '2024-11-13T10:00:00', frequency: 'daily' },
    { id: '2', title: 'History Review Session Reminder', time: '2024-11-13T14:00:00', frequency: 'weekly' }
];

// Mock the DOM structure
beforeEach(() => {
    document.body.innerHTML = `
        <div id="notification-container" class="notification-container">
            <span id="notification-bell" class="notification-bell">!</span>
            <span id="notification-count" class="notification-count">0</span>
            <div id="notification-dropdown" class="notification-dropdown">
                <ul id="notification-list"></ul>
            </div>
        </div>
        <input type="number" id="remind-before-number" value="10">
        <select id="remind-before-type">
            <option value="minutes">minutes</option>
            <option value="hours">hours</option>
            <option value="days" selected>days</option>
            <option value="weeks">weeks</option>
        </select>
    `;
});

describe('Event management functions', () => {
    test('fetchEvents should return mock events if API is not connected', () => {
        const events = fetchEvents();
        expect(events).toEqual(mockEvents);
    });

    test('sortEvents should sort events by date', () => {
        const sortedEvents = sortEvents('date', mockEvents);
        expect(sortedEvents[0].title).toBe('Math Study Group');
        expect(sortedEvents[1].title).toBe('History Review Session');
        expect(sortedEvents[2].title).toBe('Science Project');
    });

    test('sortEvents should sort events by title', () => {
        const sortedEvents = sortEvents('title', mockEvents);
        expect(sortedEvents[0].title).toBe('History Review Session');
        expect(sortedEvents[1].title).toBe('Math Study Group');
        expect(sortedEvents[2].title).toBe('Science Project');
    });

    test('filterEvents should filter events by keyword', () => {
        const filteredEvents = filterEvents('Math', mockEvents);
        expect(filteredEvents.length).toBe(1);
        expect(filteredEvents[0].title).toBe('Math Study Group');
    });

    test('filterEvents should return no events if keyword does not match any title', () => {
        const filteredEvents = filterEvents('Nonexistent', mockEvents);
        expect(filteredEvents.length).toBe(0);
    });
});

describe('Reminder functionality', () => {
    test('checkReminders should trigger reminders at the correct time', () => {
        jest.useFakeTimers().setSystemTime(new Date('2024-11-13T10:00:00').getTime());
        console.log = jest.fn();
        checkReminders(mockReminders);
        expect(console.log).toHaveBeenCalledWith('Reminder: Math Study Group Reminder');
        jest.useRealTimers();
    });

    test('updateReminderTime should correctly adjust reminder time based on daily frequency', () => {
        const dailyReminder = { ...mockReminders[0] };
        updateReminderTime(dailyReminder);
        const updatedDate = new Date(dailyReminder.time).getDate();
        expect(updatedDate).toBe(14); // Expected next day
    });

    test('updateReminderTime should correctly adjust reminder time based on weekly frequency', () => {
        const weeklyReminder = { ...mockReminders[1] };
        updateReminderTime(weeklyReminder);
        const updatedDate = new Date(weeklyReminder.time).getDate();
        expect(updatedDate).toBe(20); // Expected one week later
    });
});