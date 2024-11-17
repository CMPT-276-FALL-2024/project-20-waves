// Description: This file contains the main logic for the calendar application. It initializes the FullCalendar instance, handles event creation and editing, and manages the sidebar functionality.

// DEBUGGING: Set to false to use mock data, true to use API data
let isApiConnected = false;

// Reference to the FullCalendar instance
let calendar;
// Keeps track of the event being edited
let selectedEvent = null;

// API
let tokenClient;
let accessToken;
let gapiInited = false;

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

function handleSignInClick() {
  console.log("Handle Sign In: Requesting access token");
  if (!gapiInited) {
    console.error("GAPI client not initialized!");
    return;
  }
  console.log(tokenClient.requestAccessToken());
  tokenClient.requestAccessToken(); // Request an access token
}

function handleSignOutClick() {
  accessToken = null; // Clear the access token
  console.log("User signed out");
}

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
      const events = response.result.items;
      console.log("Fetched events:", events);
      // Add your logic to display events in FullCalendar
    })
    .catch((error) => {
      console.error("Error fetching calendar events:", error);
    });
}

//
// Initialize FullCalendar
//
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

//
// Tooltip functionality
//
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

//
// Open and closing of sidebar
//
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

//
// Sidebar population functions
//

// Populate sidebar with date range
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

// Populate sidebar with event details (for editing)
function populateSidebarWithEventDetails(event) {
  document.getElementById("event-title").value = event.title;

  const convertToLocalTime = (date) => {
    const localDate = new Date(date); // Ensure input is treated as UTC
    return new Date(
      localDate.getUTCFullYear(),
      localDate.getUTCMonth(),
      localDate.getUTCDate(),
      localDate.getUTCHours(),
      localDate.getUTCMinutes(),
      localDate.getUTCSeconds()
    );
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatTime = (date) => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // Convert start and end times to local time
  const startDate = convertToLocalTime(new Date(event.start));
  const endDate = event.end ? convertToLocalTime(new Date(event.end)) : null;

  // Populate start and end date/time fields
  document.getElementById("event-start-date").value = formatDate(startDate);
  document.getElementById("event-start-time").value = formatTime(startDate);

  if (endDate) {
    document.getElementById("event-end-date").value = formatDate(endDate);
    document.getElementById("event-end-time").value = formatTime(endDate);
  }

  const notifyNumberElement = document.getElementById("notify-before-number");
  const notifyTypeElement = document.getElementById("notify-before-type");

  if (event.extendedProps && event.extendedProps.notification) {
    const { notifyBeforeNumber, notifyBeforeType } =
      event.extendedProps.notification;
    notifyNumberElement.value = notifyBeforeNumber;
    notifyTypeElement.value = notifyBeforeType;
  } else {
    notifyNumberElement.value = 1; // Default notification settings
    notifyTypeElement.value = "minutes";
  }
}

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

// Event creation and editing
function setupCreateEventButton() {
  const createEventButton = document.getElementById("create-event-button");
  if (createEventButton) {
    createEventButton.addEventListener("click", () => {
      openCreateEventSidebar(new Date());
    });
  }
}

//
// Edit event functionality
//
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

//
// Event creation functionality
//
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
      if (!startDate || !startTime) {
        alert("Please enter a valid start date and time.");
        return;
      }
      if (!endDate || !endTime) {
        alert("Please enter a valid end date and time.");
        return;
      }

      // VALIDATION: Check that end date/time is after start date/time
      const start = new Date(`${startDate}T${startTime}`);
      const end = new Date(`${endDate}T${endTime}`);
      if (end <= start) {
        alert("End time must be after start time.");
        return;
      }

      const notifyBeforeNumber = document.getElementById(
        "notify-before-number"
      ).value;
      const notifyBeforeType =
        document.getElementById("notify-before-type").value;

      const notification = {
        notifyBeforeNumber: parseInt(notifyBeforeNumber),
        notifyBeforeType,
      };

      if (calendar) {
        calendar.addEvent({
          title,
          start,
          end,
          extendedProps: { notification },
        });
      }

      closeSidebar();
    });
  }
}

//
// Delete event functionality
//
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

//
// Clear event form
//
function clearEventForm() {
  document.getElementById("event-title").value = "";
  document.getElementById("event-start-date").value = "";
  document.getElementById("event-start-time").value = "";
  document.getElementById("event-end-date").value = "";
  document.getElementById("event-end-time").value = "";
}

//
// Sidebar functionality
//

// Modify setupCloseSidebarListeners to directly reference closeSidebar
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

// Sidebar control functions
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

//
// Event fetching
//

function fetchEvents() {
  return isApiConnected ? fetchApiEvents() : getMockEvents();
}

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

// Ensure all listeners are set up on DOM load
document.addEventListener("DOMContentLoaded", () => {
  initializeCalendar();
  initializeGapiClient();
  initializeGISClient();
  handleSignInClick();
  handleSignOutClick();
  setupEventCreation();
  setupCreateEventButton();
  setupEditEventButton();
  setupDeleteEventButton();
  setupCloseSidebarListeners();
  enableSidebarDragging();
  setupDOMListeners();
});

module.exports = {
  fetchEvents,
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
};
