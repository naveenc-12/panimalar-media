/*
=========================================================
PANIMALAR MEDIA
EVENTS DATA
=========================================================

Add, edit, or remove events here.

Each event contains:

- id
- title
- category
- date
- deadline
- venue
- description
- image
- registerLink
- registerText

IMPORTANT:
Use ISO date format:

    YYYY-MM-DD

Example:

    date: "2026-09-03"

The website will automatically calculate:

    10 days left
    3 days left
    Tomorrow
    Today
    Event ended

The registration deadline is separate from the event date.

No backend is required.
=========================================================
*/

"use strict";


const events = [

    {
        id: "pace-2k26",

        title: "PACE 2K26",

        category: "Cultural",

        date: "2026-09-03",

        deadline: "2026-09-01",

        venue: "Panimalar Engineering College",

        description:
            "The annual cultural celebration featuring " +
            "music, dance, competitions and performances " +
            "by students.",

        image: "assets/images/events/pace-2k26.jpg",

        registerLink: "#",

        registerText: "Register now"
    },


    {
        id: "photography-workshop",

        title: "Photography Workshop",

        category: "Workshop",

        date: "2026-08-22",

        deadline: "2026-08-20",

        venue: "Media Lab",

        description:
            "A practical photography workshop covering " +
            "composition, lighting, framing and visual storytelling.",

        image: "assets/images/events/photography-workshop.jpg",

        registerLink: "#",

        registerText: "Register now"
    },


    {
        id: "web-development-workshop",

        title: "Web Development Workshop",

        category: "Tech",

        date: "2026-08-28",

        deadline: "2026-08-26",

        venue: "Computer Lab",

        description:
            "Learn the fundamentals of modern web development " +
            "and build a responsive website from scratch.",

        image: "assets/images/events/web-development.jpg",

        registerLink: "#",

        registerText: "Register now"
    },


    {
        id: "design-challenge",

        title: "Design Challenge",

        category: "Competition",

        date: "2026-09-10",

        deadline: "2026-09-08",

        venue: "Design Studio",

        description:
            "A creative design competition where students " +
            "solve a visual problem under a fixed time limit.",

        image: "assets/images/events/design-challenge.jpg",

        registerLink: "#",

        registerText: "Register now"
    },


    {
        id: "media-team-recruitment",

        title: "Media Team Recruitment",

        category: "Competition",

        date: "2026-08-25",

        deadline: "2026-08-23",

        venue: "Media Room",

        description:
            "Applications are open for students interested in " +
            "graphic design, video editing, photography and content.",

        image: "assets/images/events/media-recruitment.jpg",

        registerLink: "#",

        registerText: "Apply now"
    },


    {
        id: "career-session",

        title: "Career &amp; Placement Session",

        category: "Workshop",

        date: "2026-09-15",

        deadline: "2026-09-13",

        venue: "Seminar Hall",

        description:
            "An interactive session covering career preparation, " +
            "skills, portfolios, interviews and placement readiness.",

        image: "assets/images/events/career-session.jpg",

        registerLink: "#",

        registerText: "Register now"
    },


    /*
    =========================================================
    PAST EVENT EXAMPLE

    This event is intentionally included so the Past tab
    can be tested.

    Remove it later if you don't need it.
    =========================================================
    */

    {
        id: "freshers-orientation-2026",

        title: "Freshers Orientation",

        category: "Cultural",

        date: "2026-07-15",

        deadline: "2026-07-13",

        venue: "Main Auditorium",

        description:
            "An orientation programme introducing new students " +
            "to campus life, clubs, activities and student services.",

        image: "assets/images/events/freshers-orientation.jpg",

        registerLink: "#",

        registerText: "View event"
    }

];


/*
=========================================================
DO NOT EDIT BELOW THIS LINE
=========================================================

Makes the event data available to the website scripts.
=========================================================
*/

window.PANIMALAR_EVENTS = events;