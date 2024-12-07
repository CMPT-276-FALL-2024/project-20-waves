//////////////////////////////////////////////////////////////////////////////
//                            Google Calendar API                           //
//////////////////////////////////////////////////////////////////////////////
//   Manages calendar data and interactions with the Google Calendar API    //
//////////////////////////////////////////////////////////////////////////////
import User from "./User.js";

// Global Variables
let calendar; // FullCalendar instance
let selectedEvent = null; // Currently selected event
let thisTimeZone = "PST"; // User's time zone, hardcoded for now

////////
// Initialize the FullCalendar instance - DONE
////////

// Initialize FullCalendar with updated handlers
function initializeCalendar() {
  console.log("Initializing calendar");
  const calendarEl = document.getElementById("calendar");
  // Add calendar-grid class for styling
  if (calendarEl) {
    calendarEl.classList.add("calendar-grid");
  }
  // Ensure calendar element exists
  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    selectable: true,
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay",
    },
    footerToolbar: false,

    // Create new event on date click
    dateClick: handleDateClick,

    // Create new event by selecting a range
    select: handleDateSelect,

    // Edit existing event on event click
    eventClick: handleEventClick,

    // Tooltop functions for hovering over events
    eventMouseEnter: function (info) {
      showEventTooltip(info.event);
    },

    // Hide tooltip when mouse leaves event
    eventMouseLeave: function (info) {
      hideEventTooltip();
    },
  });

  // Render calendar
  calendar.render();
}

// Populate calendar events from user's Google Calendar
export async function populateCalendarEvents() {
  console.log("Populating calendar events...");
  // Ensure user is on the calendar
  if (!window.location.pathname.includes("calendar.html")) {
    console.warn("populateCalendarEvents called outside calendar.html");
    return;
  }

  // Ensure user is logged in
  if (!User.isLoggedIn) {
    console.error("User is not logged in. Cannot populate calendar events.");
    User.openValidationModal("Please sign in to view your calendar.");
    return;
  }

  try {
    console.log("Populating calendar events...");

    // Ensure calendars and events are fetched
    if (!User.calendars || User.calendars.length === 0) {
      console.log("Fetching user calendars...");
      await User.fetchUserCalendars();
      console.log("Fetching events for all calendars...");
      await User.fetchAllCalendarEvents();
    }

    // Ensure events are populated
    const leftoverEvents = [];

    // Clear existing events in FullCalendar
    if (calendar) {
      calendar.getEvents().forEach((event) => event.remove());
    }

    // Populate events by calendar type
    User.calendars.forEach((calendarObj) => {
      if (calendarObj.name === "Lectures") {
        console.log("Populating Lectures tab:", calendarObj.events); // Debug
        populateTab("lectures-list", calendarObj.events);
      } else if (calendarObj.name === "Assignments") {
        console.log("Populating Assignments tab:", calendarObj.events); // Debug
        populateTab("assignments-list", calendarObj.events);
      } else if (calendarObj.name === "Tests") {
        console.log("Populating Tests tab:", calendarObj.events); // Debug
        populateTab("tests-list", calendarObj.events);
      } else {
        console.log(
          "Adding leftover events to FullCalendar:",
          calendarObj.events
        ); // Debug
        leftoverEvents.push(...calendarObj.events);
      }
    });

    populateFullCalendar(leftoverEvents);
    calendar.refetchEvents(); // Refresh the calendar view

    // Show success message for debugging
    console.log("All calendar events populated.");
    return Promise.resolve("Done");
  } catch (error) {
    console.error("Error populating calendar events:", error);
  }
}

// Add events to the FullCalendar instance
function populateFullCalendar(events) {
  console.log("Adding events to FullCalendar:", events); // Debugging
  events.forEach((event) => {
    if (!event.title || !event.start) {
      console.error("Invalid event format:", event); // Log invalid events
      return;
    }

    calendar.addEvent({
      title: event.title,
      start: event.start,
      end: event.end || null,
      extendedProps: event.extendedProps,
    });
  });

  console.log("Events added to FullCalendar.");
}

