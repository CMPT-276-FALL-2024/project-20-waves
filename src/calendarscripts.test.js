// Import functions to test
const {
  clearEventForm,
  setupNotificationToggle,
  populateSidebarWithDate,
  populateSidebarForDateRange,
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

      jest.spyOn(document, "getElementById").mockImplementation((id) => mockElements[id]);

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

      expect(mockCheckbox.addEventListener).toHaveBeenCalledWith("change", expect.any(Function));

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

      jest.spyOn(document, "getElementById").mockImplementation((id) => mockElements[id]);

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

      jest.spyOn(document, "getElementById").mockImplementation((id) => mockElements[id]);

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
});