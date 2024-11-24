////////
// NOTE: this requires API KEY and CLIENT ID to be added within the code
////////
const YOUR_API_KEY = "";
const YOUR_CLIENT_ID = "";

////////
// Global Variables
////////

// Calendar variables
let calendar;
let selectedEvent = null;

// API variables
let tokenClient;
let accessToken;
let gapiInited = false;

// User variables
let isUserSignedIn = false;

// Polling variables
let pollingIntervalId = null;
const POLLING_INTERVAL = 60000; // 1 minute

////////
// API
////////
// Initialize the Google API client
function initializeGapiClient() {
  console.log("Initializing GAPI client");
  gapi.load("client", async () => {
    await gapi.client.init({
      apiKey: YOUR_API_KEY, // Replace with your actual API key
      discoveryDocs: [
        "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
      ],
    });
    gapiInited = true;
    console.log("GAPI client initialized");
  });
}
// Initialize the GIS client
function initializeGISClient() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: YOUR_CLIENT_ID, // Replace with your actual Client ID
    scope:
      "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.profile",
    callback: (response) => {
      if (response.error || !response.access_token) {
        console.error(
          "Error during token request or access token is missing:",
          response
        );
        isUserSignedIn = false;
        updateAuthButtons();
        openValidationModal("Failed to complete sign-in. Please try again.");
        return;
      }
      accessToken = response.access_token;
      console.log(
        "Access token received (initializeGISClient()):",
        accessToken
      );

      isUserSignedIn = true;

      fetchUserName()
        .then(() => {
          updateAuthButtons(); // Update buttons after fetching user name
        })
        .catch((error) => {
          console.error("Failed to fetch user name:", error);
        });
      fetchGoogleCalendarEvents(); // Fetch events after authentication
    },
  });
}
async function fetchUserName() {
  console.log("Fetching user name...");
  try {
    const response = await gapi.client.request({
      path: "https://www.googleapis.com/oauth2/v1/userinfo",
    });
    const userInfo = response.result;
    console.log("User info fetched:", userInfo);
    const userName = userInfo.name || "User"; // Fallback to 'User' if name is unavailable

    // Update UI
    const userNameElement = document.getElementById("user-name");
    if (userNameElement) {
      userNameElement.textContent = `Welcome, ${userName}`;
      userNameElement.style.display = "inline"; // Ensure it's visible
    }
  } catch (error) {
    console.error("Failed to fetch user name:", error);
  }
}

////////
// Sign In / Out
////////
function updateAuthButtons() {
  const signInButton = document.getElementById("sign-in-button");
  const signOutButton = document.getElementById("sign-out-button");
  const userNameElement = document.getElementById("user-name");

  if (isUserSignedIn) {
    signInButton.style.display = "none";
    signOutButton.style.display = "block";
    if (userNameElement) userNameElement.style.display = "inline";
  } else {
    signInButton.style.display = "block";
    signOutButton.style.display = "none";
    if (userNameElement) {
      userNameElement.style.display = "none";
      userNameElement.textContent = ""; // Clear the user name
    }
  }
}
function handleSignInClick() {
  console.log("gapiInited inside function:", gapiInited); // Debugging log
  if (!gapiInited) {
    console.error("GAPI client not initialized!");
    return;
  }
  console.log("handleSigniInClick executed"); // Debugging log
  tokenClient.requestAccessToken({
    prompt: "consent",
    callback: (response) => {
      if (response.error) {
        console.error("Errror during token request:", response);
        return;
      }

      if (response.access_token) {
        console.log(
          "Access token received (handleSignInClick()):",
          response.access_token
        );
        accessToken = response.access_token;
        isUserSignedIn = true;
        updateAuthButtons();
        fetchUserName();
      } else {
        console.warn("Access token not received:", response);
      }
    },
  });
}
function handleSignOutClick() {
  accessToken = null; // Clear the access token
  console.log("User signed out");
  if (calendar) {
    calendar.removeAllEvents();
    console.log("All events removed from calendar");
  }
  isUserSignedIn = false;
  updateAuthButtons();
  stopPollingCalendarUpdates();
  const modal = document.getElementById("sign-out-modal");
  modal.style.display = "flex";
}
function closeSignOutModal() {
  const modal = document.getElementById("sign-out-modal");
  modal.style.display = "none";
}

