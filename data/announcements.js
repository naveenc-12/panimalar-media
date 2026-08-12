"use strict";

/*
=========================================================
PANIMALAR MEDIA
ANNOUNCEMENTS DATA
=========================================================

Add, edit, or remove announcements here.

IMPORTANT:
- publishedAt must be a valid ISO date/time.
- The website automatically calculates:
    Just now
    15 minutes ago
    2 hours ago
    Yesterday
    3 days ago
    etc.

- pinned: true  → appears before normal announcements.
- pinned: false → normal announcement.

You do NOT need a backend for this.
This file is the content source for the static website.
=========================================================
*/

const announcements = [

    {
        id: "pace-2k26-registration",
        title: "PACE 2K26 registrations are now open",
        type: "New Event",

        publishedAt: "2026-08-11T09:30:00",

        body:
            "Registrations are now open for PACE 2K26. " +
            "Check the Events page for complete details, " +
            "event categories and registration links.",

        pinned: true,

        link: "events.html",
        linkText: "View event"
    },


    {
        id: "photography-workshop",
        title: "Photography workshop registration",
        type: "Workshop",

        publishedAt: "2026-08-10T16:30:00",

        body:
            "A photography workshop is being conducted for " +
            "students interested in improving their photography " +
            "and visual storytelling skills.",

        pinned: false,

        link: "events.html",
        linkText: "View workshop"
    },


    {
        id: "club-recruitment",
        title: "Media team recruitment applications open",
        type: "Recruitment",

        publishedAt: "2026-08-09T11:00:00",

        body:
            "Applications are open for students interested in " +
            "graphic design, video editing, photography, content " +
            "writing and social media.",

        pinned: false,

        link: "about.html",
        linkText: "Learn more"
    },


    {
        id: "bus-route-update",
        title: "Updated campus bus route information",
        type: "Bus Update",

        publishedAt: "2026-08-08T08:45:00",

        body:
            "Updated route and timing information is now available. " +
            "Check the Bus Routes section before planning your trip.",

        pinned: false,

        link: "bus-routes.html",
        linkText: "Check routes"
    },


    {
        id: "resource-update",
        title: "New student resources added",
        type: "Notice",

        publishedAt: "2026-08-07T14:20:00",

        body:
            "New notes, templates and useful student resources have " +
            "been added to the Resources section.",

        pinned: false,

        link: "resources.html",
        linkText: "Browse resources"
    }

];


/*
=========================================================
DO NOT EDIT BELOW THIS LINE
=========================================================

Makes the data available to the announcement scripts.
=========================================================
*/

window.PANIMALAR_ANNOUNCEMENTS = announcements;