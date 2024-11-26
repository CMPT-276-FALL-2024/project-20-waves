////////
// NOTE: this requires API KEY and CLIENT ID to be added within the code
////////
const YOUR_API_KEY = "AIzaSyB55t-76K0WorK2_4TgGlQI8qyI1z-ho2M";
const YOUR_CLIENT_ID =
  "629945653538-pcogqvg1rvcjc8o4520559ejo5skuate.apps.googleusercontent.com";

////////
// Global Variables
////////

// Calendar variables
let calendar;
let selectedEvent = null;
let calendarData = {
  lectures: [],
  tests: [],
};

// API variables
let tokenClient;
let accessToken;
let gapiInited = false;
let isClientInitialized = false;

// User variables
let isUserSignedIn = false;

// Polling variables
let pollingIntervalId = null;
const POLLING_INTERVAL = 60000; // 1 minute

////////
// API
////////
// Initialize the GIS client
function initializeGapiClient() {
  console.log("Initializing GAPI client");
  return new Promise((resolve, reject) => {
    gapi.load("client", async () => {
      try {
        await gapi.client.init({
          apiKey: YOUR_API_KEY, // Replace with your actual API key
          discoveryDocs: [
            "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
          ],
        });
        gapiInited = true;
        console.log("GAPI client initialized");
        resolve();
      } catch (error) {
        console.error("Error initializing GAPI client:", error);
        reject(error);
      }
    });
  });
}
// Initialize the GIS client
function initializeGISClient() {
  return new Promise((resolve, reject) => {
    try {
      tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: YOUR_CLIENT_ID, // REPLACE with your CLIENT ID
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
            openValidationModal(
              "Failed to complete sign-in. Please try again."
            );
            return;
          }
          accessToken = response.access_token;
          console.log(
            "Access token received (initializeGISClient()):",
            accessToken
          );
          isClientInitialized = true;
          isUserSignedIn = true;
          fetchGoogleCalendarEvents(accessToken, gapi, calendar);
          updateAuthButtons();
          fetchUserName();
          fetchUserCalendars();
        },
      });
    } catch (error) {
      console.error("Error initializing GIS client:", error);
      reject(error);
    }
  });
}
async function initializeClients() {
  try {
    await initializeGapiClient();
    console.log("GAPI client initialized successfully");
    await initializeGISClient();
    console.log("GIS client initialized successfully");
  } catch (error) {
    console.error("Error initializing clients:", error);
  }
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
  console.log("Sign-In button clicked");

  if (!gapiInited) {
    console.error("GAPI client not initialized!");
    return;
  }

  console.log("Requesting access token...");
  tokenClient.requestAccessToken({
    prompt: "consent",
    callback: (response) => {
      console.log("Access token callback executed:", response);

      if (response.error) {
        console.error("Error during token request:", response.error);
        openValidationModal("Sign-in failed. Please try again.");
        return;
      }

      if (response.access_token) {
        accessToken = response.access_token;
        isUserSignedIn = true;
        console.log("Access token received:", accessToken);
      } else {
        console.warn("Access token not received.");
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
// Get User's Calendars
async function fetchUserCalendars() {
  if (!accessToken) {
    console.error("No access token available");
    return [];
  }
  try {
    const response = await gapi.client.calendar.calendarList.list();
    const calendars = response.result.items;

    // Log or process the calendars
    console.log("User's calendars:", calendars);

    // Return a simplified list for further use
    return calendars.map((cal) => ({
      id: cal.id,
      name: cal.summary.toLowerCase(),
      primary: cal.primary || false,
    }));
  } catch (error) {
    console.error("Error fetching user's calendars:", error);
    return [];
  }
}
// Fetch events for calendars
function fetchGoogleCalendarEvents(accessToken, gapi, calendar) {
  if (!accessToken) {
    console.error("No access token available");
    return;
  }
  if (!gapi) {
    console.error("GAPI not initialized");
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
        // Map event into FullCalendar format
        const calendarEvent = {
          title: event.summary,
          start: event.start.dateTime || event.start.date,
          end: event.end.dateTime || event.end.date,
          id: event.id,
          extendedProps: { reminders: event.reminders },
        };

        // Schedule notifications if reminders are present
        const startDateTime = event.start.dateTime || event.start.date;
        if (event.reminders && event.reminders.overrides) {
          event.reminders.overrides.forEach((reminder) => {
            if (startDateTime) {
              scheduleNotification(
                event.summary,
                startDateTime,
                reminder.minutes
              );
            } else {
              console.warn(
                `Unable to schedule notification for event "${event.summary}" - missing start time.`
              );
            }
          });
        } else {
          console.warn(`Event "${event.summary}" has no reminders.`);
        }

        return calendarEvent;
      });

      if (calendar) {
        calendar.addEventSource(fullCalendarEvents);
        startPollingCalendarUpdates();
      }
    })
    .catch((error) => {
      console.error("Error fetching calendar events:", error);
    });
}
async function fetchEventsForCalendar(calendarId, listId) {
  try {
    const response = await gapi.client.calendar.events.list({
      calendarId: calendarId,
      timeMin: new Date().toISOString(),
      showDeleted: false,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = response.result.items || [];
    const listElement = document.getElementById(listId);

    // Update the UI directly
    if (listElement) {
      listElement.innerHTML = "";

      if (events.length === 0) {
        const emptyMessage = document.createElement("li");
        emptyMessage.textContent = "No events found.";
        emptyMessage.classList.add("empty-message");
        listElement.appendChild(emptyMessage);
      } else {
        events.forEach((event) => {
          const listItem = document.createElement("li");
          const startTime = new Date(event.start.dateTime || event.start.date);
          listItem.textContent = `${
            event.summary
          } - ${startTime.toLocaleString()}`;
          listElement.appendChild(listItem);
        });
      }
    } else {
      console.warn(`List element with id "${listId}" not found.`);
    }

    return events; // Return the events for further use if needed
  } catch (error) {
    console.error(`Error fetching events for calendar ${calendarId}:`, error);

    const listElement = document.getElementById(listId);
    if (listElement) {
      listElement.innerHTML =
        "<li>Error fetching events. Please try again.</li>";
    }
  }
}
// Fetch updates for Tabs
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
async function fetchCalendarUpdates() {
  console.log("Fetching calendar updates...");
  if (!accessToken) {
    console.error("No access token available");
    return;
  }
  try {
    const calendars = await fetchUserCalendars();
    const lecturesCalendars = calendars.find(
      (cal) => cal.name.toLowerCase() === "lectures"
    );
    if (lecturesCalendars) {
      calendarData.lectures = await fetchEventsForCalendar(
        lecturesCalendars.id
      );
    } else {
      console.warn("No lectures calendar found.");
      calendarData.lectures = [];
    }

    const testsCalendars = calendars.find(
      (cal) => cal.name.toLowerCase() === "tests"
    );
    if (testsCalendars) {
      calendarData.tests = await fetchEventsForCalendar(testsCalendars.id);
    } else {
      console.warn("No tests calendar found.");
      calendarData.tests = [];
    }
    console.log("Calendar data updated:", calendarData);
  } catch (error) {
    console.error("Error fetching calendar updates:", error);
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
        // Remove all existing events in the calendar
        calendar.removeAllEvents();

        // Map fetched events into FullCalendar format
        const fullCalendarEvents = events.map((event) => {
          const calendarEvent = {
            title: event.summary,
            start: event.start.dateTime || event.start.date,
            end: event.end.dateTime || event.end.date,
            id: event.id,
            extendedProps: { reminders: event.reminders },
          };

          // Handle reminders and notifications
          const startDateTime = event.start.dateTime || event.start.date;
          if (event.reminders && event.reminders.overrides) {
            event.reminders.overrides.forEach((reminder) => {
              if (startDateTime) {
                scheduleNotification(
                  event.summary,
                  startDateTime,
                  reminder.minutes
                );
              } else {
                console.warn(
                  `Unable to schedule notification for event "${event.summary}" - missing start time.`
                );
              }
            });
          } else {
            console.warn(`Event "${event.summary}" has no reminders.`);
          }

          return calendarEvent;
        });

        // Add the processed events to FullCalendar
        calendar.addEventSource(fullCalendarEvents);
      } else {
        console.error("Calendar is not defined");
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
      let reminderMinutes = null;

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
        scheduleNotification(title, start, reminderMinutes);
      }

      // Prepare the minimal event payload (no reminders)
      const eventResource = {
        summary: title,
        start: { dateTime: start, timeZone: useThisTimeZone },
        end: { dateTime: end, timeZone: useThisTimeZone },
        reminders: reminders || { useDefault: true },
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
            fetchCalendarUpdates(); // Fetch updates after adding event
            // openValidationModal("Event successfully added to Google Calendar.");
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

  if (!deleteEventButton || !deleteConfirmationModal) {
    console.error("Required elements for delete functionality are missing.");
    return;
  }

  deleteEventButton.addEventListener("click", () => {
    if (!selectedEvent) {
      openValidationModal("No event selected for deletion.");
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
          openValidationModal("Event successfully deleted.");
        } else {
          openValidationModal("Event ID is missing; unable to delete.");
        }
      } catch (error) {
        console.error("Error deleting event:", error);
        openValidationModal(
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
// Toggle between tabs
async function togglePanel(panelId, calendarName, listId) {
  const tabsContainer = document.getElementById("tabs-container");
  const panel = document.getElementById(panelId);

  if (tabsContainer && panel) {
    if (panel.classList.contains("active")) {
      panel.classList.remove("active"); // Close if already open
      return;
    }

    // Close all other panels
    document
      .querySelectorAll(".tab-panel")
      .forEach((p) => p.classList.remove("active"));

    // Align the panel with the tabs-container's position
    panel.style.top = `${tabsContainer.offsetTop}px`;

    try {
      const calendars = await fetchUserCalendars();
      const targetCalendar = calendars.find(
        (cal) => cal.name.toLowerCase() === calendarName.toLowerCase()
      );

      if (targetCalendar) {
        await fetchEventsForCalendar(targetCalendar.id, listId);
      } else {
        document.getElementById(
          listId
        ).innerHTML = `<li>No "${calendarName}" calendar found.</li>`;
      }
    } catch (error) {
      console.error(`Error toggling panel for ${calendarName}:`, error);
      document.getElementById(
        listId
      ).innerHTML = `<li>Error fetching events. Please try again.</li>`;
    }

    panel.classList.add("active"); // Open the panel
  }
}
// Set up the agenda tabs for lectures and tests
async function handleTabClick(calendarName, listId, panelId) {
  const panels = document.querySelectorAll(".tab-panel");
  panels.forEach((panel) => panel.classList.remove("active")); // Close other panels

  await fetchAndUpdateTab(calendarName, listId);

  const panel = document.getElementById(panelId);
  if (panel) panel.classList.add("active");
}
// Tab dragging functionality
function enableTabDragging() {
  const tabsContainer = document.getElementById("tabs-container");
  const handle = document.getElementById("tabs-handle");

  let isDragging = false;
  let startY = 0; // Initial mouse position
  let startTop = 0; // Initial top position of the container

  handle.addEventListener("mousedown", (event) => {
    event.preventDefault(); // Prevent text selection and default behavior
    isDragging = true;
    startY = event.clientY;
    startTop = tabsContainer.offsetTop; // Current top position of the container
    document.body.style.cursor = "grabbing";
  });

  document.addEventListener("mousemove", (event) => {
    if (!isDragging) return;

    // Calculate new top position
    const deltaY = event.clientY - startY;
    let newTop = startTop + deltaY;

    // Clamp the position to keep within screen bounds
    const maxTop = window.innerHeight - tabsContainer.offsetHeight;
    newTop = Math.max(0, Math.min(newTop, maxTop));

    tabsContainer.style.top = `${newTop}px`;
  });

  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      document.body.style.cursor = "";
    }
  });
}
// Ensure tabs remain functional
function setupAgendaTabs() {
  document
    .getElementById("lectures-tab")
    .addEventListener("click", async () => {
      await openPanel("lectures-panel", "Lectures", "lectures-list");
    });

  document.getElementById("tests-tab").addEventListener("click", async () => {
    await openPanel("tests-panel", "Tests", "tests-list");
  });
}
// Open panel at tab height
function openPanel(panelId, calendarName, listId) {
  const tabsContainer = document.getElementById("tabs-container");
  const panel = document.getElementById(panelId);

  if (tabsContainer && panel) {
    // Close the panel if it's already open
    if (panel.classList.contains("active")) {
      panel.classList.remove("active");
      return;
    }

    // Close other panels before opening the new one
    document
      .querySelectorAll(".tab-panel")
      .forEach((p) => p.classList.remove("active"));

    // Align the panel's top position with the tabs-container
    if (!panel.style.top) {
      panel.style.top = `${tabsContainer.offsetTop}px`;
    }

    // Use pre-fetched data to populate the panel
    const events =
      calendarName.toLowerCase() === "lectures"
        ? calendarData.lectures
        : calendarData.tests;

    const listElement = document.getElementById(listId);
    if (listElement) {
      listElement.innerHTML = ""; // Clear existing list

      if (events.length > 0) {
        events.forEach((event) => {
          const listItem = document.createElement("li");
          const startTime = new Date(event.start.dateTime || event.start.date);
          listItem.textContent = `${
            event.summary
          } - ${startTime.toLocaleString()}`;
          listElement.appendChild(listItem);
        });
      } else {
        listElement.innerHTML = `<li>No "${calendarName}" events found.</li>`;
      }
    } else {
      console.warn(`List element with id "${listId}" not found.`);
    }

    panel.classList.add("active"); // Open the panel
  } else {
    console.warn("Tabs container or panel not found.");
  }
}

function closePanel(panelId) {
  const panel = document.getElementById(panelId);
  if (panel) {
    panel.classList.remove("active");
  }
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
document.addEventListener("DOMContentLoaded", async () => {
  try {
    await initializeClients();
    console.log("Clients initialized successfully");

    const userCalendars = await fetchUserCalendars();
    if (userCalendars.length > 0) {
      console.log("Available calendars:", userCalendars);
    } else {
      console.warn("No calendars found for the user.");
    }
  } catch (error) {
    console.error("Error during initialization:", error);
  }
  document.querySelectorAll(".close-panel-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const panel = button.closest(".tab-panel");
      panel.classList.remove("active");
    });
  });

  // Outside click listener
  document.addEventListener("click", (event) => {
    const isClickInside =
      event.target.closest(".tab-panel") || event.target.closest(".tab");
    if (!isClickInside) {
      document.querySelectorAll(".tab-panel").forEach((panel) => {
        panel.classList.remove("active");
      });
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  try {
    enableTabDragging();
  } catch (error) {
    console.error("Error enabling tab dragging:", error);
  }
  try {
    setupAgendaTabs();
  } catch {
    console.error("Error setting up agenda tabs");
  }
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
  populateSidebarWithEventDetails, // Populates the sidebar with existing event details
  fetchGoogleCalendarEvents, // Fetches events from Google Calendar
  openSidebar, // Opens the event sidebar
  setupAgendaTabs, // Sets up the agenda tabs for lectures and tests
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
  openValidationModal, // Opens the validation modal with a message
  closeValidationModal, // Closes the validation modal
  fetchCalendarUpdates, // Fetches updates from Google Calendar
  fetchEventsForCalendar, // Fetches events for a specific calendar
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
// 8. Adding Notifications to StudyBuddy // DONE

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
// 2. Notifications bell at top left // DONE
// 3. Event Reminders // DONE

/////////////////////////////
//
// Schedule notifications error when deleting events if past event date