// Populate a tab with events
function populateTab(listId, events) {
  if (!User.isLoggedIn) {
    const emptyItem = document.createElement("li");
    emptyItem.textContent = "Please sign in to view your events.";
    list.appendChild(emptyItem);
    return;
  }
  const list = document.getElementById(listId);
  if (!list) {
    console.error(`Tab list with ID "${listId}" not found.`);
    return;
  }

  list.innerHTML = ""; // Clear existing items
  events.forEach((event) => {
    const li = document.createElement("li");
    li.textContent = `${event.title} - ${new Date(
      event.start
    ).toLocaleString()}`;
    list.appendChild(li);
  });

  if (events.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.textContent = "No events to show.";
    list.appendChild(emptyItem);
  }
}

////////
// Event Tooltip - DONE
////////

// Enable crosshair cursor on the calendar grid
function setupMoveCursor() {
  const calendarGrid = document.querySelector(".calendar-grid");
  if (!calendarGrid) {
    console.error("Calendar grid not found!");
    return;
  }

  // Add "moving-cursor" class on mousedown
  calendarGrid.addEventListener("mousedown", () => {
    console.log("mousedown event triggered");
    calendarGrid.classList.add("moving-cursor");
  });

  // Remove "moving-cursor" class on mouseup and mouseleave
  const removeMoveCursor = () => {
    console.log("mouseup or mouseleave event triggered");
    calendarGrid.classList.remove("moving-cursor");
  };

  // Add event listeners
  calendarGrid.addEventListener("mouseup", removeMoveCursor);
  calendarGrid.addEventListener("mouseleave", removeMoveCursor);
}

// Show event tooltip on mouse hover
function showEventTooltip(event) {
  const tooltip = document.createElement("div");
  tooltip.id = "event-tooltip";
  tooltip.className = "event-tooltip";
  const startTime = event.start.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endTime = event.end
    ? event.end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  tooltip.innerHTML = `
        <strong>${event.title}</strong><br>
        Start: ${startTime}<br>
        ${endTime ? `End: ${endTime}` : ""}
        `;

  document.addEventListener("mousemove", positionTooltip);
  document.body.appendChild(tooltip);
}

// Hide event tooltip on mouse leave
function hideEventTooltip() {
  // console.log("Hiding event tooltip");  // Debugging log
  const tooltip = document.getElementById("event-tooltip");
  if (tooltip) {
    tooltip.remove();
  }
  document.removeEventListener("mousemove", positionTooltip);
}

// Position the tooltip near the mouse cursor
function positionTooltip(event) {
  const tooltip = document.getElementById("event-tooltip");
  if (!tooltip) return;

  const tooltipWidth = tooltip.offsetWidth;
  const tooltipHeight = tooltip.offsetHeight;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Calculate default tooltip position
  let left = event.pageX + 15;
  let top = event.pageY + 15;

  // Adjust if the tooltip overflows the right edge
  if (left + tooltipWidth > viewportWidth) {
    left = viewportWidth - tooltipWidth - 10; // Pad 10px from the right edge
  }

  // Adjust if the tooltip overflows the bottom edge
  if (top + tooltipHeight > viewportHeight) {
    top = viewportHeight - tooltipHeight - 10; // Pad 10px from the bottom edge
  }

  // Adjust if the tooltip overflows the left edge
  if (left < 0) {
    left = 10; // Pad 10px from the left edge
  }

  // Adjust if the tooltip overflows the top edge
  if (top < 0) {
    top = 10; // Pad 10px from the top edge
  }

  // Apply the adjusted position
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}

////////
// Sidebar Functionality for Event Data - DONE
////////

// Opens the sidebar for creating a new event with FAB
function openCreateEventSidebar(date) {
  clearEventForm();
  populateSidebarWithDate(date); // Populate with default or selected date
  document.getElementById("create-event").style.display = "block";
  document.getElementById("edit-event").style.display = "none";
  document.getElementById("delete-event").style.display = "none";
  openSidebar();
}

// Opens the sidebar for editing an event
function openEditEventSidebar(event) {
  selectedEvent = event;
  populateSidebarWithEventDetails(event); // Fill in event details
  const notification = getReminderFromEvent(event); // Get reminder from event
  if (notification) {
    populateNotificationFields(notification); // Fill in notification details
  }
  document.getElementById("create-event").style.display = "none";
  //document.getElementById("edit-event").style.display = "block";
  document.getElementById("delete-event").style.display = "block";
  openSidebar();
}