////////
// Fetch Google Calendar Events to import to FullCalendar
////////
function fetchGoogleCalendarEvents() {
  if (!accessToken) {
    console.error("No access token available");
    return;
  }

  gapi.client.calendar.events
    .list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      showDeleted: false,
      singleEvents: true,
      orderBy: "startTime",
    })
    .then((response) => {
      const googleEvents = response.result.items;

      const fullCalendarEvents = googleEvents.map((event) => {
        const { summary, start, end, id, reminders } = event;

        // Schedule notifications if reminders are defined
        if (reminders && reminders.overrides) {
          reminders.overrides.forEach((reminder) => {
            const reminderMinutes = reminder.minutes;
            const eventStartTime = start.dateTime || start.date;

            scheduleNotification(summary, eventStartTime, reminderMinutes);
          });
        }
        return {
          title: summary,
          start: start.dateTime || start.date,
          end: end.dateTime || end.date,
          id: id,
          extendedProps: {
            reminders,
          },
        };
      });

      if (calendar) calendar.addEventSource(fullCalendarEvents);
      startPollingCalendarUpdates();
    })
    .catch((error) => {
      console.error("Error fetching calendar events:", error);
    });
}
function startPollingCalendarUpdates() {
  if (pollingIntervalId) {
    console.warn("Polling already in progress");
    return; // prevents polling from starting multiple times
  }
  console.log("Starting polling for calendar events");
  fetchCalendarUpdates();
  pollingIntervalId = setInterval(fetchCalendarUpdates, POLLING_INTERVAL);
}
function stopPollingCalendarUpdates() {
  if (pollingIntervalId) {
    console.log("Stopping polling for calendar events");
    clearInterval(pollingIntervalId);
    pollingIntervalId = null;
  }
}
function fetchCalendarUpdates() {
  console.log("Fetching calendar updates...");
  if (!accessToken) {
    console.error("No access token available");
    return;
  }
  gapi.client.calendar.events
    .list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      showDeleted: false,
      singleEvents: true,
      orderBy: "startTime",
    })
    .then((response) => {
      const events = response.result.items;
      console.log("Fetched calendar events:", events);

      if (calendar) {
        calendar.removeAllEvents();
        const fullCalendarEvents = events.map((event) => ({
          title: event.summary,
          start: event.start.dateTime || event.start.date,
          end: event.end.dateTime || event.end.date,
          id: event.id,
          extendedProps: { reminders: event.reminders },
        }));
        calendar.addEventSource(fullCalendarEvents);
      }
    })
    .catch((error) => {
      console.error("Error fetching calendar events:", error);
    });
}

