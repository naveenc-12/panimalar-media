/*
=========================================================
PANIMALAR MEDIA
GALLERY DATA
=========================================================

Add, edit, or remove gallery photos here.

Each photo contains:

- id
- eventId
- eventName
- category
- title
- image
- alt

eventId should match the corresponding event ID
from:

    data/events.js

Example:

    eventId: "pace-2k26"

Categories can be anything you want, for example:

    "Stage"
    "Audience"
    "Behind the Scenes"
    "Competition"
    "Campus"
    "Team"

No backend is required.
=========================================================
*/

"use strict";


const gallery = [

    /* =====================================================
       PACE 2K26
    ====================================================== */

    {
        id: "pace-2k26-01",

        eventId: "pace-2k26",

        eventName: "PACE 2K26",

        category: "Stage",

        title: "PACE 2K26 Stage",

        image: "assets/images/gallery/pace-2k26-01.jpg",

        alt: "PACE 2K26 stage and event setup"
    },


    {
        id: "pace-2k26-02",

        eventId: "pace-2k26",

        eventName: "PACE 2K26",

        category: "Audience",

        title: "Students at PACE 2K26",

        image: "assets/images/gallery/pace-2k26-02.jpg",

        alt: "Students attending PACE 2K26"
    },


    {
        id: "pace-2k26-03",

        eventId: "pace-2k26",

        eventName: "PACE 2K26",

        category: "Performance",

        title: "Live Performance",

        image: "assets/images/gallery/pace-2k26-03.jpg",

        alt: "Live performance during PACE 2K26"
    },


    {
        id: "pace-2k26-04",

        eventId: "pace-2k26",

        eventName: "PACE 2K26",

        category: "Behind the Scenes",

        title: "Behind the Scenes",

        image: "assets/images/gallery/pace-2k26-04.jpg",

        alt: "Behind the scenes at PACE 2K26"
    },


    /* =====================================================
       PHOTOGRAPHY WORKSHOP
    ====================================================== */

    {
        id: "photography-workshop-01",

        eventId: "photography-workshop",

        eventName: "Photography Workshop",

        category: "Workshop",

        title: "Photography Workshop",

        image: "assets/images/gallery/photography-workshop-01.jpg",

        alt: "Students attending the photography workshop"
    },


    {
        id: "photography-workshop-02",

        eventId: "photography-workshop",

        eventName: "Photography Workshop",

        category: "Behind the Scenes",

        title: "Photography Practice",

        image: "assets/images/gallery/photography-workshop-02.jpg",

        alt: "Students practicing photography"
    },


    /* =====================================================
       WEB DEVELOPMENT WORKSHOP
    ====================================================== */

    {
        id: "web-development-01",

        eventId: "web-development-workshop",

        eventName: "Web Development Workshop",

        category: "Workshop",

        title: "Web Development Workshop",

        image: "assets/images/gallery/web-development-01.jpg",

        alt: "Students attending a web development workshop"
    },


    {
        id: "web-development-02",

        eventId: "web-development-workshop",

        eventName: "Web Development Workshop",

        category: "Campus",

        title: "Workshop Session",

        image: "assets/images/gallery/web-development-02.jpg",

        alt: "Web development workshop session"
    },


    /* =====================================================
       DESIGN CHALLENGE
    ====================================================== */

    {
        id: "design-challenge-01",

        eventId: "design-challenge",

        eventName: "Design Challenge",

        category: "Competition",

        title: "Design Challenge",

        image: "assets/images/gallery/design-challenge-01.jpg",

        alt: "Students participating in the design challenge"
    },


    {
        id: "design-challenge-02",

        eventId: "design-challenge",

        eventName: "Design Challenge",

        category: "Competition",

        title: "Creative Work",

        image: "assets/images/gallery/design-challenge-02.jpg",

        alt: "Creative work from the design challenge"
    },


    /* =====================================================
       MEDIA TEAM
    ====================================================== */

    {
        id: "media-team-01",

        eventId: "media-team-recruitment",

        eventName: "Media Team Recruitment",

        category: "Team",

        title: "Media Team",

        image: "assets/images/gallery/media-team-01.jpg",

        alt: "Panimalar Media team members"
    },


    {
        id: "media-team-02",

        eventId: "media-team-recruitment",

        eventName: "Media Team Recruitment",

        category: "Behind the Scenes",

        title: "Media Team at Work",

        image: "assets/images/gallery/media-team-02.jpg",

        alt: "Panimalar Media team working on an event"
    },


    /* =====================================================
       FRESHERS ORIENTATION
    ====================================================== */

    {
        id: "freshers-01",

        eventId: "freshers-orientation-2026",

        eventName: "Freshers Orientation",

        category: "Campus",

        title: "Freshers Orientation",

        image: "assets/images/gallery/freshers-orientation-01.jpg",

        alt: "Students attending freshers orientation"
    },


    {
        id: "freshers-02",

        eventId: "freshers-orientation-2026",

        eventName: "Freshers Orientation",

        category: "Audience",

        title: "Students at the Auditorium",

        image: "assets/images/gallery/freshers-orientation-02.jpg",

        alt: "Students during freshers orientation"
    }

];


/*
=========================================================
DO NOT EDIT BELOW THIS LINE
=========================================================

Makes gallery data available to gallery.js.
=========================================================
*/

window.PANIMALAR_GALLERY = gallery;