// Click event listener for dragging
function openCreateEventSidebarForDateRange(start, end) {
  clearEventForm();
  populateSidebarForDateRange(start, end);
  document.getElementById("create-event").style.display = "block";
  document.getElementById("edit-event").style.display = "none";
  document.getElementById("delete-event").style.display = "none";
  openSidebar();
}

// Close the sidebar listeners
function setupCloseSidebarListeners() {
  const closeSidebarButton = document.getElementById("close-sidebar-button");
  if (closeSidebarButton) {
    console.log("Attaching close sidebar listener");
    closeSidebarButton.addEventListener("click", closeSidebar);
  } else {
    console.error("Close sidebar button not found!");
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      console.log("Escape key pressed, closing sidebar.");
      closeSidebar();
    }
  });
}

// Draggable sidebar
function enableSidebarDragging() {
  const sidebar = document.getElementById("event-sidebar");
  const dragHandle = sidebar.querySelector(".drag-handle");

  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  dragHandle.addEventListener("mousedown", (event) => {
    isDragging = true;
    offsetX = event.clientX - sidebar.offsetLeft;
    offsetY = event.clientY - sidebar.offsetTop;

    document.body.style.cursor = "grabbing";
  });

  // Move the sidebar with the mouse
  document.addEventListener("mousemove", (event) => {
    if (!isDragging) return;

    // Calculate new position
    const newLeft = event.clientX - offsetX;
    const newTop = event.clientY - offsetY;
    // Calculate maximum position
    const maxLeft = window.innerWidth - sidebar.offsetWidth;
    const maxTop = window.innerHeight - sidebar.offsetHeight;
    sidebar.style.left = `${Math.max(0, Math.min(newLeft, maxLeft))}px`;
    sidebar.style.top = `${Math.max(0, Math.min(newTop, maxTop))}px`;
  });

  // Stop dragging on mouseup
  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;

      // Reset cursor and remove event listeners
      document.body.style.cursor = "";
    }
  });
}

////////
// Populate Sidebar Functionality - DONE
////////

// Populate notification fields in the sidebar
function populateNotificationFields(reminder) {
  if (!reminder || typeof reminder.minutes !== "number") {
    console.warn("Invalid reminder data:", reminder);
    clearNotificationFields(); // Clear fields if data is invalid
    return;
  }

  const { value, unit } = convertMinutesToFriendlyFormat(reminder.minutes);

  // Update notification fields in the sidebar
  const notificationTimeInput = document.getElementById("notification-time");
  const notificationTimeUnitSelect = document.getElementById(
    "notification-time-unit"
  );
  const enableNotificationsCheckbox = document.getElementById(
    "enable-notifications"
  );

  if (notificationTimeInput) notificationTimeInput.value = value;
  if (notificationTimeUnitSelect) notificationTimeUnitSelect.value = unit;
  if (enableNotificationsCheckbox) enableNotificationsCheckbox.checked = true;

  // Show notification options
  const notificationOptions = document.getElementById("notification-options");
  if (notificationOptions) notificationOptions.style.display = "block";
}

// Clear notification fields
function clearNotificationFields() {
  const notificationTimeInput = document.getElementById("notification-time");
  const notificationTimeUnitSelect = document.getElementById(
    "notification-time-unit"
  );
  const enableNotificationsCheckbox = document.getElementById(
    "enable-notifications"
  );

  if (notificationTimeInput) notificationTimeInput.value = "";
  if (notificationTimeUnitSelect) notificationTimeUnitSelect.value = "minutes";
  if (enableNotificationsCheckbox) enableNotificationsCheckbox.checked = false;

  const notificationOptions = document.getElementById("notification-options");
  if (notificationOptions) notificationOptions.style.display = "none";
}

// Set up toggle notification
function setupNotificationToggle() {
  const notificationToggle = document.getElementById("enable-notifications");
  const notificationOptions = document.getElementById("notification-options");
  if (notificationToggle && notificationOptions) {
    notificationToggle.addEventListener("change", (event) => {
      notificationOptions.style.display = event.target.checked
        ? "block"
        : "none";
    });
  }
}

