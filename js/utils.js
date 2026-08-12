/*
=========================================================
PANIMALAR MEDIA
SHARED JAVASCRIPT UTILITIES
=========================================================

This file contains reusable functions used across
the website.

Handles:

- HTML escaping
- URL validation
- Date parsing
- Date formatting
- Days remaining
- Relative time
- Text normalization
- Debounce
- Throttle
- Element helpers
- Local storage helpers

No backend required.

Load this BEFORE page-specific JS files.
=========================================================
*/

"use strict";


(function () {

    /* =====================================================
       HTML
    ====================================================== */

    function escapeHTML(value) {

        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }


        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /* =====================================================
       TEXT
    ====================================================== */

    function normalizeText(value) {

        return String(value || "")
            .toLowerCase()
            .trim()
            .replace(/\s+/g, " ");
    }


    function capitalize(value) {

        const text =
            String(value || "").trim();


        if (!text) {
            return "";
        }


        return (
            text.charAt(0).toUpperCase() +
            text.slice(1)
        );
    }


    /* =====================================================
       URL
    ====================================================== */

    function isSafeURL(value) {

        if (!value) {
            return false;
        }


        const url =
            String(value).trim();


        if (url === "#") {
            return true;
        }


        return (
            url.startsWith("./") ||
            url.startsWith("../") ||
            url.startsWith("/") ||
            url.startsWith("assets/") ||
            url.startsWith("http://") ||
            url.startsWith("https://") ||
            url.startsWith("mailto:")
        );
    }


    function safeURL(value, fallback = "#") {

        return isSafeURL(value)
            ? String(value).trim()
            : fallback;
    }


    function isExternalURL(value) {

        if (!value) {
            return false;
        }


        const url =
            String(value).trim();


        return (
            url.startsWith("http://") ||
            url.startsWith("https://")
        );
    }


    /* =====================================================
       DATE PARSING
    ====================================================== */

    function parseDate(value) {

        if (!value) {
            return null;
        }


        /*
        Handle YYYY-MM-DD manually so the date
        is interpreted as local midnight rather
        than UTC midnight.
        */

        if (
            typeof value === "string" &&
            /^\d{4}-\d{2}-\d{2}$/.test(value)
        ) {

            const parts =
                value.split("-").map(Number);


            const date =
                new Date(
                    parts[0],
                    parts[1] - 1,
                    parts[2]
                );


            return Number.isNaN(
                date.getTime()
            )
                ? null
                : date;
        }


        const date =
            new Date(value);


        return Number.isNaN(
            date.getTime()
        )
            ? null
            : date;
    }


    /* =====================================================
       DATE NORMALIZATION
    ====================================================== */

    function startOfDay(value) {

        const date =
            value instanceof Date
                ? new Date(value)
                : parseDate(value);


        if (!date) {
            return null;
        }


        date.setHours(
            0,
            0,
            0,
            0
        );


        return date;
    }


    function endOfDay(value) {

        const date =
            value instanceof Date
                ? new Date(value)
                : parseDate(value);


        if (!date) {
            return null;
        }


        date.setHours(
            23,
            59,
            59,
            999
        );


        return date;
    }


    /* =====================================================
       TODAY
    ====================================================== */

    function today() {

        return startOfDay(
            new Date()
        );
    }


    /* =====================================================
       DAY DIFFERENCE
    ====================================================== */

    function daysBetween(
        from,
        to
    ) {

        const start =
            startOfDay(from);


        const end =
            startOfDay(to);


        if (
            !start ||
            !end
        ) {
            return null;
        }


        const difference =
            end.getTime() -
            start.getTime();


        return Math.round(
            difference /
            (1000 * 60 * 60 * 24)
        );
    }


    function daysUntil(date) {

        const target =
            startOfDay(date);


        if (!target) {
            return null;
        }


        return daysBetween(
            today(),
            target
        );
    }


    /* =====================================================
       EVENT COUNTDOWN
    ====================================================== */

    function getDaysLeft(date) {

        const days =
            daysUntil(date);


        if (days === null) {
            return {
                days: null,
                text: "Date unavailable",
                status: "unknown"
            };
        }


        if (days < 0) {

            return {
                days,
                text: "Event ended",
                status: "past"
            };

        }


        if (days === 0) {

            return {
                days: 0,
                text: "Today",
                status: "today"
            };

        }


        if (days === 1) {

            return {
                days: 1,
                text: "Tomorrow",
                status: "tomorrow"
            };

        }


        return {
            days,
            text: `${days} days left`,
            status: "upcoming"
        };
    }


    /* =====================================================
       DATE FORMAT
    ====================================================== */

    function formatDate(
        value,
        options = {}
    ) {

        const date =
            parseDate(value);


        if (!date) {
            return "Date unavailable";
        }


        const defaultOptions = {

            day: "numeric",

            month: "short",

            year: "numeric"

        };


        return date.toLocaleDateString(
            options.locale || "en-IN",
            {
                ...defaultOptions,
                ...options
            }
        );
    }


    function formatLongDate(value) {

        return formatDate(
            value,
            {
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );
    }


    function formatTime(value) {

        const date =
            parseDate(value);


        if (!date) {
            return "Time unavailable";
        }


        return date.toLocaleTimeString(
            "en-IN",
            {
                hour: "numeric",
                minute: "2-digit"
            }
        );
    }


    /* =====================================================
       RELATIVE TIME
    ====================================================== */

    function relativeTime(value) {

        const date =
            parseDate(value);


        if (!date) {
            return "Recently";
        }


        const now =
            new Date();


        const difference =
            now.getTime() -
            date.getTime();


        const seconds =
            Math.floor(
                difference / 1000
            );


        /*
        Future
        */

        if (seconds < 0) {

            const futureSeconds =
                Math.abs(seconds);


            if (futureSeconds < 60) {
                return "In a moment";
            }


            const futureMinutes =
                Math.floor(
                    futureSeconds / 60
                );


            if (futureMinutes < 60) {
                return `In ${futureMinutes} min`;
            }


            const futureHours =
                Math.floor(
                    futureMinutes / 60
                );


            if (futureHours < 24) {
                return `In ${futureHours} hr`;
            }


            const futureDays =
                Math.floor(
                    futureHours / 24
                );


            return (
                `In ${futureDays} ` +
                `day${futureDays === 1 ? "" : "s"}`
            );
        }


        /*
        Past
        */

        if (seconds < 60) {
            return "Just now";
        }


        const minutes =
            Math.floor(
                seconds / 60
            );


        if (minutes < 60) {

            return (
                `${minutes} min ago`
            );

        }


        const hours =
            Math.floor(
                minutes / 60
            );


        if (hours < 24) {

            return (
                `${hours} hr` +
                `${hours === 1 ? "" : "s"} ago`
            );

        }


        const days =
            Math.floor(
                hours / 24
            );


        if (days === 1) {
            return "Yesterday";
        }


        if (days < 7) {

            return (
                `${days} days ago`
            );

        }


        const weeks =
            Math.floor(
                days / 7
            );


        if (weeks < 5) {

            return (
                `${weeks} week` +
                `${weeks === 1 ? "" : "s"} ago`
            );

        }


        return formatDate(date);
    }


    /* =====================================================
       DATE STATUS
    ====================================================== */

    function isToday(value) {

        const target =
            startOfDay(value);


        const current =
            today();


        if (
            !target ||
            !current
        ) {
            return false;
        }


        return (
            target.getTime() ===
            current.getTime()
        );
    }


    function isTomorrow(value) {

        const days =
            daysUntil(value);


        return days === 1;
    }


    function isPast(value) {

        const days =
            daysUntil(value);


        return (
            days !== null &&
            days < 0
        );
    }


    function isUpcoming(value) {

        const days =
            daysUntil(value);


        return (
            days !== null &&
            days >= 0
        );
    }


    /* =====================================================
       ARRAY HELPERS
    ====================================================== */

    function unique(
        array,
        key = null
    ) {

        if (!Array.isArray(array)) {
            return [];
        }


        const seen =
            new Set();


        return array.filter(
            function (item) {

                const value =
                    key
                        ? item?.[key]
                        : item;


                if (seen.has(value)) {
                    return false;
                }


                seen.add(value);

                return true;
            }
        );
    }


    function sortByDate(
        array,
        property,
        ascending = true
    ) {

        if (!Array.isArray(array)) {
            return [];
        }


        return [...array].sort(
            function (a, b) {

                const dateA =
                    parseDate(
                        a?.[property]
                    );


                const dateB =
                    parseDate(
                        b?.[property]
                    );


                const timeA =
                    dateA
                        ? dateA.getTime()
                        : 0;


                const timeB =
                    dateB
                        ? dateB.getTime()
                        : 0;


                return ascending
                    ? timeA - timeB
                    : timeB - timeA;
            }
        );
    }


    /* =====================================================
       DOM HELPERS
    ====================================================== */

    function $(selector, parent = document) {

        return parent.querySelector(
            selector
        );
    }


    function $$(selector, parent = document) {

        return Array.from(
            parent.querySelectorAll(
                selector
            )
        );
    }


    function showElement(element) {

        if (!element) {
            return;
        }


        element.hidden = false;

        element.removeAttribute(
            "aria-hidden"
        );
    }


    function hideElement(element) {

        if (!element) {
            return;
        }


        element.hidden = true;

        element.setAttribute(
            "aria-hidden",
            "true"
        );
    }


    /* =====================================================
       DEBOUNCE
    ====================================================== */

    function debounce(
        callback,
        delay = 300
    ) {

        let timeout;


        return function (...args) {

            clearTimeout(timeout);


            timeout =
                setTimeout(
                    function () {

                        callback.apply(
                            this,
                            args
                        );

                    },
                    delay
                );
        };
    }


    /* =====================================================
       THROTTLE
    ====================================================== */

    function throttle(
        callback,
        delay = 100
    ) {

        let waiting = false;


        return function (...args) {

            if (waiting) {
                return;
            }


            callback.apply(
                this,
                args
            );


            waiting = true;


            setTimeout(
                function () {

                    waiting = false;

                },
                delay
            );
        };
    }


    /* =====================================================
       LOCAL STORAGE
    ====================================================== */

    function storageGet(
        key,
        fallback = null
    ) {

        try {

            const value =
                localStorage.getItem(
                    key
                );


            if (value === null) {
                return fallback;
            }


            return JSON.parse(
                value
            );

        } catch (error) {

            console.warn(
                "Storage read failed:",
                error
            );


            return fallback;
        }
    }


    function storageSet(
        key,
        value
    ) {

        try {

            localStorage.setItem(
                key,
                JSON.stringify(value)
            );


            return true;

        } catch (error) {

            console.warn(
                "Storage write failed:",
                error
            );


            return false;
        }
    }


    function storageRemove(key) {

        try {

            localStorage.removeItem(
                key
            );


            return true;

        } catch (error) {

            console.warn(
                "Storage removal failed:",
                error
            );


            return false;
        }
    }


    /* =====================================================
       EXPOSE GLOBAL UTILITIES
    ====================================================== */

    window.PANIMALAR_UTILS = {

        /* HTML */

        escapeHTML,


        /* Text */

        normalizeText,

        capitalize,


        /* URLs */

        isSafeURL,

        safeURL,

        isExternalURL,


        /* Dates */

        parseDate,

        startOfDay,

        endOfDay,

        today,

        daysBetween,

        daysUntil,


        /* Countdown */

        getDaysLeft,


        /* Formatting */

        formatDate,

        formatLongDate,

        formatTime,

        relativeTime,


        /* Status */

        isToday,

        isTomorrow,

        isPast,

        isUpcoming,


        /* Arrays */

        unique,

        sortByDate,


        /* DOM */

        $,

        $$,

        showElement,

        hideElement,


        /* Performance */

        debounce,

        throttle,


        /* Storage */

        storageGet,

        storageSet,

        storageRemove

    };

})();