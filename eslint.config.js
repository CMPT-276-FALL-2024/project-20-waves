import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
        google: "true",
        gapi: "true",
        FullCalendar: "true",
        notificationsEnabled: "true",
        addNotification: "true",
        scheduledReminders: "true",
        fetchAndUpdateTab: "true",
        reminders: "true",
        openValidationModal: "true",
        gapiInited: "true",
        fetchCalendarUpdates: "true",
        docume: "true",
        calendarData: "true",
        fetchSecondaryGoogleCalendarEvents: "true",
        fetchUserCalendars: "true",
        calendarId: "true",
      },
    },
  },
  {
    ...pluginJs.configs.recommended,
    rules: {
      ...pluginJs.configs.recommended.rules,
      "no-unused-vars": "off",
    },
  },
];