// Populate sidebar with a single date and default time
function populateSidebarWithDate(date) {
  if (!(date instanceof Date)) date = new Date(date); // Ensure it's a Date object
  const startDate = date.toISOString().split("T")[0];
  const startTime = date.toTimeString().slice(0, 5); // Format as HH:MM
  const endDate = new Date(date);
  endDate.setMinutes(endDate.getMinutes() + 15);

  document.getElementById("event-start-date").value = startDate;
  document.getElementById("event-start-time").value = startTime;
  document.getElementById("event-end-date").value = endDate
    .toISOString()
    .split("T")[0];
  document.getElementById("event-end-time").value = endDate
    .toTimeString()
    .slice(0, 5);
}

// Populate sidebar with a date range
function populateSidebarForDateRange(start, end) {
  document.getElementById("event-start-date").value = start
    .toISOString()
    .split("T")[0];
  document.getElementById("event-start-time").value = start
    .toTimeString()
    .slice(0, 5);
  document.getElementById("event-end-date").value = end
    .toISOString()
    .split("T")[0];
  document.getElementById("event-end-time").value = end
    .toTimeString()
    .slice(0, 5);
}

// Populate sidebar with existing event details
function populateSidebarWithEventDetails(event) {
  const { title } = event._def; // Event title
  const start = event._instance.range.start; // Event start time
  const end = event._instance.range.end; // Event end time

  document.getElementById("event-title").value = title || "";
  // Populate start date and time
  if (start) {
    document.getElementById("event-start-date").value = start
      .toISOString()
      .split("T")[0];
    document.getElementById("event-start-time").value = start
      .toISOString()
      .split("T")[1]
      .substring(0, 5); // HH:MM
  }

  // Populate end date and time
  if (end) {
    document.getElementById("event-end-date").value = end
      .toISOString()
      .split("T")[0];
    document.getElementById("event-end-time").value = end
      .toISOString()
      .split("T")[1]
      .substring(0, 5); // HH:MM
  }

  // Populate notification fields separate call
}

////////
// Edit Event Button
////////

// Set up the edit event button
async function setupEditEventButton() {
  const editEventButton = document.getElementById("edit-event");
  if (editEventButton) {
    editEventButton.addEventListener("click", () => {
      if (!selectedEvent) {
        User.openValidationModal("No event selected for editing.");
        return;
      }

      // Validate that selectedEvent is still a FullCalendar event
      if (
        typeof selectedEvent.setProp !== "function" ||
        typeof selectedEvent.setStart !== "function" ||
        typeof selectedEvent.setEnd !== "function"
      ) {
        User.openValidationModal(
          "Unable to update event. Selected event is invalid."
        );
        return;
      }
      // Get updated details from the sidebar form
      const titleInput = document.getElementById("event-title");
      const startDateInput = document.getElementById("event-start-date");
      const startTimeInput = document.getElementById("event-start-time");
      const endDateInput = document.getElementById("event-end-date");
      const endTimeInput = document.getElementById("event-end-time");
      const enableNotificationsCheckbox = document.getElementById(
        "enable-notifications"
      );

      const notificationsEnabled =
        enableNotificationsCheckbox && enableNotificationsCheckbox.checked;

      // Validate form inputs
      if (
        !titleInput ||
        !startDateInput ||
        !startTimeInput ||
        !endDateInput ||
        !endTimeInput
      ) {
        User.openValidationModal("One or more required inputs are missing.");
        return;
      }

      // Get form values
      const title = titleInput.value.trim();
      const startDate = startDateInput.value.trim();
      const startTime = startTimeInput.value.trim();
      const endDate = endDateInput.value.trim();
      const endTime = endTimeInput.value.trim();

      // Validate form values
      if (!title) {
        User.openValidationModal("Event title cannot be empty.");
        return;
      }
      if (!startDate || !startTime || !endDate || !endTime) {
        User.openValidationModal("Please fill out all date and time fields.");
        return;
      }

      // Combine date and time strings
      const newStart = `${startDate}T${startTime}`;
      const newEnd = `${endDate}T${endTime}`;

      // Validate start and end times
      if (new Date(newEnd) <= new Date(newStart)) {
        User.openValidationModal("End time must be after start time.");
        return;
      }

      let reminders = { useDefault: true };

      // Check if notifications are enabled
      if (notificationsEnabled) {
        const notificationTime = parseInt(
          document.getElementById("notification-time").value,
          10
        );
        const notificationTimeUnit = document.getElementById(
          "notification-time-unit"
        ).value;
        const reminderMinutes =
          notificationTime *
          (notificationTimeUnit === "hours"
            ? 60
            : notificationTimeUnit === "days"
              ? 1440
              : 1);
        User.scheduleNotification(title, newStart, reminderMinutes);
        reminders = {
          useDefault: false,
          overrides: [{ method: "popup", minutes: reminderMinutes }],
        };
      }

      // Update event properties
      selectedEvent.setProp("title", title);
      selectedEvent.setStart(newStart);
      selectedEvent.setEnd(newEnd);

      // Update the event on Google Calendar
      User.updateCalendarEvent(selectedEvent.id, title, newStart, newEnd)
        .then((updatedEvent) => {
          User.openValidationModal("Event successfully updated.");

          if (updatedEvent && calendar) {
            const event = calendar.getEventById(selectedEvent.id);
            if (event) {
              event.setProp("title", title);
              event.setStart(newStart);
              event.setEnd(newEnd);
            }
          }
        })
        .catch((error) => {
          console.error("Failed to update event:", error);
          User.openValidationModal(
            "Failed to update event on Google Calendar."
          );
        });

      selectedEvent = null;
      closeSidebar();
    });
  }
}

