/*
=========================================================
PANIMALAR MEDIA
RESOURCES DATA
=========================================================

Add, edit, or remove resources here.

Each resource contains:

- id
- title
- category
- description
- icon
- link
- linkText

The website automatically uses this data to:

- Create resource cards
- Build category filters
- Search resources
- Display the correct resource link

Suggested categories:

    Notes
    Templates
    Tutorials
    Forms
    Tools
    Career
    Academic
    Other

No backend is required.
=========================================================
*/

"use strict";


const resources = [

    /* =====================================================
       NOTES
    ====================================================== */

    {
        id: "semester-notes",

        title: "Semester Notes",

        category: "Notes",

        description:
            "Subject-wise notes and study material collected " +
            "for students across different semesters.",

        icon: "📚",

        link: "#",

        linkText: "Open notes"
    },


    {
        id: "previous-question-papers",

        title: "Previous Question Papers",

        category: "Notes",

        description:
            "Previous university and internal examination papers " +
            "to help you understand question patterns and prepare.",

        icon: "📝",

        link: "#",

        linkText: "View papers"
    },


    /* =====================================================
       TEMPLATES
    ====================================================== */

    {
        id: "resume-template",

        title: "Resume Templates",

        category: "Templates",

        description:
            "Clean and professional resume templates suitable " +
            "for internships, placements and student applications.",

        icon: "📄",

        link: "#",

        linkText: "View templates"
    },


    {
        id: "presentation-template",

        title: "Presentation Templates",

        category: "Templates",

        description:
            "Ready-to-edit presentation templates for seminars, " +
            "projects, reviews and academic presentations.",

        icon: "📊",

        link: "#",

        linkText: "View templates"
    },


    /* =====================================================
       TUTORIALS
    ====================================================== */

    {
        id: "graphic-design-basics",

        title: "Graphic Design Basics",

        category: "Tutorials",

        description:
            "Learn the fundamentals of layout, typography, colour, " +
            "visual hierarchy and composition.",

        icon: "🎨",

        link: "#",

        linkText: "Start learning"
    },


    {
        id: "video-editing-basics",

        title: "Video Editing Basics",

        category: "Tutorials",

        description:
            "Beginner-friendly resources covering editing, cuts, " +
            "transitions, audio and basic storytelling.",

        icon: "🎬",

        link: "#",

        linkText: "Start learning"
    },


    /* =====================================================
       FORMS
    ====================================================== */

    {
        id: "internship-form",

        title: "Internship Application",

        category: "Forms",

        description:
            "Use this form to submit your details for internship " +
            "opportunities and student projects.",

        icon: "📋",

        link: "#",

        linkText: "Open form"
    },


    {
        id: "event-submission-form",

        title: "Event Submission",

        category: "Forms",

        description:
            "Submit details about an upcoming college event that " +
            "should be featured on the student hub.",

        icon: "📣",

        link: "#",

        linkText: "Submit event"
    },


    /* =====================================================
       TOOLS
    ====================================================== */

    {
        id: "canva",

        title: "Canva",

        category: "Tools",

        description:
            "Create presentations, posters, social media designs " +
            "and other visual content quickly.",

        icon: "✨",

        link: "https://www.canva.com/",

        linkText: "Open Canva"
    },


    {
        id: "github",

        title: "GitHub",

        category: "Tools",

        description:
            "Store, manage and collaborate on your software projects " +
            "using Git and GitHub.",

        icon: "💻",

        link: "https://github.com/",

        linkText: "Open GitHub"
    },


    /* =====================================================
       CAREER
    ====================================================== */

    {
        id: "placement-preparation",

        title: "Placement Preparation",

        category: "Career",

        description:
            "Useful resources for aptitude tests, technical " +
            "interviews, HR rounds and placement preparation.",

        icon: "🎯",

        link: "#",

        linkText: "Start preparing"
    },


    {
        id: "portfolio-guide",

        title: "Student Portfolio Guide",

        category: "Career",

        description:
            "Learn what to include in a strong student portfolio " +
            "and how to present your projects effectively.",

        icon: "🚀",

        link: "#",

        linkText: "Read guide"
    }

];


/*
=========================================================
DO NOT EDIT BELOW THIS LINE
=========================================================

Makes resource data available to resources.js.
=========================================================
*/

window.PANIMALAR_RESOURCES = resources;