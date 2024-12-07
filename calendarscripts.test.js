const { clearEventForm } = require("./calendarscripts.js");

// Import necessary modules and functions

// Mock the DOM elements
document.body.innerHTML = `
    <input id="event-title" value="Sample Event">
    <input id="event-start-date" value="2023-10-10">
    <input id="event-start-time" value="10:00">
    <input id="event-end-date" value="2023-10-10">
    <input id="event-end-time" value="11:00">
    <input id="enable-notifications" type="checkbox" checked>
    <div id="notification-options" style="display: block;"></div>
`;

describe("clearEventForm", () => {
  it("should clear all event form fields", () => {
    // Call the function to clear the form
    clearEventForm();

    // Assert that all fields are cleared
    expect(document.getElementById("event-title").value).toBe("");
    expect(document.getElementById("event-start-date").value).toBe("");
    expect(document.getElementById("event-start-time").value).toBe("");
    expect(document.getElementById("event-end-date").value).toBe("");
    expect(document.getElementById("event-end-time").value).toBe("");
    expect(document.getElementById("enable-notifications").checked).toBe(false);
    expect(document.getElementById("notification-options").style.display).toBe(
      "none"
    );
  });
});
