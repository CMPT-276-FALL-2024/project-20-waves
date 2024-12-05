//////////////////////////////////////////////////////////////////////////////
//                            Google Calendar API                           //
//////////////////////////////////////////////////////////////////////////////
//   Manages calendar data and interactions with the Google Calendar API    //
//////////////////////////////////////////////////////////////////////////////
import User from "./User.js";

let calendar; // FullCalendar instance
let selectedEvent = null; // Currently selected event

////////
// Initialize the FullCalendar instance
////////

// Initialize FullCalendar with updated handlers
function initializeCalendar() {
  console.log("Initializing calendar");
  const calendarEl = document.getElementById("calendar");
  if (calendarEl) {
    calendarEl.classList.add("calendar-grid");
  }
  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    selectable: true,
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay",
    },
    footerToolbar: true,

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
    eventMouseLeave: function (info) {
      hideEventTooltip();
    },
  });
  calendar.render();
}

export async function populateCalendarEvents() {
  if (!window.location.pathname.includes("calendar.html")) {
    console.warn("populateCalendarEvents called outside calendar.html");
    return;
  }

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

    // Clear existing events in FullCalendar
    if (calendar) {
      calendar.getEvents().forEach((event) => event.remove());
    }

    // Loop through each calendar and add events
    User.calendars.forEach((calendarObj) => {
      if (calendarObj.events && calendarObj.events.length > 0) {
        calendarObj.events.forEach((event) => {
          const formattedEvent = {
            title: event.title,
            start: event.start,
            end: event.end || null,
          };
          calendar.addEvent(formattedEvent);
          console.log("Added event to calendar:", formattedEvent);
        });
      }
    });

    console.log("All calendar events populated.");
  } catch (error) {
    console.error("Error populating calendar events:", error);
  }
}

// Floating Action Button (FAB) for creating a new event
function setupFAB() {
  const createEventFab = document.getElementById("create-event-fab");
  if (createEventFab) {
    createEventFab.addEventListener("click", handleFABClick);
  }
}

function requireSignIn(actionCallback) {
  if (!User.isLoggedIn) {
    return false;
  }
  actionCallback();
  return true;
}

////////
// Event Tooltip
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

  calendarGrid.addEventListener("mouseup", removeMoveCursor);
  calendarGrid.addEventListener("mouseleave", removeMoveCursor);
}

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

function hideEventTooltip() {
  // console.log("Hiding event tooltip");  // Debugging log
  const tooltip = document.getElementById("event-tooltip");
  if (tooltip) {
    tooltip.remove();
  }
  document.removeEventListener("mousemove", positionTooltip);
}

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
// Sidebar Functionality
////////

// Opens the sidebar for creating a new event
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
  const reminder = getReminderFromEvent(event);
  if (reminder) {
    populateNotificationFields(reminder);
  } else {
    clearNotificationFields();
  }
  document.getElementById("create-event").style.display = "none";
  document.getElementById("edit-event").style.display = "block";
  document.getElementById("delete-event").style.display = "block";
  openSidebar();
}

// click and drag event creation
function openCreateEventSidebarForDateRange(start, end) {
  clearEventForm();
  populateSidebarForDateRange(start, end);
  document.getElementById("create-event").style.display = "block";
  document.getElementById("edit-event").style.display = "none";
  document.getElementById("delete-event").style.display = "none";
  openSidebar();
}

// set up sidebar listeners
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

// draggable sidebar
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

  document.addEventListener("mousemove", (event) => {
    if (!isDragging) return;

    const newLeft = event.clientX - offsetX;
    const newTop = event.clientY - offsetY;

    const maxLeft = window.innerWidth - sidebar.offsetWidth;
    const maxTop = window.innerHeight - sidebar.offsetHeight;
    sidebar.style.left = `${Math.max(0, Math.min(newLeft, maxLeft))}px`;
    sidebar.style.top = `${Math.max(0, Math.min(newTop, maxTop))}px`;
  });

  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;

      document.body.style.cursor = "";
    }
  });
}

////////
// Populate Sidebar Functionality
////////

// populate notification fields
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

// clear notification fields
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

// set up toggle notification
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

  if (start) {
    document.getElementById("event-start-date").value = start
      .toISOString()
      .split("T")[0];
    document.getElementById("event-start-time").value = start
      .toISOString()
      .split("T")[1]
      .substring(0, 5); // HH:MM
  }

  if (end) {
    document.getElementById("event-end-date").value = end
      .toISOString()
      .split("T")[0];
    document.getElementById("event-end-time").value = end
      .toISOString()
      .split("T")[1]
      .substring(0, 5); // HH:MM
  }
}

////////
// Edit Event Button
////////

