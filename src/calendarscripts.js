////////
// NOTE: this requires API KEY and CLIENT ID to be added within the code
////////

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

// Debugging
let isApiConnected = false;



////////
// API
////////
// Initialize the Google API client
function initializeGapiClient() {
  console.log("Initializing GAPI client");
  gapi.load("client", async () => {
    await gapi.client.init({
      apiKey: "", // Replace with your actual API key
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
    client_id: "", // Replace with your actual Client ID
    scope: "https://www.googleapis.com/auth/calendar",
    callback: (response) => {
      if (response.error) {
        console.error("Error during token request:", response);
        return;
      }
      accessToken = response.access_token;
      console.log("Access token received:", accessToken);
      fetchGoogleCalendarEvents(); // Fetch events after authentication
    },
  });
}


////////
// Sign In / Out
////////
function updateAuthButtons(isSignedIn) {
  const signInButton = document.getElementById("sign-in-button");
  const signOutButton = document.getElementById("sign-out-button");

  if (isSignedIn) {
    signInButton.style.display = "none";
    signOutButton.style.display = "block";
  } else {
    signInButton.style.display = "block";
    signOutButton.style.display = "none";
  }
}

function handleSignInClick() {
  console.log("Handle Sign In: Requesting access token");
  if (!gapiInited) {
    console.error("GAPI client not initialized!");
    return;
  }
  tokenClient.requestAccessToken();
  console.log("User signed in");
  updateAuthButtons(true);

}

function handleSignOutClick() {
  accessToken = null; // Clear the access token
  console.log("User signed out");

  if (calendar) {
    calendar.removeAllEvents();
    console.log("All events removed from calendar");
  }

  updateAuthButtons(false);

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

  console.log("Access token is available:", accessToken);

  gapi.client.calendar.events
    .list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      showDeleted: false,
      singleEvents: true,
      orderBy: "startTime",
    })
    .then((response) => {
      console.log("gapi.client.calendar.events.list was called successfully");
      const googleEvents = response.result.items;
      const fullCalendarEvents = googleEvents.map((event) => ({
        title: event.summary,
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
        id: event.id,
      }));
      console.log("Mapped events for fullCalendar:", fullCalendarEvents);

      if (calendar)
      calendar.addEventSource(fullCalendarEvents);
    })
    .catch((error) => {
      console.error("Error fetching calendar events:", error);
    });
}

////////
// Initialize the FullCalendar instance
// includes event handling functions
////////
function initializeCalendar() {
  console.log("Initializing calendar");
  const calendarEl = document.getElementById("calendar");
  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    selectable: true,
    events: fetchEvents(),
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay",
    },
    footerToolbar: false,

    dateClick: function (info) {
      openCreateEventSidebarWithCurrentTime(info.date);
    },
    select: function (info) {
      console.log("Date range selected from:", info.start, "to", info.end);
      populateSidebarForDateRange(info.start, info.end);
      openSidebar();
    },
    eventClick: function (info) {
      openEditEventSidebar(info.event);
    },
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