////////
// Initialize Event FAB
////////
function handleFABClick() {
  requireSignIn(() => {
    clearEventForm();
    const now = new Date();
    openCreateEventSidebar(new Date());
  });
}

////////
// Create Event Functionality
////////

// Floating Action Button (FAB) for creating a new event
function setupFAB() {
  const createEventFab = document.getElementById("create-event-fab");
  if (createEventFab) {
    createEventFab.addEventListener("click", handleFABClick);
  }
}

// Check if the user is signed in before performing an action
function requireSignIn(actionCallback) {
  if (!User.isLoggedIn) {
    return false;
  }
  actionCallback();
  return true;
}

// Handle date click to create a new event
function handleDateClick(info) {
  requireSignIn(() => {
    clearEventForm();
    openCreateEventSidebar(info.date);
  });
}

// Handle date range selection to create a new event
function handleDateSelect(info) {
  requireSignIn(() => {
    clearEventForm();
    openCreateEventSidebarForDateRange(info.start, info.end);
  });
}

// Handle event click to edit an existing event
function handleEventClick(info) {
  requireSignIn(() => {
    clearEventForm();
    openEditEventSidebar(info.event);

    selectedEvent = {
      id: info.event.id,
      title: info.event.title,
      start: info.event.start,
      end: info.event.end,
      extendedProps: info.event.extendedProps,
    };

    if (info.event.extendedProps && info.event.extendedProps.eventId) {
      console.log("Event ID:", info.event.extendedProps.eventId);
      selectedEvent.id = info.event.extendedProps.eventId;
    } else {
      console.warn(
        "Event ID not found in extendedProps:",
        info.event.extendedProps
      );
    }
  });
}

////////
// Create Event Button
////////