function setupEditEventButton() {
  const editEventButton = document.getElementById("edit-event");
  if (editEventButton) {
    editEventButton.addEventListener("click", () => {
      if (!selectedEvent) {
        User.openValidationModal("No event selected for editing.");
        return;
      }

      // Get updated details from the sidebar form
      const titleInput = document.getElementById("event-title");
      const startDateInput = document.getElementById("event-start-date");
      const startTimeInput = document.getElementById("event-start-time");
      const endDateInput = document.getElementById("event-end-date");
      const endTimeInput = document.getElementById("event-end-time");

      if (
        !titleInput ||
        !startDateInput ||
        !startTimeInput ||
        !endDateInput ||
        !endTimeInput
      ) {
        openValidationModal("One or more required inputs are missing.");
        return;
      }

      const title = titleInput.value.trim();
      const startDate = startDateInput.value.trim();
      const startTime = startTimeInput.value.trim();
      const endDate = endDateInput.value.trim();
      const endTime = endTimeInput.value.trim();

      // Validate form values
      if (!title) {
        openValidationModal("Event title cannot be empty.");
        return;
      }
      if (!startDate || !startTime || !endDate || !endTime) {
        openValidationModal("Please fill out all date and time fields.");
        return;
      }

      const newStart = `${startDate}T${startTime}`;
      const newEnd = `${endDate}T${endTime}`;

      if (new Date(newEnd) <= new Date(newStart)) {
        openValidationModal("End time must be after start time.");
        return;
      }

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
        scheduleNotification(title, newStart, reminderMinutes);
      }

      // Update event properties
      if (
        typeof selectedEvent.setProp !== "function" ||
        typeof selectedEvent.setStart !== "function" ||
        typeof selectedEvent.setEnd !== "function"
      ) {
        openValidationModal(
          "Unable to update event. Selected event is invalid."
        );
        return;
      }

      selectedEvent.setProp("title", title);
      selectedEvent.setStart(newStart);
      selectedEvent.setEnd(newEnd);

      // Clear selected event and close the sidebar
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

function handleDateClick(info) {
  requireSignIn(() => {
    clearEventForm();
    openCreateEventSidebar(info.date);
  });
}

function handleDateSelect(info) {
  requireSignIn(() => {
    clearEventForm();
    openCreateEventSidebarForDateRange(info.start, info.end);
  });
}

function handleEventClick(info) {
  requireSignIn(() => {
    clearEventForm();
    openEditEventSidebar(info.event);
    selectedEvent = info.event;
  });
}

////////
// Notifications
////////

function initializeNotifications() {
  console.log("Initializing notifications");
  const notificationBell = document.getElementById("notification-bell");
  const notificationDropdown = document.getElementById("notification-dropdown");
  const clearNotificationsButton = document.getElementById(
    "clear-notifications"
  );
  const notificationList = document.getElementById("notification-list");

  let notifications = [];

  // Render notifications in the dropdown
  function renderNotifications() {
    notificationList.innerHTML = "";
    if (notifications.length === 0) {
      const emptyItem = document.createElement("li");
      emptyItem.textContent = "No notifications.";
      emptyItem.className = "notification-item";
      notificationList.appendChild(emptyItem);
    } else {
      notifications.forEach((notification) => {
        const listItem = document.createElement("li");
        listItem.textContent = notification;
        listItem.className = "notification-item";
        notificationList.appendChild(listItem);
      });
    }
  }

  // Update the badge when notifications are added/cleared
  function updateNotificationBadge() {
    const badge = document.getElementById("notification-badge");
    if (notifications.length > 0) {
      badge.style.display = "block";
      badge.textContent = notifications.length;
    } else {
      badge.style.display = "none";
    }
  }

  // Add a notification
  window.addNotification = function (message) {
    notifications.push(message);
    updateNotificationBadge();
    renderNotifications();
  };

  // Clear all notifications
  clearNotificationsButton.addEventListener("click", () => {
    notifications = [];
    updateNotificationBadge();
    renderNotifications();
    notificationDropdown.style.display = "none";
    console.log("All notifications cleared");
  });

  // Show or hide the dropdown
  notificationBell.addEventListener("click", (event) => {
    event.stopPropagation();
    const isVisible = notificationDropdown.style.display === "block";
    console.log("notification dropdown:", notificationDropdown.display);
    notificationDropdown.style.display = isVisible ? "none" : "block";
    console.log("notification dropdown:", notificationDropdown.display);
  });

  // Hide the dropdown when clicking outside
  document.addEventListener("click", () => {
    notificationDropdown.style.display = "none";
  });

  // Prevent dropdown from closing when clicking inside
  notificationDropdown.addEventListener("click", (event) => {
    event.stopPropagation();
  });
}

function scheduleNotification(eventTitle, eventStartTime, minutesBefore) {
  const eventTime = new Date(eventStartTime).getTime();
  const notificationTime = eventTime - minutesBefore * 60 * 1000;
  const currentTime = Date.now();

  if (notificationTime > currentTime) {
    const delay = notificationTime - currentTime;

    setTimeout(() => {
      addNotification(
        `Reminder: "${eventTitle}" starts in ${minutesBefore} minutes.`
      );
    }, delay);

    console.log(
      `Notification scheduled for "${eventTitle}" at ${new Date(
        notificationTime
      )}`
    );
  } else {
    console.warn(`Skipped past notification for "${eventTitle}".`);
  }
}

////////
// Create Event Button
////////
function setupEventCreationButton() {
  const createButton = document.getElementById("create-event");
  if (!createButton) {
    console.error("Create button not found.");
    return;
  }

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

    console.log({ title, startDate, startTime, endDate, endTime });

    // Validate inputs
    if (!title || !startDate || !startTime || !endDate || !endTime) {
      console.error("Missing required fields.");
      User.openValidationModal("All fields must be filled out.");
      return;
    }

    const start = `${startDate}T${startTime}:00`;
    const end = `${endDate}T${endTime}:00`;

    if (new Date(start) >= new Date(end)) {
      console.error("Start time is after end time.");
      User.openValidationModal("End time must be after start time.");
      return;
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
            timeZone: "UTC", // Adjust to the user's time zone if needed
          },
          end: {
            dateTime: end,
            timeZone: "UTC",
          },
        },
      });

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

  if (!deleteEventButton || !deleteConfirmationModal) {
    console.error("Required elements for delete functionality are missing.");
    return;
  }

  deleteEventButton.addEventListener("click", () => {
    if (!selectedEvent) {
      User.openValidationModal("No event selected for deletion.");
      return;
    }

    const eventTitle = selectedEvent.title || "this event";
    deleteConfirmationMessage.textContent = `Are you sure you want to delete "${eventTitle}"?`;
    deleteConfirmationModal.style.display = "flex";

    confirmDeleteButton.onclick = async () => {
      deleteConfirmationModal.style.display = "none";

      try {
        if (selectedEvent.id) {
          await gapi.client.calendar.events.delete({
            calendarId: "primary",
            eventId: selectedEvent.id,
          });
          selectedEvent.remove(); // Remove from calendar UI
          selectedEvent = null; // Clear selectedEvent
          closeSidebar();
          User.openValidationModal("Event successfully deleted.");
        } else {
          User.openValidationModal("Event ID is missing; unable to delete.");
        }
      } catch (error) {
        console.error("Error deleting event:", error);
        User.openValidationModal(
          "Failed to delete event. Check the console for details."
        );
      }
    };

    cancelDeleteButton.onclick = () => {
      deleteConfirmationModal.style.display = "none";
    };
  });
}

