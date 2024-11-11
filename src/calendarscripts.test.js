// Import functions to test from calendarscripts.js
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

// Tests for fetchEvents, sortEvents, and filterEvents
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

// Tests for reminder functionality
describe('Reminder functionality', () => {
    test('checkReminders should trigger reminders at the correct time', () => {
        // Mock current time to match one reminder time for testing
        jest.useFakeTimers().setSystemTime(new Date('2024-11-13T10:00:00').getTime());

        console.log = jest.fn(); // Mock console.log to capture outputs
        checkReminders(mockReminders);

        // Verify that the correct reminder message is logged
        expect(console.log).toHaveBeenCalledWith('Reminder: Math Study Group Reminder');

        jest.useRealTimers(); // Restore real timers after the test
    });

    test('updateReminderTime should correctly adjust reminder time based on daily frequency', () => {
        const dailyReminder = { ...mockReminders[0] }; // Clone daily reminder

        updateReminderTime(dailyReminder);

        // Check that the new date is one day after the original
        const updatedDate = new Date(dailyReminder.time).getDate();
        expect(updatedDate).toBe(14); // Expected next day
    });

    test('updateReminderTime should correctly adjust reminder time based on weekly frequency', () => {
        const weeklyReminder = { ...mockReminders[1] }; // Clone weekly reminder

        updateReminderTime(weeklyReminder);

        // Check that the new date is one week after the original
        const updatedDate = new Date(weeklyReminder.time).getDate();
        expect(updatedDate).toBe(20); // Expected one week later
    });
});