// Set up the create event button
function setupEventCreationButton() {
  const createButton = document.getElementById("create-event");
  if (!createButton) {
    console.error("Create button not found.");
    return;
  }

  // Add event listener for creating a new event
  createButton.addEventListener("click", async () => {
    console.log("Create button clicked!");

    // Validate user is logged in
    if (!User.isLoggedIn) {
      console.warn("User is not logged in.");
      User.openValidationModal("Please log in to create an event.");
      return;
    }

    // Get form values
    const title = document.getElementById("event-title").value.trim();
    const startDate = document.getElementById("event-start-date").value;
    const startTime = document.getElementById("event-start-time").value;
    const endDate = document.getElementById("event-end-date").value;
    const endTime = document.getElementById("event-end-time").value;

    //console.log({ title, startDate, startTime, endDate, endTime });

    // Validate inputs
    if (!title || !startDate || !startTime || !endDate || !endTime) {
      console.error("Missing required fields.");
      User.openValidationModal("All fields must be filled out.");
      return;
    }

    // Combine date and time strings
    const start = `${startDate}T${startTime}:00`;
    const end = `${endDate}T${endTime}:00`;

    // Validate start and end times
    if (new Date(start) >= new Date(end)) {
      console.error("Start time is after end time.");
      User.openValidationModal("End time must be after start time.");
      return;
    }

    let reminders = { useDefault: true };

    const notificationsEnabled = document.getElementById(
      "enable-notifications"
    ).checked;
    if (notificationsEnabled) {
      const notificationTime = parseInt(
        document.getElementById("notification-time").value,
        10
      );
      const notificationTimeUnit = document.getElementById(
        "notification-time-unit"
      ).value;

      const reminderMinutes =
        notificationTime *
        (notificationTimeUnit === "hours"
          ? 60
          : notificationTimeUnit === "days"
            ? 1440
            : 1);
      reminders = {
        useDefault: false,
        overrides: [{ method: "popup", minutes: reminderMinutes }],
      };
    }

    try {
      // Add the event to Google Calendar
      console.log("Adding event to Google Calendar...");
      const response = await gapi.client.calendar.events.insert({
        calendarId: "primary", // Adding to the user's primary calendar
        resource: {
          summary: title,
          start: {
            dateTime: start,
            timeZone: thisTimeZone, // Adjust to the user's time zone if needed
          },
          end: {
            dateTime: end,
            timeZone: thisTimeZone,
          },
          reminders: reminders,
        },
      });

      // Log the response for debugging
      console.log("Event successfully added to Google Calendar:", response);

      // Add the event to the local FullCalendar instance
      if (calendar) {
        calendar.addEvent({
          title: title,
          start: start,
          end: end,
        });
        console.log(`Event added to FullCalendar: ${title}`);
      }

      //ensure event is given a Google Calendar ID for future reference
      await User.fetchCalendarUpdates(); // Update the user's calendar data

      // Show success message
      User.openValidationModal(
        "Event successfully added to your Google Calendar."
      );

      // Clear form and close the sidebar
      clearEventForm();
      closeSidebar();
    } catch (error) {
      console.error("Error adding event to Google Calendar:", error);
      User.openValidationModal(
        "Failed to add the event to Google Calendar. Please try again."
      );
    }
  });
}

////////
// Delete Event Functionality
////////
function setupDeleteEventButton() {
  const deleteEventButton = document.getElementById("delete-event");
  const deleteConfirmationModal = document.getElementById(
    "delete-confirmation-modal"
  );
  const deleteConfirmationMessage = document.getElementById(
    "delete-confirmation-message"
  );
  const confirmDeleteButton = document.getElementById("confirm-delete-button");
  const cancelDeleteButton = document.getElementById("cancel-delete-button");

  // Check if required elements are present
  if (!deleteEventButton || !deleteConfirmationModal) {
    console.error("Required elements for delete functionality are missing.");
    return;
  }

  // Add event listener for deleting an event
  deleteEventButton.addEventListener("click", () => {
    if (!selectedEvent) {
      User.openValidationModal("No event selected for deletion.");
      return;
    }

    // Show delete confirmation modal
    const eventTitle = selectedEvent.title || "this event";
    deleteConfirmationMessage.textContent = `Are you sure you want to delete "${eventTitle}"?`;
    deleteConfirmationModal.style.display = "flex";

    // Confirm or cancel deletion
    confirmDeleteButton.onclick = async () => {
      deleteConfirmationModal.style.display = "none";

      try {
        // Check if the event has an ID
        if (selectedEvent.id) {
          await gapi.client.calendar.events.delete({
            calendarId: "primary",
            eventId: selectedEvent.id,
          });

          // Remove the event from the local FullCalendar instance
          const eventInCalendar = calendar.getEventById(selectedEvent.id);
          if (eventInCalendar) {
            eventInCalendar.remove();
          }
          selectedEvent = null; // Clear selectedEvent
          closeSidebar();

          await User.fetchCalendarUpdates(); // Update the user's calendar data
          // Show success message
          User.openValidationModal("Event successfully deleted.");
        } else {
          // Show error message if event ID is missing
          User.openValidationModal("Event ID is missing; unable to delete.");
        }
      } catch (error) {
        // Show error message if deletion fails
        console.error("Error deleting event:", error);
        User.openValidationModal(
          "Failed to delete event. Check the console for details."
        );
      }
    };

    // Cancel deletion
    cancelDeleteButton.onclick = () => {
      deleteConfirmationModal.style.display = "none";
    };
  });
}