////////
// Initialize the FullCalendar instance
// includes event handling functions
////////
// Initialize FullCalendar with updated handlers
function initializeCalendar() {
  console.log("Initializing calendar");
  const calendarEl = document.getElementById("calendar");
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
// Floating Action Button (FAB) for creating a new event
function setupFAB() {
  const createEventFab = document.getElementById("create-event-fab");
  if (createEventFab) {
    createEventFab.addEventListener("click", handleFABClick);
  }
}

////////
// Validate User Log In
////////
function requireSignIn(actionCallback) {
  if (!isUserSignedIn) {
    openValidationModal("Please sign in to create events.");
    return false;
  }
  actionCallback();
  return true;
}

////////
// Event Tooltip
////////
function showEventTooltip(event) {
  // console.log("Showing event tooltip"); // Debugging log
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
  if (tooltip) {
    tooltip.style.left = `${event.pageX + 15}px`;
    tooltip.style.top = `${event.pageY + 15}px`;
  }
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
  document.getElementById("create-event").style.display = "none";
  document.getElementById("edit-event").style.display = "block";
  document.getElementById("delete-event").style.display = "block";
  openSidebar();
}
function openCreateEventSidebarForDateRange(start, end) {
  clearEventForm();
  populateSidebarForDateRange(start, end);
  document.getElementById("create-event").style.display = "block";
  document.getElementById("edit-event").style.display = "none";
  document.getElementById("delete-event").style.display = "none";
  openSidebar();
}
function setupCloseSidebarListeners() {
  const closeSidebarButton = document.getElementById("close-sidebar-button");
  if (closeSidebarButton) {
    closeSidebarButton.addEventListener("click", closeSidebar);
  }
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeSidebar();
    }
  });
}
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
        openValidationModal("No event selected for editing.");
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
// Modal Validation
////////
// Open the validation modal with a message
function openValidationModal(message) {
  const modal = document.getElementById("validation-modal");
  const messageElement = document.getElementById("validation-message");
  messageElement.textContent = message; // Set the error message
  modal.style.display = "flex";
}
// Close the validation modal
function closeValidationModal() {
  const modal = document.getElementById("validation-modal");
  modal.style.display = "none";
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
    console.log("notification dropdown:", notificationDropdown.display);
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
  if (createButton) {
    createButton.addEventListener("click", () => {
      if (!isUserSignedIn) {
        openValidationModal("Please log in to create an event.");
        return;
      }

      // Retrieve form values
      const title = document.getElementById("event-title").value.trim();
      const startDate = document.getElementById("event-start-date").value;
      const startTime = document.getElementById("event-start-time").value;
      const endDate = document.getElementById("event-end-date").value;
      const endTime = document.getElementById("event-end-time").value;
      const notificationsEnabled = document.getElementById(
        "enable-notifications"
      ).checked;

      // Validate required fields
      if (!title) {
        openValidationModal("Please enter a title for the event.");
        return;
      }
      if (!startDate || !startTime || !endDate || !endTime) {
        openValidationModal(
          "Please enter valid start and end dates and times."
        );
        return;
      }

      const start = `${startDate}T${startTime}:00`;
      const end = `${endDate}T${endTime}:00`;
      console.log("Start Date:", start);
      console.log("End Date:", end);
      if (new Date(start) >= new Date(end)) {
        openValidationModal("End time must be after start time.");
        return;
      }

      const useThisTimeZone = "PST"; // Set a default time zone or fetch dynamically

      // Prepare the minimal event payload (no reminders)
      const eventResource = {
        summary: title,
        start: { dateTime: start, timeZone: useThisTimeZone },
        end: { dateTime: end, timeZone: useThisTimeZone },
      };

      // Debugging: Log the payload before sending
      console.log("Event Resource Payload (no notifications):", eventResource);

      // Add the event to Google Calendar
      if (gapiInited) {
        gapi.client.calendar.events
          .insert({
            calendarId: "primary",
            resource: eventResource,
          })
          .then(() => {
            if (calendar) {
              calendar.addEvent({
                title: eventResource.summary,
                start: eventResource.start.dateTime,
                end: eventResource.end.dateTime,
              });
            }
          })
          .catch((error) => {
            console.error("Error adding event to Google Calendar:", error);
            openValidationModal(
              "Failed to add event to Google Calendar. Check console for details."
            );
          });
      }
      closeSidebar();
    });
  }
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

  if (deleteEventButton) {
    deleteEventButton.addEventListener("click", () => {
      if (!selectedEvent) {
        openValidationModal("No event selected to delete.");
        return;
      }

      const eventTitle = selectedEvent.title || "this event";
      deleteConfirmationMessage.textContent = `Are you sure you want to delete "${eventTitle}" from Google Calendar?`;
      deleteConfirmationModal.style.display = "flex";

      // Handle "Yes" button click
      confirmDeleteButton.onclick = async () => {
        deleteConfirmationModal.style.display = "none"; // Hide modal
        const eventId = selectedEvent.id; // Assuming `selectedEvent.id` holds the Google Calendar event ID

        if (eventId) {
          try {
            // Call Google Calendar API to delete the event
            const response = await gapi.client.calendar.events.delete({
              calendarId: "primary",
              eventId: eventId,
            });
            console.log(
              "Event successfully deleted from Google Calendar:",
              response
            );

            // Remove the event locally
            selectedEvent.remove();
            selectedEvent = null;
            closeSidebar();
            openValidationModal(
              "Event successfully deleted from Google Calendar."
            );
          } catch (error) {
            console.error("Error deleting event from Google Calendar:", error);
            openValidationModal(
              "Failed to delete event from Google Calendar. Check console for details."
            );
          }
        } else {
          openValidationModal("Event ID not found. Unable to delete event.");
        }
      };

      // Handle "No" button click
      cancelDeleteButton.onclick = () => {
        deleteConfirmationModal.style.display = "none"; // Hide modal
      };
      if (!response.ok) {
        openValidationModal("Failed to delete the event from Google Calendar.");
      }
    });
  }
}

