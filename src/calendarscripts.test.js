// Import functions from calendarscripts.js
const { fetchEvents, sortEvents, filterEvents } = require('./calendarscripts');

// Mock data for testing
const mockEvents = [
    { id: '1', title: 'Math Study Group', start: '2024-11-10T10:00:00', end: '2024-11-10T12:00:00' },
    { id: '2', title: 'History Review Session', start: '2024-11-11T14:00:00', end: '2024-11-11T15:30:00' },
    { id: '3', title: 'Science Project', start: '2024-11-12T09:00:00', end: '2024-11-12T10:30:00' }
];

describe('fetchEvents', () => {
    test('should return mock events if API is not connected', () => {
        const events = fetchEvents();
        expect(events).toEqual(mockEvents);
    });
});

describe('sortEvents', () => {
    test('should sort events by date', () => {
        const sortedEvents = sortEvents('date', mockEvents);
        expect(sortedEvents[0].title).toBe('Math Study Group');
        expect(sortedEvents[1].title).toBe('History Review Session');
        expect(sortedEvents[2].title).toBe('Science Project');
    });

    test('should sort events by title', () => {
        const sortedEvents = sortEvents('title', mockEvents);
        expect(sortedEvents[0].title).toBe('History Review Session');
        expect(sortedEvents[1].title).toBe('Math Study Group');
        expect(sortedEvents[2].title).toBe('Science Project');
    });
});

describe('filterEvents', () => {
    test('should filter events by keyword', () => {
        const filteredEvents = filterEvents('Math', mockEvents);
        expect(filteredEvents.length).toBe(1);
        expect(filteredEvents[0].title).toBe('Math Study Group');
    });

    test('should return no events if keyword does not match any title', () => {
        const filteredEvents = filterEvents('Nonexistent', mockEvents);
        expect(filteredEvents.length).toBe(0);
    });
});