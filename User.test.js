const User = require("./User");
import populateCalendarEvents from "./calendarscripts.js";

describe("User Module", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test("should clear user state from localStorage", () => {
    // Arrange
    const state = {
      isLoggedIn: true,
      accessToken: "some-token",
      calendars: [{ id: "1", name: "Primary", events: [] }],
      notifications: [
        {
          id: "1",
          title: "Test Notification",
          time: "2023-10-10T10:00:00Z",
          eventStart: "2023-10-10T10:00:00Z",
        },
      ],
      userName: "Test User",
    };
    localStorage.setItem("userState", JSON.stringify(state));

    // Act
    User.clearState();

    // Assert
    expect(localStorage.getItem("userState")).toBeNull();
  });

  test("should save user state to localStorage", () => {
    // Arrange
    User.isLoggedIn = true;
    User.accessToken = "some-token";
    User.calendars = [{ id: "1", name: "Primary", events: [] }];
    User.notifications = [
      {
        id: "1",
        title: "Test Notification",
        time: "2023-10-10T10:00:00Z",
        eventStart: "2023-10-10T10:00:00Z",
      },
    ];
    User.userName = "Test User";

    // Act
    User.saveState();

    // Assert
    const savedState = JSON.parse(localStorage.getItem("userState"));
    expect(savedState).toEqual({
      isLoggedIn: true,
      accessToken: "some-token",
      calendars: [{ id: "1", name: "Primary", events: [] }],
      notifications: [
        {
          id: "1",
          title: "Test Notification",
          time: "2023-10-10T10:00:00Z",
          eventStart: "2023-10-10T10:00:00Z",
        },
      ],
      userName: "Test User",
    });
  });

  test("should load user state from localStorage", () => {
    // Arrange
    const state = {
      isLoggedIn: true,
      accessToken: "some-token",
      calendars: [{ id: "1", name: "Primary", events: [] }],
      notifications: [
        {
          id: "1",
          title: "Test Notification",
          time: "2023-10-10T10:00:00Z",
          eventStart: "2023-10-10T10:00:00Z",
        },
      ],
      userName: "Test User",
    };
    localStorage.setItem("userState", JSON.stringify(state));

    // Act
    User.loadState();

    // Assert
    expect(User.isLoggedIn).toBe(true);
    expect(User.accessToken).toBe("some-token");
    expect(User.calendars).toEqual([{ id: "1", name: "Primary", events: [] }]);
    expect(User.notifications).toEqual([
      {
        id: "1",
        title: "Test Notification",
        time: "2023-10-10T10:00:00Z",
        eventStart: "2023-10-10T10:00:00Z",
      },
    ]);
    expect(User.userName).toBe("Test User");
  });

  test("should clear user state from localStorage", () => {
    // Arrange
    const state = {
      isLoggedIn: true,
      accessToken: "some-token",
      calendars: [{ id: "1", name: "Primary", events: [] }],
      notifications: [
        {
          id: "1",
          title: "Test Notification",
          time: "2023-10-10T10:00:00Z",
          eventStart: "2023-10-10T10:00:00Z",
        },
      ],
      userName: "Test User",
    };
    localStorage.setItem("userState", JSON.stringify(state));

    // Act
    User.clearState();

    // Assert
    expect(localStorage.getItem("userState")).toBeNull();
  });

  test("should save user state to localStorage", () => {
    // Arrange
    User.isLoggedIn = true;
    User.accessToken = "some-token";
    User.calendars = [{ id: "1", name: "Primary", events: [] }];
    User.notifications = [
      {
        id: "1",
        title: "Test Notification",
        time: "2023-10-10T10:00:00Z",
        eventStart: "2023-10-10T10:00:00Z",
      },
    ];
    User.userName = "Test User";

    // Act
    User.saveState();

    // Assert
    const savedState = JSON.parse(localStorage.getItem("userState"));
    expect(savedState).toEqual({
      isLoggedIn: true,
      accessToken: "some-token",
      calendars: [{ id: "1", name: "Primary", events: [] }],
      notifications: [
        {
          id: "1",
          title: "Test Notification",
          time: "2023-10-10T10:00:00Z",
          eventStart: "2023-10-10T10:00:00Z",
        },
      ],
      userName: "Test User",
    });
  });
});