////////
// Event Tooltip
////////
function showEventTooltip(event) {
  console.log("Showing event tooltip");
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
  console.log("Hiding event tooltip");
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
function openCreateEventSidebar(date) {
  clearEventForm();
  document.getElementById("create-event").style.display = "block";
  document.getElementById("delete-event").style.display = "none";
  document.getElementById("edit-event").style.display = "none";
  populateSidebarWithDate(date);
  openSidebar();
  selectedEvent = null;
}
function openEditEventSidebar(event) {
  selectedEvent = event;
  populateSidebarWithEventDetails(event);
  document.getElementById("create-event").style.display = "none";
  document.getElementById("edit-event").style.display = "block";
  document.getElementById("delete-event").style.display = "block";
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
function openSidebar() {
  const eventSidebar = document.getElementById("event-sidebar");
  if (!eventSidebar.classList.contains("open")) {
    eventSidebar.classList.add("open");
  }
}
function closeSidebar() {
  const eventSidebar = document.getElementById("event-sidebar");
  if (eventSidebar.classList.contains("open")) {
    eventSidebar.classList.remove("open");
    console.log("Sidebar closed."); // Debugging log
  }
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
// Click and drag event creation
function populateSidebarForDateRange(start, end) {
  document.getElementById("event-start-date").value = start.toISOString().split("T")[0];
  document.getElementById("event-start-time").value = start.toTimeString().slice(0, 5);
  document.getElementById("event-end-date").value = end.toISOString().split("T")[0];
  document.getElementById("event-end-time").value = end.toTimeString().slice(0, 5);
}
// For editing an existing event
function populateSidebarWithEventDetails(event) {
  document.getElementById("event-title").value = event.title;

  // Use raw values directly for start and end times
  const startDate = event.start.toISOString().split("T")[0];
  const startTime = event.start.toTimeString().slice(0, 5);

  const endDate = event.end ? event.end.toISOString().split("T")[0] : "";
  const endTime = event.end ? event.end.toTimeString().slice(0, 5) : "";

  document.getElementById("event-start-date").value = startDate;
  document.getElementById("event-start-time").value = startTime;
  document.getElementById("event-end-date").value = endDate;
  document.getElementById("event-end-time").value = endTime;
}
// Click event creation
function populateSidebarWithDate(date) {
  const currentDate = date.toISOString().split("T")[0];
  const currentTime = date.toTimeString().slice(0, 5);

  document.getElementById("event-start-date").value = currentDate;
  document.getElementById("event-start-time").value = currentTime;

  // Set a default end time 15 minutes later
  const endDate = new Date(date);
  endDate.setMinutes(endDate.getMinutes() + 15);
  document.getElementById("event-end-date").value = endDate
    .toISOString()
    .split("T")[0];
  document.getElementById("event-end-time").value = endDate
    .toTimeString()
    .slice(0, 5);
}
// Clicking on a timeslot event creation
function openCreateEventSidebarWithCurrentTime(clickedDate) {
  clearEventForm();

  const clickedDateStr = clickedDate.toISOString().split("T")[0];
  document.getElementById("event-start-date").value = clickedDateStr;
  document.getElementById("event-end-date").value = clickedDateStr;

  const now = new Date();
  const currentHours = String(now.getHours()).padStart(2, "0");
  const currentMinutes = String(now.getMinutes()).padStart(2, "0");
  const currentTime = `${currentHours}:${currentMinutes}`;

  document.getElementById("event-start-time").value = currentTime;

  const endTime = new Date(now);
  endTime.setHours(endTime.getHours() + 1);
  const endHours = String(endTime.getHours()).padStart(2, "0");
  const endMinutes = String(endTime.getMinutes()).padStart(2, "0");
  document.getElementById("event-end-time").value = `${endHours}:${endMinutes}`;

  openSidebar();
}

////////
// Edit Event Button
////////
function setupEditEventButton() {
  const editEventButton = document.getElementById("edit-event");
  if (editEventButton) {
    editEventButton.addEventListener("click", () => {
      if (!selectedEvent) return;

      // Get updated details from the sidebar form
      const title = document.getElementById("event-title").value;
      const startDate = document.getElementById("event-start-date").value;
      const startTime = document.getElementById("event-start-time").value;
      const endDate = document.getElementById("event-end-date").value;
      const endTime = document.getElementById("event-end-time").value;

      const newStart = `${startDate}T${startTime}`;
      const newEnd = `${endDate}T${endTime}`;

      if (newEnd <= newStart) {
        alert("End time must be after start time.");
        return;
      }

      // Update event properties
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
function createEventFAB() {
  const createEventFab = document.getElementById("create-event-fab");
  if (createEventFab) {
    createEventFab.addEventListener("click", () => {
      openCreateEventSidebar(new Date());
    });
  }
}

////////
// Create Event Functionality
////////
function setupEventCreation() {
  const createButton = document.getElementById("create-event"); // Button in the sidebar
  if (createButton) {
    createButton.addEventListener("click", () => {
      // Retrieve form values
      const title = document.getElementById("event-title").value.trim();
      const startDate = document.getElementById("event-start-date").value;
      const startTime = document.getElementById("event-start-time").value;
      const endDate = document.getElementById("event-end-date").value;
      const endTime = document.getElementById("event-end-time").value;

      // Check for required fields
      if (!title) {
        alert("Please enter a title for the event.");
        return;
      }
      if (!startDate || !startTime || !endDate || !endTime) {
        alert("Please enter valid start and end dates and times.");
        return;
      }

      // Use raw date and time values
      const start = `${startDate}T${startTime}`;
      const end = `${endDate}T${endTime}`;

      // Add event to FullCalendar
      if (calendar) {
        calendar.addEvent({
          title,
          start,
          end,
        });
      }

      // Add event to Google Calendar
      if (gapiInited) {
        gapi.client.calendar.events
          .insert({
            calendarId: "primary",
            resource: {
              summary: title,
              start: { dateTime: start },
              end: { dateTime: end },
            },
          })
          .then(() => {
            alert("Event successfully added to Google Calendar!");
          })
          .catch((error) => {
            console.error("Error adding event to Google Calendar:", error);
            alert("Failed to add event to Google Calendar.");
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
  if (deleteEventButton) {
    deleteEventButton.addEventListener("click", () => {
      if (selectedEvent) {
        selectedEvent.remove();
        closeSidebar();
        selectedEvent = null;
      }
    });
  }
}

////////
// Create Event Functionality
////////
function clearEventForm() {
  document.getElementById("event-title").value = "";
  document.getElementById("event-start-date").value = "";
  document.getElementById("event-start-time").value = "";
  document.getElementById("event-end-date").value = "";
  document.getElementById("event-end-time").value = "";
}

////////
// Event Fetching Functionality
////////
function fetchEvents() {
  return isApiConnected ? fetchGoogleCalendarEvents() : getMockEvents();
}

////////
// Mock Event Data
////////
function getMockEvents() {
  return [
    {
      id: "1",
      title: "Math Study Group",
      start: "2024-11-10T10:00:00",
      end: "2024-11-10T12:00:00",
    },
    {
      id: "2",
      title: "History Review Session",
      start: "2024-11-11T14:00:00",
      end: "2024-11-11T15:30:00",
    },
    {
      id: "3",
      title: "Science Project",
      start: "2024-11-12T09:00:00",
      end: "2024-11-12T10:30:00",
    },
  ];
}

document.addEventListener("DOMContentLoaded", () => {
  try {
    console.log("Page loaded. Checking user authentication status.");
    const isSignedIn = false;
    updateAuthButtons(isSignedIn);
  } catch (error) {
    console.error("Error setting up auth buttons:", error);
  }
  try {
    createEventFAB();
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
    setupEventCreation();
  } catch (error) {
    console.error("Error setting up event creation:", error);
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
});
module.exports = {
  fetchGoogleCalendarEvents,
  clearEventForm,
  initializeCalendar,
  showEventTooltip,
  hideEventTooltip,
  openSidebar,
  closeSidebar,
  setupEventCreation,
  setupDeleteEventButton,
  openCreateEventSidebar,
  openEditEventSidebar,
  enableSidebarDragging,
  populateSidebarWithEventDetails,
  setupCloseSidebarListeners,
  fetchEvents
};


////////
// BUGS
////////
// 1. The calendar will update with events from Google each time logged in (duplicating events)
// 2. The log in button doens't swap to log out when logged in until second log in


////////
// WISH LIST
////////
// 1. Colour coded events
/* const calendar = new FullCalendar.Calendar(calendarEl, {
  initialView: "dayGridMonth",
  events: fetchEvents(),
  eventDidMount: function (info) {
    const event = info.event;

    // Apply custom colors based on event type or other properties
    if (event.extendedProps.type === "important") {
      info.el.style.backgroundColor = "#f94144"; // Red
      info.el.style.borderColor = "#f3722c"; // Orange border
      info.el.style.color = "white"; // White text
    } else if (event.extendedProps.type === "casual") {
      info.el.style.backgroundColor = "#90be6d"; // Green
      info.el.style.borderColor = "#43aa8b"; // Dark green border
      info.el.style.color = "#333"; // Dark text
    }
  },
}); */
//2. Notifications