function clearNotification(eventTitle) {
  if (scheduledReminders.has(eventTitle)) {
    clearTimeout(scheduledReminders.get(eventTitle));
    scheduledReminders.delete(eventTitle);
    console.log(`Notification for "${eventTitle}" cleared.`);
  }
}

////////
// Create Event Functionality
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
// Agenda Tabs
////////
function enableTabDragging() {
  const tabsContainer = document.getElementById("tabs-container");
  const dragHandle = document.getElementById("tabs-handle");
  const panels = document.querySelectorAll(".tab-panel");

  if (!tabsContainer || !dragHandle) {
    console.error("Tabs container or drag handle not found.");
    return;
  }

  let isDragging = false;
  let offsetY = 0;

  dragHandle.addEventListener("mousedown", (event) => {
    event.preventDefault(); // Prevent text selection and default behavior
    isDragging = true;
    offsetY = event.clientY - tabsContainer.offsetTop;

    // Close all panels on drag start
    panels.forEach((panel) => (panel.style.display = "none"));

    document.body.style.cursor = "grabbing";
  });

  document.addEventListener("mousemove", (event) => {
    if (!isDragging) return;

    let newTop = event.clientY - offsetY;

    // Restrict vertical movement
    tabsContainer.style.top = `${Math.max(
      0,
      Math.min(newTop, window.innerHeight - tabsContainer.offsetHeight)
    )}px`;
  });

  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      document.body.style.cursor = "";
    }
  });
}
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

    if (!isClickInside) {
      panels.forEach((panel) => panel.classList.remove("active"));
      console.log("Closed all panels.");
    }
  });
}

function openPanel(panelId) {
  const panel = document.getElementById(panelId);
  const tabsContainer = document.getElementById("tabs-container");

  if (panel && tabsContainer) {
    panel.style.top = `${tabsContainer.offsetTop}px`;
    panel.style.display = "block"; // Show the panel
  } else {
    console.error(`Panel with id "${panelId}" or tabs container not found.`);
  }
}

// Export for global access (if using modules)
window.openPanel = openPanel;

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
function getReminderFromEvent(event) {
  if (
    event.extendedProps &&
    event.extendedProps.reminders &&
    event.extendedProps.reminders.overrides
  ) {
    return event.extendedProps.reminders.overrides[0]; // Assume single reminder for now
  }
  return null; // No reminder found
}
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
// Debugging
////////
function setupDebugKey() {
  document.addEventListener("keydown", (event) => {
    if (event.key === "d" || event.key === "D") {
      console.log("Debug key pressed!");
      addNotification("This is a debug notification triggered by the 'D' key!");
    }
  });
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

    // Notification Bell
    if (document.getElementById("notification-bell")) {
      console.log("Initializing notifications...");
      initializeNotifications();
    }

    console.log("Initialization completed.");
  } catch (error) {
    console.error("Error during initialization:", error);
  }
});