////////
// Create Event Functionality - DONE
////////

// Clear the event form
function clearEventForm() {
  const titleInput = document.getElementById("event-title");
  const startDateInput = document.getElementById("event-start-date");
  const startTimeInput = document.getElementById("event-start-time");
  const endDateInput = document.getElementById("event-end-date");
  const endTimeInput = document.getElementById("event-end-time");
  const notificationsCheckbox = document.getElementById("enable-notifications");
  const notificationOptions = document.getElementById("notification-options");

  // Clear form inputs
  if (titleInput) titleInput.value = "";
  if (startDateInput) startDateInput.value = "";
  if (startTimeInput) startTimeInput.value = "";
  if (endDateInput) endDateInput.value = "";
  if (endTimeInput) endTimeInput.value = "";
  if (notificationsCheckbox) notificationsCheckbox.checked = false;
  if (notificationOptions) notificationOptions.style.display = "none";
}

// Open the sidebar
function openSidebar() {
  const eventSidebar = document.getElementById("event-sidebar");
  eventSidebar.classList.add("open");
}

// Close the sidebar
function closeSidebar() {
  const eventSidebar = document.getElementById("event-sidebar");
  eventSidebar.classList.remove("open");
}

////////
// Agenda Tabs - DONE, formatting needed if time
////////

// Export for global access (if using modules)
window.openPanel = openPanel;

// Enable dragging for the tabs container
function enableTabDragging() {
  const tabsContainer = document.getElementById("tabs-container");
  const dragHandle = document.getElementById("tabs-handle");
  const panels = document.querySelectorAll(".tab-panel");

  // Check if required elements are present
  if (!tabsContainer || !dragHandle) {
    console.error("Tabs container or drag handle not found.");
    return;
  }

  // Initialize dragging variables
  let isDragging = false;
  let offsetY = 0;

  // Handle mouse events for dragging
  dragHandle.addEventListener("mousedown", (event) => {
    event.preventDefault(); // Prevent text selection and default behavior
    isDragging = true;
    offsetY = event.clientY - tabsContainer.offsetTop;

    // Close all panels on drag start
    panels.forEach((panel) => (panel.style.display = "none"));

    document.body.style.cursor = "grabbing";
  });

  // Move the tabs container with the mouse
  document.addEventListener("mousemove", (event) => {
    if (!isDragging) return;

    // Calculate new position
    let newTop = event.clientY - offsetY;

    // Restrict vertical movement
    tabsContainer.style.top = `${Math.max(
      0,
      Math.min(newTop, window.innerHeight - tabsContainer.offsetHeight)
    )}px`;
  });

  // Stop dragging on mouseup
  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      document.body.style.cursor = "";
    }
  });
}

// Initialize tabs and panels
function initializeTabsandPanels() {
  const tabs = document.querySelectorAll(".tab");
  const panels = document.querySelectorAll(".tab-panel");
  const closeButtons = document.querySelectorAll(".close-panel");

  // Handle tab click to show the corresponding panel
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // Hide all panels
      panels.forEach((panel) => panel.classList.remove("active"));

      // Show the corresponding panel
      const targetPanelId = tab.id.replace("-tab", "-panel");
      const targetPanel = document.getElementById(targetPanelId);
      if (targetPanel) {
        targetPanel.classList.add("active");
      }
    });
  });

  // Handle close button click to hide the corresponding panel
  closeButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const panel = event.target.closest(".tab-panel");
      if (panel) {
        panel.classList.remove("active");
      }
    });
  });

  // Handle outside click to hide all open panels
  document.addEventListener("click", (event) => {
    // Check if the click is inside a tab or panel
    const isClickInside =
      event.target.closest(".tab-panel") || event.target.closest(".tab");

    // Close all panels if the click is outside
    if (!isClickInside) {
      panels.forEach((panel) => panel.classList.remove("active"));
      // console.log("Closed all panels.");
    }
  });
}

