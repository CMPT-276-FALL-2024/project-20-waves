// Import the functions you want to test
const {
    clearEventForm,
    populateSidebarWithEventDetails,
    enableSidebarDragging,
    fetchGoogleCalendarEvents,
  } = require("./calendarscripts");

  // Mock dependencies
  global.document = {
    getElementById: jest.fn(),
  };
  global.console = {
    log: jest.fn(),
    error: jest.fn(),
  };
  global.gapi = {
    client: {
      calendar: {
        events: {
          list: jest.fn(),
        },
      },
    },
  };

  describe("Calendar Scripts", () => {
    beforeEach(() => {
      jest.clearAllMocks(); // Reset mocks before each test
    });

    describe("clearEventForm", () => {
        it("should clear the event form fields", () => {
          // Mock DOM elements for form fields
          const mockInputElements = {
            "event-title": { value: "dummy title" },
            "event-start-date": { value: "2024-11-25" },
            "event-start-time": { value: "10:00" },
            "event-end-date": { value: "2024-11-25" },
            "event-end-time": { value: "11:00" },
          };

          // Mock `document.getElementById` to return the mocked elements
          jest.spyOn(document, "getElementById").mockImplementation((id) => mockInputElements[id]);

          // Call the function
          clearEventForm();

          // Check that all fields are cleared
          expect(mockInputElements["event-title"].value).toBe("");
          expect(mockInputElements["event-start-date"].value).toBe("");
          expect(mockInputElements["event-start-time"].value).toBe("");
          expect(mockInputElements["event-end-date"].value).toBe("");
          expect(mockInputElements["event-end-time"].value).toBe("");

          // Restore the original implementation of `getElementById`
          document.getElementById.mockRestore();
        });
      });

      describe("populateSidebarWithEventDetails", () => {
        it("should populate the sidebar with event details", () => {
          // Mock the event data
          const event = {
            title: "Test Event",
            start: new Date("2024-11-25T10:00:00Z"),
            end: new Date("2024-11-25T12:00:00Z"),
          };

          // Mock the DOM elements for the sidebar fields
          const mockInputElements = {
            "event-title": { value: "" },
            "event-start-date": { value: "" },
            "event-start-time": { value: "" },
            "event-end-date": { value: "" },
            "event-end-time": { value: "" },
            "notify-before-number": { value: "" },
            "notify-before-type": { value: "" },
          };

          // Spy on `document.getElementById` to return the mocked elements
          jest.spyOn(document, "getElementById").mockImplementation((id) => {
            return mockInputElements[id];
          });

          // Call the function
          populateSidebarWithEventDetails(event);

          // Assertions
          expect(mockInputElements["event-title"].value).toBe(event.title);
          expect(mockInputElements["event-start-date"].value).toBe(
            event.start.toISOString().split("T")[0]
          );
          expect(mockInputElements["event-start-time"].value).toBe(
            event.start.toTimeString().slice(0, 5)
          );
          expect(mockInputElements["event-end-date"].value).toBe(
            event.end.toISOString().split("T")[0]
          );
          expect(mockInputElements["event-end-time"].value).toBe(
            event.end.toTimeString().slice(0, 5)
          );

          // Restore the original `getElementById` implementation
          document.getElementById.mockRestore();
        });
      });

      /* describe("fetchGoogleCalendarEvents", () => {
        beforeEach(() => {
          global.accessToken = "mock_access_token"; // Set mock access token
          global.gapi = {
            client: {
              calendar: {
                events: {
                  list: jest.fn(), // Mock the list method
                },
              },
            },
          };

          // Mock `list` method with mockImplementation
          gapi.client.calendar.events.list.mockImplementation((params) => {
            console.log("gapi.client.calendar.events.list called with:", params);
            return Promise.resolve({
              result: {
                items: [
                  {
                    summary: "Mock Event 1",
                    start: { dateTime: "2024-11-25T10:00:00Z" },
                    end: { dateTime: "2024-11-25T12:00:00Z" },
                    id: "1",
                  },
                ],
              },
            });
          });

          jest.spyOn(console, "log").mockImplementation(() => {}); // Mock console.log
          jest.spyOn(console, "error").mockImplementation(() => {}); // Mock console.error
        });

        afterEach(() => {
          jest.clearAllMocks(); // Clear mocks after each test
        });

        it("should fetch events from Google Calendar", async () => {
          // Call the function
          await fetchGoogleCalendarEvents();

          // Assertions
          expect(gapi.client.calendar.events.list).toHaveBeenCalledWith({
            calendarId: "primary",
            timeMin: expect.any(String), // Expect any valid ISO string
            showDeleted: false,
            singleEvents: true,
            orderBy: "startTime",
          });

          // Ensure console.log outputs mapped events
          expect(console.log).toHaveBeenCalledWith(
            "Mapped events for fullCalendar:",
            [
              {
                title: "Mock Event 1",
                start: "2024-11-25T10:00:00Z",
                end: "2024-11-25T12:00:00Z",
                id: "1",
              },
            ]
          );
        });

        it("should log an error if no access token is available", () => {
          global.accessToken = null; // Clear access token

          // Call the function
          fetchGoogleCalendarEvents();

          // Assertions
          expect(console.error).toHaveBeenCalledWith("No access token available");
        });
      }); */
  });