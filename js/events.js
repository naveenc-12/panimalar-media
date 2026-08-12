"use strict";

/* =========================================================
   PANIMALAR MEDIA — PUBLIC EVENTS
   ========================================================= */

/*
    IMPORTANT:
    This file is for the PUBLIC events page only.

    It uses the shared Supabase client from:

        js/supabase.js

    Do NOT create another Supabase client here.
*/


/* =========================================================
   STATE
========================================================= */

let allEvents = [];

let currentTab = "upcoming";

let currentCategory = "All";


/* =========================================================
   DOM HELPER
========================================================= */

function $(id) {
    return document.getElementById(id);
}


/* =========================================================
   SUPABASE CHECK
========================================================= */

function getSupabaseClient() {

    if (
        typeof window.supabaseClient !== "undefined" &&
        window.supabaseClient
    ) {
        return window.supabaseClient;
    }

    if (
        typeof supabaseClient !== "undefined" &&
        supabaseClient
    ) {
        return supabaseClient;
    }

    console.error(
        "[Public Events] Supabase client is not available."
    );

    return null;
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   DATE FORMAT
========================================================= */

function formatDate(value) {

    if (!value) {
        return "";
    }

    const date = new Date(
        `${value}T00:00:00`
    );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return value;
    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
}


/* =========================================================
   TIME FORMAT
========================================================= */

function formatTime(value) {

    if (!value) {
        return "";
    }

    const parts =
        String(value).split(":");

    if (parts.length < 2) {
        return value;
    }

    const hour =
        Number(parts[0]);

    const minute =
        parts[1];

    if (Number.isNaN(hour)) {
        return value;
    }

    const suffix =
        hour >= 12
            ? "PM"
            : "AM";

    const displayHour =
        hour % 12 || 12;

    return `${displayHour}:${minute} ${suffix}`;
}


/* =========================================================
   LOADING STATE
========================================================= */

function showLoading() {

    const container =
        $("eventsContainer");

    const empty =
        $("eventsEmpty");

    if (!container) {
        return;
    }

    if (empty) {
        empty.hidden = true;
    }

    container.innerHTML = `
        <div
            class="events-loading"
            style="
                grid-column: 1 / -1;
                padding: 60px 20px;
                text-align: center;
                color: var(--text-dim);
            "
        >
            Loading events...
        </div>
    `;
}


/* =========================================================
   ERROR STATE
========================================================= */

function showError(message) {

    const container =
        $("eventsContainer");

    const empty =
        $("eventsEmpty");

    if (!container) {
        return;
    }

    if (empty) {
        empty.hidden = true;
    }

    container.innerHTML = `
        <div
            class="events-error"
            style="
                grid-column: 1 / -1;
                padding: 60px 20px;
                text-align: center;
                color: var(--text-dim);
            "
        >

            <div
                style="
                    font-size: 18px;
                    font-weight: 700;
                    margin-bottom: 10px;
                "
            >
                Unable to load events
            </div>

            <div
                style="
                    margin-bottom: 20px;
                "
            >
                ${escapeHTML(message)}
            </div>

            <button
                type="button"
                class="btn"
                id="retryEventsButton"
            >
                Try Again
            </button>

        </div>
    `;

    const retry =
        $("retryEventsButton");

    if (retry) {

        retry.addEventListener(
            "click",
            loadEvents
        );

    }
}


/* =========================================================
   LOAD EVENTS
========================================================= */

async function loadEvents() {

    const container =
        $("eventsContainer");

    if (!container) {

        console.error(
            "[Public Events] #eventsContainer not found."
        );

        return;
    }


    const client =
        getSupabaseClient();


    if (!client) {

        showError(
            "Supabase client is not available. Check js/supabase.js."
        );

        return;
    }


    showLoading();


    console.log(
        "[Public Events] Loading events..."
    );


    try {

        const {
            data,
            error
        } = await client
            .from("events")
            .select("*")
            .eq(
                "published",
                true
            )
            .order(
                "event_date",
                {
                    ascending: true
                }
            )
            .order(
                "start_time",
                {
                    ascending: true
                }
            );


        console.log(
            "[Public Events] Supabase response:",
            {
                data,
                error
            }
        );


        if (error) {
            throw error;
        }


        allEvents =
            Array.isArray(data)
                ? data
                : [];


        renderEvents();


    } catch (error) {

        console.error(
            "[Public Events] Failed to load events:",
            error
        );


        showError(
            error?.message ||
            "Failed to load events."
        );

    }

}


/* =========================================================
   GET FILTERED EVENTS
========================================================= */

function getFilteredEvents() {

    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );


    return allEvents.filter(
        event => {

            if (!event.event_date) {
                return false;
            }


            const eventDate =
                new Date(
                    `${event.event_date}T00:00:00`
                );


            if (
                Number.isNaN(
                    eventDate.getTime()
                )
            ) {
                return false;
            }


            /* ---------------------------------------------
               UPCOMING / PAST
            --------------------------------------------- */

            if (
                currentTab === "upcoming" &&
                eventDate < today
            ) {
                return false;
            }


            if (
                currentTab === "past" &&
                eventDate >= today
            ) {
                return false;
            }


            /* ---------------------------------------------
               CATEGORY
            --------------------------------------------- */

            if (
                currentCategory !== "All"
            ) {

                const category =
                    String(
                        event.category || ""
                    ).trim().toLowerCase();


                if (
                    category !==
                    currentCategory
                        .trim()
                        .toLowerCase()
                ) {

                    return false;
                }

            }


            return true;

        }
    );

}


