//////////////////////////////////////////////////////////////////////////////
//                   Handles Authentication and Token Handling              //
//////////////////////////////////////////////////////////////////////////////
//                                  Holds User data                         //
//////////////////////////////////////////////////////////////////////////////
import { populateCalendarEvents } from "./calendarscripts.js";

const User = {
  API_KEY: "AIzaSyB55t-76K0WorK2_4TgGlQI8qyI1z-ho2M", // API key for GAPI client
  CLIENT_ID:
    "629945653538-pcogqvg1rvcjc8o4520559ejo5skuate.apps.googleusercontent.com", // Client ID for GIS client
  calendars: [], // Stores user calendars, storing events in each calendar
  isLoggedIn: false, // Tracks login state
  ready: null, // Tracks initialization state
  accessToken: null, // Stores user access token
  isUserInitialized: false, // Tracks user initialization state
  userName: null, // Stores user name

  saveState() {
    const state = {
      isLoggedIn: this.isLoggedIn,
      accessToken: this.accessToken,
      calendars: this.calendars,
      events: this.events,
      userName: this.userName,
    };
    console.log("Saving user state:", state); // Debug log
    localStorage.setItem("userState", JSON.stringify(state));
    console.log("User state saved to localStorage."); // Confirmation log
  },

  loadState() {
    const state = localStorage.getItem("userState");
    if (!state) {
      console.log("No user state found in localStorage.");
      return;
    }

    try {
      const parsedState = JSON.parse(state);
      console.log("Loaded user state:", parsedState); // Debug log
      this.isLoggedIn = parsedState.isLoggedIn || false;
      this.accessToken = parsedState.accessToken || null;
      this.calendars = parsedState.calendars || [];
      this.events = parsedState.events || [];
    } catch (error) {
      console.error("Error parsing user state from localStorage:", error);
    }
  },

  clearState() {
    localStorage.removeItem("userState");
    console.log("User state cleared from localStorage.");
  },

  async initializeUser() {
    if (this.isUserInitialized) {
      console.log("User already initialized.");
      return;
    }

    this.isUserInitialized = true;

    try {
      console.log("Initializing user...");
      await this.initializeClients();

      console.log("Waiting for User to sign in...");
      await this.waitForLogIn();

      console.log("Fetching user name...");
      await this.fetchUserName();

      console.log("Updating auth buttons...");
      await this.updateAuthButtons();

      if (window.location.pathname.includes("calendar.html")) {
        console.log("Fetching user calendars...");
        await this.fetchUserCalendars();

        console.log("Fetching calendar events...");
        await this.fetchAllCalendarEvents();

        console.log("Populating calendar events...");
        populateCalendarEvents();
      }

      console.log("Saving User state...");
      this.saveState();

      console.log("User initialized.");
    } catch (error) {
      console.error("Error initializing user:", error);
    }
  },

  async initializeClients() {
    if (!this.ready) {
      this.ready = new Promise((resolve, reject) => {
        async () => {
          try {
            await this.initializeGapiClient();
            console.log("GAPI client initialized.");
            await this.initializeGISClient();
            console.log("GIS client initialized.");
            resolve();
          } catch (error) {
            console.error("Error during client initialization:", error);
            reject(error);
          }
        };
      });
    }
    return this.ready;
  },

  async initializeGapiClient() {
    return new Promise((resolve, reject) => {
      gapi.load("client", async () => {
        try {
          await gapi.client.init({
            apiKey: this.API_KEY,
            discoveryDocs: [
              "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
            ],
          });
          resolve();
        } catch (error) {
          console.error("Error initializing GAPI client:", error);
          reject(error);
        }
      });
    });
  },

  async initializeGISClient() {
    return new Promise((resolve, reject) => {
      try {
        this.tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: this.CLIENT_ID,
          scope:
            "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.profile",
          callback: (response) => {
            if (response.error || !response.access_token) {
              console.error("Error during token request:", response);
              return;
            }
            this.accessToken = response.access_token;
            this.isLoggedIn = true;
            console.log("Access token obtained:", this.accessToken);
          },
        });
        resolve();
      } catch (error) {
        console.error("Error initializing GIS client:", error);
        reject(error);
      }
    });
  },

  async fetchUserName() {
    // Return the user name if already fetched
    if (this.userName) {
      console.log("User name already fetched:", this.userName);
      return this.userName;
    }

    try {
      // Set the access token for the GAPI client
      await gapi.client.setToken({ access_token: this.accessToken });

      // Fetch user info from the OAuth2 API
      if (!this.accessToken || !this.isLoggedIn) {
        await this.ensureAccessToken();
      }

      const response = await gapi.client.request({
        path: "https://www.googleapis.com/oauth2/v1/userinfo",
      });

      const userInfo = response.result;
      console.log("User info fetched:", userInfo);
      this.userName = userInfo.name || "User"; // Fallback if no name is available

      // Wait until the header is fully loaded
      const userNameElement = await new Promise((resolve) => {
        const checkExist = setInterval(() => {
          const element = document.getElementById("user-name");
          if (element) {
            clearInterval(checkExist);
            resolve(element);
          }
        }, 100);
      });
      userNameElement.textContent = `Welcome, ${this.userName}`;
      userNameElement.style.display = "inline";
    } catch (error) {
      console.error("Failed to fetch user name:", error);
    }
  },

  updateAuthButtons() {
    console.log("Updating auth buttons...");
    const signInButton = document.getElementById("sign-in-button");
    const signOutButton = document.getElementById("sign-out-button");
    const userNameElement = document.getElementById("user-name");

    if (!signInButton || !signOutButton || !userNameElement) {
      console.error("Auth buttons or user name element not found in the DOM.");
      return;
    }

    if (this.isLoggedIn) {
      console.log("User is logged in. Switching to sign-out button.");
      signInButton.style.display = "none";
      signOutButton.style.display = "block";
      userNameElement.textContent = `Welcome, ${this.userName}`;
      userNameElement.style.display = "inline";
    } else {
      console.log("User is not logged in. Switching to sign-in button.");
      signInButton.style.display = "block";
      signOutButton.style.display = "none";
      userNameElement.textContent = "";
      userNameElement.style.display = "none";
    }
  },

  async waitForLogIn() {
    // Wait for the user to log in if not already logged in
    if (this.isLoggedIn) return;

    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (this.isLoggedIn) {
          clearInterval(interval);
          resolve();
        }
      }, 500);
    });
  },

  async ensureAccessToken() {
    if (!this.isLoggedIn) {
      console.log("Ensuring access token: Requesting new access token...");
      return new Promise((resolve, reject) => {
        try {
          this.tokenClient.requestAccessToken({
            prompt: "consent",
            callback: (response) => {
              if (response.error || !response.access_token) {
                console.error("Error during token request:", response.error);
                reject(response.error);
                return;
              }
              this.accessToken = response.access_token;
              console.log("Access token refreshed:", this.accessToken);
              this.isLoggedIn = true;
              resolve(this.accessToken);
            },
          });
        } catch (error) {
          console.error("Error ensuring access token:", error);
          reject(error);
        }
      });
    }
    console.log("Access token already available");
    return this.accessToken;
  },

  async fetchUserCalendars() {
    await this.ensureAccessToken();

    try {
      const response = await gapi.client.calendar.calendarList.list();
      const allCalendars = response.result.items;

      const allowedCalendars = ["Primary", "Lectures", "Assignments", "Tests"];
      this.calendars = allCalendars
        .filter((cal) => cal.primary || allowedCalendars.includes(cal.summary))
        .map((cal) => ({
          id: cal.id,
          name: cal.primary ? "Primary" : cal.summary,
          primary: cal.primary || false,
          events: [], // Initialize events array for each calendar
        }));
      console.log("Calendars filtered, fetched and stored:", this.calendars);
      return this.calendars;
    } catch (error) {
      console.error("Error fetching user calendars:", error);
      throw error;
    }
  },

  async fetchCalendarEvents(calendarId) {
    console.log(`Fetching events for calendar: ${calendarId}`);
    await this.ensureAccessToken();

    try {
      const response = await gapi.client.calendar.events.list({
        calendarId,
        timeMin: new Date().toISOString(),
        showDeleted: false,
        singleEvents: true,
        orderBy: "startTime",
      });

      const events = response.result.items.map((event) => ({
        id: event.id,
        title: event.summary,
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
      }));

      // Find the calendar and store its events
      const calendar = this.calendars.find((cal) => cal.id === calendarId);
      if (calendar) {
        calendar.events = events;
        console.log(`Events stored for calendar ${calendarId}:`, events);
      } else {
        console.error(`Calendar with ID ${calendarId} not found.`);
      }

      return events;
    } catch (error) {
      console.error(`Error fetching events for calendar ${calendarId}:`, error);
      throw error;
    }
  },

  async fetchAllCalendarEvents() {
    console.log("Fetching events for specific calendars...");
    const eventPromises = this.calendars.map(async (calendar) => {
      const events = await this.fetchCalendarEvents(calendar.id);
      calendar.events = events; // Store fetched events in the calendar object
      return events;
    });

    await Promise.all(eventPromises); // Wait for all fetches to complete
    console.log("All events fetched and stored.");
  },

  closeSignOutModal() {
    const modal = document.getElementById("sign-out-modal");
    modal.style.display = "none";
  },

  getAccessToken() {
    if (!this.isUserLoggedIn) {
      console.error("getAccessToken() : User is not logged in");
      return null;
    }
    return this.accessToken;
  },

  getUserName() {
    try {
      return this.userName;
    } catch (error) {
      console.error("getUserName() : Error fetching user name:", error);
    }
  },

  getUserState() {
    return this.isUserLoggedIn;
  },

  openValidationModal(message) {
    const modal = document.getElementById("validation-modal");
    const modalMessage = document.getElementById("validation-message");
    modalMessage.textContent = message;
    modal.style.display = "block";
  },

  closeValidationModal() {
    const modal = document.getElementById("validation-modal");
    modal.style.display = "none";
  },

  async handleSignInClick() {
    console.log("Sign-In button clicked.");
    try {
      await this.ensureAccessToken();

      console.log("User signed in successfully.");
      this.isLoggedIn = true;
      this.saveState();
      console.log("User state saved.");
      this.updateAuthButtons();
    } catch (error) {
      console.error("Error during sign-in:", error);
    }
  },

  handleSignOutClick() {
    console.log("Sign-Out button clicked.");
    this.accessToken = null;
    this.isLoggedIn = false;
    this.calendars = [];
    this.calendarEvents = [];
    this.notifications = [];
    this.clearState();
    this.updateAuthButtons();
    console.log("User signed out. State cleared.");
    location.reload();
  },

  async fetchCalendarUpdates() {
    console.log("Fetching calendar updates...");
    await this.ensureAccessToken(); // Ensure token validity

    try {
      const response = await gapi.client.calendar.events.list({
        calendarId,
        timeMin: new Date().toISOString(),
        showDeleted: false,
        singleEvents: true,
        orderBy: "startTime",
      });

      const updatedEvents = response.result.items.map((event) => ({
        title: event.summary,
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
      }));

      this.calendarEvents = updatedEvents;
      console.log("Calendar events updated:", this.calendarEvents);

      return this.calendarEvents;
    } catch (error) {
      console.error("Error updating calendar events:", error);
      throw error;
    }
  },
};

export default User;

window.User = User;