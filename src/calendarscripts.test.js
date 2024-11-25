// Import functions to test
const {
  clearEventForm,
  setupNotificationToggle,
  populateSidebarWithDate,
  populateSidebarForDateRange,
  fetchGoogleCalendarEvents,
  openSidebar,
  closeSidebar,
  setupEditEventButton,
} = require("./calendarscripts");

describe("calendarscripts.js Tests", () => {
  // Test clearEventForm
  describe("clearEventForm", () => {
    it("should reset all form fields to default values", () => {
      const mockElements = {
        "event-title": { value: "Test Event" },
        "event-start-date": { value: "2024-11-22" },
        "event-start-time": { value: "10:00" },
        "event-end-date": { value: "2024-11-22" },
        "event-end-time": { value: "11:00" },
        "enable-notifications": { checked: true },
        "notification-options": { style: { display: "block" } },
      };

      jest
        .spyOn(document, "getElementById")
        .mockImplementation((id) => mockElements[id]);

      clearEventForm();

      expect(mockElements["event-title"].value).toBe("");
      expect(mockElements["event-start-date"].value).toBe("");
      expect(mockElements["event-start-time"].value).toBe("");
      expect(mockElements["event-end-date"].value).toBe("");
      expect(mockElements["event-end-time"].value).toBe("");
      expect(mockElements["enable-notifications"].checked).toBe(false);
      expect(mockElements["notification-options"].style.display).toBe("none");

      document.getElementById.mockRestore();
    });

    it("should not throw an error if elements are missing", () => {
      jest.spyOn(document, "getElementById").mockImplementation(() => null);

      expect(() => clearEventForm()).not.toThrow();

      document.getElementById.mockRestore();
    });
  });
  // Test setupNotificationToggle
  describe("setupNotificationToggle", () => {
    it("should toggle notification options display based on checkbox state", () => {
      const mockCheckbox = { addEventListener: jest.fn() };
      const mockOptions = { style: { display: "none" } };

      jest.spyOn(document, "getElementById").mockImplementation((id) => {
        if (id === "enable-notifications") return mockCheckbox;
        if (id === "notification-options") return mockOptions;
      });

      setupNotificationToggle();

      expect(mockCheckbox.addEventListener).toHaveBeenCalledWith(
        "change",
        expect.any(Function)
      );

      const handler = mockCheckbox.addEventListener.mock.calls[0][1];
      handler({ target: { checked: true } });
      expect(mockOptions.style.display).toBe("block");

      handler({ target: { checked: false } });
      expect(mockOptions.style.display).toBe("none");

      document.getElementById.mockRestore();
    });
  });
  // Test populateSidebarWithDate
  describe("populateSidebarWithDate", () => {
    it("should populate form fields with start date and default end time", () => {
      const mockElements = {
        "event-start-date": { value: "" },
        "event-start-time": { value: "" },
        "event-end-date": { value: "" },
        "event-end-time": { value: "" },
      };

      jest
        .spyOn(document, "getElementById")
        .mockImplementation((id) => mockElements[id]);

      const mockDate = new Date("2024-11-22T10:00:00");
      populateSidebarWithDate(mockDate);

      expect(mockElements["event-start-date"].value).toBe("2024-11-22");
      expect(mockElements["event-start-time"].value).toBe("10:00");
      expect(mockElements["event-end-date"].value).toBe("2024-11-22");
      expect(mockElements["event-end-time"].value).toBe("10:15");

      document.getElementById.mockRestore();
    });
  });
  // Test populateSidebarForDateRange
  describe("populateSidebarForDateRange", () => {
    it("should populate sidebar fields for a given date range", () => {
      const mockElements = {
        "event-start-date": { value: "" },
        "event-start-time": { value: "" },
        "event-end-date": { value: "" },
        "event-end-time": { value: "" },
      };

      jest
        .spyOn(document, "getElementById")
        .mockImplementation((id) => mockElements[id]);

      const start = new Date("2024-11-22T10:00:00");
      const end = new Date("2024-11-22T11:00:00");
      populateSidebarForDateRange(start, end);

      expect(mockElements["event-start-date"].value).toBe("2024-11-22");
      expect(mockElements["event-start-time"].value).toBe("10:00");
      expect(mockElements["event-end-date"].value).toBe("2024-11-22");
      expect(mockElements["event-end-time"].value).toBe("11:00");

      document.getElementById.mockRestore();
    });
  });
  // Test openSidebar
  describe("openSidebar", () => {
    it("should add 'open' class to sidebar", () => {
      const sidebar = { classList: { contains: jest.fn(), add: jest.fn() } };

      jest.spyOn(document, "getElementById").mockImplementation(() => sidebar);

      sidebar.classList.contains.mockReturnValue(false);
      openSidebar();

      expect(sidebar.classList.add).toHaveBeenCalledWith("open");

      document.getElementById.mockRestore();
    });
  });
  // Test closeSidebar
  describe("closeSidebar", () => {
    it("should remove 'open' class from sidebar", () => {
      const sidebar = { classList: { contains: jest.fn(), remove: jest.fn() } };

      jest.spyOn(document, "getElementById").mockImplementation(() => sidebar);

      sidebar.classList.contains.mockReturnValue(true);
      closeSidebar();

      expect(sidebar.classList.remove).toHaveBeenCalledWith("open");

      document.getElementById.mockRestore();
    });
  });
  // Test setupEditEventButton
  describe("setupEditEventButton", () => {
    it("should add click event listener to edit button", () => {
      const mockButton = { addEventListener: jest.fn() };

      jest
        .spyOn(document, "getElementById")
        .mockImplementation(() => mockButton);

      setupEditEventButton();

      expect(mockButton.addEventListener).toHaveBeenCalledWith(
        "click",
        expect.any(Function)
      );

      document.getElementById.mockRestore();
    });
  });
  // Test fetchGoogleCalendarEvents
  describe("fetchGoogleCalendarEvents", () => {
    beforeEach(() => {
      mockAccessToken = "mockAccessToken"; // Valid token
      mockGapiInited = true; // Ensure GAPI is initialized
      mockGapi = {
        client: {
          calendar: {
            events: {
              list: jest.fn().mockResolvedValue({ result: { items: [] } }), // Mock API response
            },
          },
        },
      };

      mockCalendar = {
        addEventSource: jest.fn(),
        removeAllEvents: jest.fn(),
      };

      //      jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
      jest.clearAllMocks();
      jest.restoreAllMocks();
    });

    it("should call gapi.client.calendar.events.list", async () => {
      // Call the function
      await fetchGoogleCalendarEvents(mockAccessToken, mockGapi, mockCalendar);
      // Verify API call
      expect(mockGapi.client.calendar.events.list).toHaveBeenCalledWith({
        calendarId: "primary",
        timeMin: expect.any(String), // Valid ISO date
        showDeleted: false,
        singleEvents: true,
        orderBy: "startTime",
      });
    });

    it("should fetch events and add them to FullCalendar", async () => {
      const mockApiResponse = {
        result: {
          items: [
            {
              summary: "Test Event",
              start: { dateTime: "2024-11-25T10:00:00Z" },
              end: { dateTime: "2024-11-25T11:00:00Z" },
              id: "1",
            },
          ],
        },
      };

      // Mock API response
      mockGapi.client.calendar.events.list.mockResolvedValue(mockApiResponse);

      // Call the function
      await fetchGoogleCalendarEvents(mockAccessToken, mockGapi, mockCalendar);

      // Verify the API call was made
      expect(mockGapi.client.calendar.events.list).toHaveBeenCalled();

      // Verify that events were added to the calendar
      expect(mockCalendar.addEventSource).toHaveBeenCalledWith([
        {
          title: "Test Event",
          start: "2024-11-25T10:00:00Z",
          end: "2024-11-25T11:00:00Z",
          id: "1",
          extendedProps: { reminders: undefined },
        },
      ]);
    });

    it("should handle missing access tokens gracefully", async () => {
      mockAccessToken = null; // Missing token
      // Mock console.error
      jest.spyOn(console, "error").mockImplementation(() => {});

      await fetchGoogleCalendarEvents(mockAccessToken, mockGapi, mockCalendar);

      expect(mockGapi.client.calendar.events.list).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith("No access token available");
    });

    /* it("should handle API errors gracefully", async () => {
      const apiError = new Error("API Error");

      // Apply mock for console.error
      jest.spyOn(console, "error").mockImplementation(() => {});

      // Mock GAPI rejected response
      mockGapi.client.calendar.events.list.mockRejectedValue(apiError);

      // Call the function
      await fetchGoogleCalendarEvents(mockAccessToken, mockGapi, mockCalendar);

      // Debugging: Check console.error calls
      console.log("console.error Mock Calls:", console.error.mock.calls);

      // Ensure addEventSource was not called
      expect(mockCalendar.addEventSource).not.toHaveBeenCalled();

      // Ensure console.error was called
      expect(console.error).toHaveBeenCalledWith(
        "Error fetching calendar events:",
        expect.any(Error) // Matches any error object
      );
    }); */
  });
});

////////////////////////
// Missing Unit Tests
////////////////////////
/*
 1. handleSignInClick: verify requests access token
 2. handleSignoutClick: clears user session
 3. fetchGoogleCalendarEvents: proccesses API response
 4. deleteGoogleCalendarEvent: handles successful and failed deletions
 5. handleDateClick: validates and populates event form
 6. handleEventClick: populates event form for editing
 7. startPollingGoogleCalendarEvents: starts polling for events
 8. stopPollingGoogleCalendarEvents: stops

 9. populateSidebarWithEventDetails
 10. openValidationModal
 11. closeValidationModal
 12. handleFABClick
 13. scheduleNotification
 14. addNotification
 15. clearNotificationsButton
 */