/* =========================================================
   CREATE EVENT CARD
========================================================= */

function createEventCard(event) {

    const title =
        escapeHTML(
            event.title || "Untitled Event"
        );

    const description =
        escapeHTML(
            event.description || ""
        );

    const category =
        escapeHTML(
            event.category || "General"
        );

    const location =
        escapeHTML(
            event.location || "Location not specified"
        );

    const date =
        formatDate(event.event_date);

    const startTime =
        formatTime(event.start_time);

    const endTime =
        formatTime(event.end_time);

    const imageUrl =
        event.image_url
            ? escapeHTML(event.image_url)
            : "";

    const registrationUrl =
        event.registration_url
            ? escapeHTML(event.registration_url)
            : "";


    /* -----------------------------------------
       DATE BADGE
    ----------------------------------------- */

    let dateNumber = "";
    let dateMonth = "";

    if (event.event_date) {

        const dateObject =
            new Date(
                `${event.event_date}T00:00:00`
            );

        if (!Number.isNaN(dateObject.getTime())) {

            dateNumber =
                dateObject.getDate();

            dateMonth =
                dateObject.toLocaleDateString(
                    "en-IN",
                    {
                        month: "short"
                    }
                );

        }
    }


    /* -----------------------------------------
       TIME
    ----------------------------------------- */

    let time = "";

    if (startTime) {

        time = startTime;

        if (endTime) {
            time += ` – ${endTime}`;
        }
    }


    /* -----------------------------------------
       MEDIA
    ----------------------------------------- */

    let mediaHTML = "";

    if (imageUrl) {

        mediaHTML = `
            <div
                class="evt-media"
                style="
                    background:none;
                "
            >

                <img
                    src="${imageUrl}"
                    alt="${title}"
                    loading="lazy"
                    style="
                        width:100%;
                        height:100%;
                        object-fit:cover;
                    "
                >

                <div class="evt-datebadge">

                    ${
                        dateNumber
                            ? `
                                <div class="d">
                                    ${dateNumber}
                                </div>
                            `
                            : ""
                    }

                    ${
                        dateMonth
                            ? `
                                <div class="m">
                                    ${escapeHTML(dateMonth)}
                                </div>
                            `
                            : ""
                    }

                </div>

            </div>
        `;

    } else {

        mediaHTML = `
            <div class="evt-media">

                <div class="evt-datebadge">

                    ${
                        dateNumber
                            ? `
                                <div class="d">
                                    ${dateNumber}
                                </div>
                            `
                            : ""
                    }

                    ${
                        dateMonth
                            ? `
                                <div class="m">
                                    ${escapeHTML(dateMonth)}
                                </div>
                            `
                            : ""
                    }

                </div>

            </div>
        `;
    }


    /* -----------------------------------------
       CARD
    ----------------------------------------- */

    return `
        <article class="card evt-card">

            ${mediaHTML}

            <div class="evt-body">

                <div
                    class="chiprow"
                    style="
                        margin-bottom:2px;
                    "
                >

                    <span class="badge badge-violet">
                        ${category}
                    </span>

                    ${
                        event.featured
                            ? `
                                <span class="badge badge-pink">
                                    Featured
                                </span>
                            `
                            : ""
                    }

                </div>


                <h3>
                    ${title}
                </h3>


                ${
                    description
                        ? `
                            <p
                                class="muted"
                                style="
                                    font-size:13px;
                                "
                            >
                                ${description}
                            </p>
                        `
                        : ""
                }


                <div class="evt-meta">

                    ${
                        date
                            ? `
                                <div>
                                    📅 ${date}
                                </div>
                            `
                            : ""
                    }


                    ${
                        time
                            ? `
                                <div>
                                    ⏰ ${time}
                                </div>
                            `
                            : ""
                    }


                    ${
                        location
                            ? `
                                <div>
                                    📍 ${location}
                                </div>
                            `
                            : ""
                    }

                </div>


                <div class="evt-foot">

                    ${
                        event.featured
                            ? `
                                <span class="deadline">
                                    Featured Event
                                </span>
                            `
                            : `
                                <span class="deadline">
                                    ${category}
                                </span>
                            `
                    }


                    ${
                        registrationUrl
                            ? `
                                <a
                                    href="${registrationUrl}"
                                    class="btn btn-sm btn-grad"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Register
                                </a>
                            `
                            : ""
                    }

                </div>

            </div>

        </article>
    `;
}