// Open a panel by ID
function openPanel(panelId) {
  const panel = document.getElementById(panelId);
  const tabsContainer = document.getElementById("tabs-container");

  // Check if the panel and tabs container exist
  if (panel && tabsContainer) {
    panel.style.top = `${tabsContainer.offsetTop}px`; // Position the panel
    panel.style.display = "block"; // Show the panel
  } else {
    console.error(`Panel with id "${panelId}" or tabs container not found.`);
  }
}

// Close a panel by ID
function closePanel(panelId) {
  const panel = document.getElementById(panelId);
  if (panel) {
    panel.style.display = "none"; // Hide the panel
  }
}

// Setup tabs functionality
function setupTabs() {
  const tabs = [
    { id: "lectures-tab", panel: "lectures-panel" },
    { id: "tests-tab", panel: "tests-panel" },
    { id: "assignments-tab", panel: "assignments-panel" },
  ];

  // Setup click event listeners for each tab
  tabs.forEach(({ id, panel }) => {
    const tab = document.getElementById(id);
    if (tab) {
      tab.addEventListener("click", () => openPanel(panel, id));
    } else {
      console.warn(`Tab with id "${id}" not found.`);
    }
  });

  console.log("Tabs setup complete.");
}

////////
// Helper Functions
////////

// Retreive the reminder from the event
function getReminderFromEvent(event) {
  if (!event || !event.extendedProps || !event.extendedProps.reminders) {
    return null;
  }

  const reminders = event.extendedProps.reminders;
  if (reminders.useDefault) {
    return { minutes: 10, method: "popup" }; // Default reminder
  }

  if (reminders.overrides && reminders.overrides.length > 0) {
    return reminders.overrides[0]; // Return the first override reminder
  }

  return null; // No reminders available
}

// Convert minutes to a friendly format
function convertMinutesToFriendlyFormat(minutes) {
  if (minutes >= 1440) {
    return { value: Math.floor(minutes / 1440), unit: "days" };
  } else if (minutes >= 60) {
    return { value: Math.floor(minutes / 60), unit: "hours" };
  } else if (minutes > 0) {
    return { value: minutes, unit: "minutes" };
  } else {
    console.warn("Invalid reminder time:", minutes);
    return { value: 0, unit: "minutes" }; // Fallback
  }
}

////////
// DOM Content Loaded
////////

document.addEventListener("DOMContentLoaded", async () => {
  console.log("Document fully loaded. Starting initialization...");

  try {
    // Load shared header and modals
    const sharedContent = document.getElementById("shared-content");
    if (sharedContent) {
      console.log("Loading shared content...");
      const response = await fetch("application.html");
      const html = await response.text();
      sharedContent.innerHTML = html;
    } else {
      console.warn("Shared content container not found.");
    }

    // Initialize user state and authentication
    if (window.User) {
      console.log("Initializing user...");
      await User.loadState();
      await User.initializeUser();
    } else {
      console.error("User module not found.");
    }

    // Initialize Calendar
    if (document.getElementById("calendar")) {
      console.log("Initializing calendar...");
      initializeCalendar();
    }

    // Initialize Sidebar
    if (document.getElementById("event-sidebar")) {
      console.log("Setting up event sidebar...");
      setupCloseSidebarListeners();
      enableSidebarDragging();
    }

    // Initialize Tabs
    if (document.getElementById("tabs-container")) {
      console.log("Setting up tabs...");
      setupTabs();
      initializeTabsandPanels();
      enableTabDragging();
    }

    // CreateButton
    if (document.getElementById("create-event")) {
      console.log("Setting up create event button...");
      setupEventCreationButton();
    }

    // Floating Action Button (FAB)
    if (document.getElementById("create-event-fab")) {
      console.log("Setting up FAB...");
      setupFAB();
    }

    // Edit Event Button
    //if (document.getElementById("edit-event")) {
    //  console.log("Setting up edit event button...");
    //  setupEditEventButton();
    //}

    if (document.getElementById("delete-event")) {
      console.log("Setting up delete event button...");
      setupDeleteEventButton();
    }

    // Notification Toggle
    if (document.getElementById("enable-notifications")) {
      console.log("Setting up notification toggle...");
      setupNotificationToggle();
    }

    // Initialize Complete
    console.log("Initialization completed.");
  } catch (error) {
    console.error("Error during initialization:", error);
  }
});