////////
// Create Event Functionality
////////
// Clear the event form
function clearEventForm() {
  document.getElementById("event-title").value = "";
  document.getElementById("event-start-date").value = "";
  document.getElementById("event-start-time").value = "";
  document.getElementById("event-end-date").value = "";
  document.getElementById("event-end-time").value = "";
  document.getElementById("enable-notifications").checked = false;
  document.getElementById("notification-options").style.display = "none";
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

document.addEventListener("DOMContentLoaded", () => {
  try {
    setupEventCreationButton();
  } catch (error) {
    console.error("Error setting up event creation button:", error);
  }
  try {
    setupDebugKey();
  } catch (error) {
    console.error("Error setting up debug");
  }
  try {
    console.log("Page loaded. Checking user authentication status.");
    updateAuthButtons();
  } catch (error) {
    console.error("Error setting up auth buttons:", error);
  }
  try {
    setupFAB();
  } catch (error) {
    console.error("Error setting up event FAB:", error);
  }
  try {
    initializeCalendar();
  } catch (error) {
    console.error("Error initializing calendar:", error);
  }
  try {
    initializeGapiClient();
  } catch (error) {
    console.error("Error initializing GAPI client:", error);
  }
  try {
    initializeGISClient();
  } catch (error) {
    console.error("Error initializing GIS client:", error);
  }
  try {
    handleSignInClick();
  } catch (error) {
    console.error("Error setting up sign-in click handler:", error);
  }
  try {
    setupEditEventButton();
  } catch (error) {
    console.error("Error setting up edit event button:", error);
  }
  try {
    setupDeleteEventButton();
  } catch (error) {
    console.error("Error setting up delete event button:", error);
  }
  try {
    setupCloseSidebarListeners();
  } catch (error) {
    console.error("Error setting up close sidebar listeners:", error);
  }
  try {
    enableSidebarDragging();
  } catch (error) {
    console.error("Error enabling sidebar dragging:", error);
  }
  try {
    setupNotificationToggle();
  } catch (error) {
    console.error("Error setting up notification toggle:", error);
  }
  try {
    closeValidationModal();
  } catch (error) {
    console.error("Error closing validation modal:", error);
  }
  try {
    closeSignOutModal();
  } catch (error) {
    console.error("Error closing sign out modal:", error);
  }
  try {
    initializeNotifications();
    console.log("Notifications initialized.");
  } catch (error) {
    console.error("Error initializing notifications:", error);
  }
});
module.exports = {
  clearEventForm, // Clears the event form
  setupNotificationToggle, // Sets up the notification toggle for enabling/disabling notifications
  populateSidebarWithDate, // Populates the sidebar with a single date
  populateSidebarForDateRange, // Populates the sidebar with a date range (for drag-to-select)
  openSidebar, // Opens the event sidebar
  closeSidebar, // Closes the event sidebar
  setupDeleteEventButton, // Sets up the delete event functionality
  handleSignInClick, // Handles user sign-in
  handleSignOutClick, // Handles user sign-out
  updateAuthButtons, // Updates sign-in/sign-out button visibility
  setupEditEventButton, // Sets up the edit event button
  initializeCalendar, // Initializes the FullCalendar instance
  setupFAB, // Sets up the Floating Action Button (FAB)
  handleFABClick, // Handles FAB click for creating an event
  handleDateClick, // Handles single date clicks on the calendar
  handleDateSelect, // Handles click-and-drag date selection on the calendar
  handleEventClick, // Handles clicks on existing events for editing
  requireSignIn, // Ensures the user is signed in before allowing actions
};

////////
// TO DO
////////
// 1. Click to create and drag to create events check login status // DONE
// 2. Getting notification events from Google Calendar // DONE
// 3. Auto close notifications on clear // DONE
// 4. Remove background colour on today square // DONE
// 5. Study Buddy home link // DONE
// 6. Top bar doesn't scroll // DONE
// 7. Calendar doesn't need to scroll (fits height) // DONE
// 8. Adding Notifications to StudyBuddy

////////
// BUGS
////////
// 1. The calendar will update with events from Google each time logged in (duplicating events) // FIXED
// 2. The log in button doens't swap to log out when logged in until second log in // FIXED
// 3. Sign in, close window, considered signed in // FIXED
// 4. Can't delete events // FIXED
// 5. Can't edit notifications // FIXED
// 6. UTC to PST time fixed // FIXED

////////
// WISH LIST
////////
// 1. Colour coded events
// 2. Notifications bell at top left
// 3. Event Reminders