/* =========================================================
   RENDER EVENTS
========================================================= */

function renderEvents() {

    const container =
        $("eventsContainer");

    const empty =
        $("eventsEmpty");


    if (!container) {
        return;
    }


    const filteredEvents =
        getFilteredEvents();


    /* ---------------------------------------------
       NO RESULTS
    --------------------------------------------- */

    if (!filteredEvents.length) {

        container.innerHTML = "";


        if (empty) {

            empty.hidden = false;

        }

        return;
    }


    /* ---------------------------------------------
       RESULTS
    --------------------------------------------- */

    if (empty) {
        empty.hidden = true;
    }


    container.innerHTML =
        filteredEvents
            .map(
                event =>
                    createEventCard(
                        event
                    )
            )
            .join("");

}


/* =========================================================
   TAB BUTTONS
========================================================= */

function setupEventTabs() {

    const tabs =
        document.querySelectorAll(
            "[data-event-tab]"
        );


    tabs.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    tabs.forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );


                    button.classList.add(
                        "active"
                    );


                    currentTab =
                        button.dataset.eventTab ||
                        "upcoming";


                    renderEvents();

                }
            );

        }
    );

}


/* =========================================================
   CATEGORY FILTERS
========================================================= */

function setupEventFilters() {

    const filters =
        document.querySelectorAll(
            "[data-event-filter]"
        );


    filters.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    filters.forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );


                    button.classList.add(
                        "active"
                    );


                    currentCategory =
                        button.dataset.eventFilter ||
                        "All";


                    renderEvents();

                }
            );

        }
    );

}


/* =========================================================
   INITIALIZE
========================================================= */

async function initializeEvents() {

    console.log(
        "[Public Events] Initializing..."
    );


    setupEventTabs();

    setupEventFilters();


    await loadEvents();

}


/* =========================================================
   DOM READY
========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeEvents
    );

} else {

    initializeEvents();

}


/* =========================================================
   GLOBAL
========================================================= */

window.loadEvents =
    loadEvents;