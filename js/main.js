/*
=========================================================
PANIMALAR MEDIA
GLOBAL JAVASCRIPT
=========================================================

This file is shared across all pages.

Handles:

- Mobile navigation
- Active navigation state
- Mobile menu accessibility
- Automatic copyright year
- External link handling
- Global escape-key behavior
- Basic page initialization

Page-specific functionality stays in:

    js/events.js
    js/gallery.js
    js/bus.js
    js/announcements.js
    js/resources.js
    js/ask-seniors.js

No backend required.
=========================================================
*/

"use strict";


(function () {

    /* =====================================================
       DOM ELEMENTS
    ====================================================== */

    const menuToggle =
        document.getElementById("menuToggle");

    /*
    IMPORTANT:
    HTML uses id="mobileNav"
    NOT id="mobilenav"
    */
    const mobileNav =
        document.getElementById("mobileNav");


    /* =====================================================
       MOBILE NAVIGATION
    ====================================================== */

    function openMobileMenu() {

        if (!mobileNav) {
            return;
        }

        mobileNav.classList.add("open");

        if (menuToggle) {

            menuToggle.setAttribute(
                "aria-expanded",
                "true"
            );

            menuToggle.setAttribute(
                "aria-label",
                "Close navigation menu"
            );
        }
    }


    function closeMobileMenu() {

        if (!mobileNav) {
            return;
        }

        mobileNav.classList.remove("open");

        if (menuToggle) {

            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );

            menuToggle.setAttribute(
                "aria-label",
                "Open navigation menu"
            );
        }
    }


    function toggleMobileMenu() {

        if (!mobileNav) {
            return;
        }

        const isOpen =
            mobileNav.classList.contains("open");

        if (isOpen) {

            closeMobileMenu();

        } else {

            openMobileMenu();

        }
    }


    /* =====================================================
       MOBILE MENU SETUP
    ====================================================== */

    function setupMobileMenu() {

        if (
            !menuToggle ||
            !mobileNav
        ) {
            return;
        }


        /*
        Prevent duplicate click handlers if this
        function is ever called again.
        */

        menuToggle.addEventListener(
            "click",
            function (event) {

                event.preventDefault();
                event.stopPropagation();

                toggleMobileMenu();

            }
        );


        /*
        Close the menu when a navigation
        link is clicked.
        */

        const links =
            mobileNav.querySelectorAll("a");


        links.forEach(
            function (link) {

                link.addEventListener(
                    "click",
                    closeMobileMenu
                );

            }
        );


        /*
        Close the menu if the user clicks
        outside the navigation.
        */

        document.addEventListener(
            "click",
            function (event) {

                if (
                    !mobileNav.classList.contains("open")
                ) {
                    return;
                }


                const clickedInsideMenu =
                    mobileNav.contains(
                        event.target
                    );


                const clickedToggle =
                    menuToggle.contains(
                        event.target
                    );


                if (
                    !clickedInsideMenu &&
                    !clickedToggle
                ) {

                    closeMobileMenu();

                }

            }
        );


        /*
        Close menu when resizing back
        to desktop.

        CSS switches to desktop at 1080px.
        */

        window.addEventListener(
            "resize",
            function () {

                if (
                    window.innerWidth >= 1080
                ) {

                    closeMobileMenu();

                }

            }
        );

    }


    /* =====================================================
       ACTIVE NAVIGATION
    ====================================================== */

    function setupActiveNavigation() {

        const currentPage =
            window.location.pathname
                .split("/")
                .pop()
                .toLowerCase();


        /*
        If the page is opened as:

            /index.html

        or simply:

            /

        treat it as index.html.
        */

        const normalizedPage =
            currentPage === ""
                ? "index.html"
                : currentPage;


        const allNavigationLinks =
            document.querySelectorAll(
                ".mainnav a, .mobilenav a"
            );


        allNavigationLinks.forEach(
            function (link) {

                const href =
                    link.getAttribute("href");


                if (!href) {
                    return;
                }


                /*
                Ignore anchors and external URLs.
                */

                if (
                    href.startsWith("#") ||
                    href.startsWith("http://") ||
                    href.startsWith("https://") ||
                    href.startsWith("mailto:")
                ) {
                    return;
                }


                const linkPage =
                    href
                        .split("/")
                        .pop()
                        .split("#")[0]
                        .split("?")[0]
                        .toLowerCase();


                const isActive =
                    linkPage === normalizedPage;


                link.classList.toggle(
                    "active",
                    isActive
                );

            }
        );

    }


    /* =====================================================
       FOOTER YEAR
    ====================================================== */

    function setupCopyrightYear() {

        const yearElements =
            document.querySelectorAll(
                "[data-current-year]"
            );


        const currentYear =
            new Date().getFullYear();


        yearElements.forEach(
            function (element) {

                element.textContent =
                    currentYear;

            }
        );


        /*
        Also support the existing footer text.

        Example:

            © 2026 PANIMALAR MEDIA

        If the footer contains a year element,
        it will be updated automatically.
        */

        const footer =
            document.querySelector("footer");


        if (!footer) {
            return;
        }


        const footerSpans =
            footer.querySelectorAll(
                ".foot-bottom span"
            );


        footerSpans.forEach(
            function (span) {

                const text =
                    span.textContent.trim();


                if (
                    /^©\s*\d{4}/.test(text)
                ) {

                    span.textContent =
                        text.replace(
                            /^©\s*\d{4}/,
                            `© ${currentYear}`
                        );

                }

            }
        );

    }


    /* =====================================================
       EXTERNAL LINKS
    ====================================================== */

    function setupExternalLinks() {

        const links =
            document.querySelectorAll(
                'a[href^="http://"], a[href^="https://"]'
            );


        links.forEach(
            function (link) {

                /*
                External links should open in a
                new tab unless explicitly configured otherwise.
                */

                if (
                    !link.hasAttribute("target")
                ) {

                    link.setAttribute(
                        "target",
                        "_blank"
                    );

                }


                /*
                Security for new-tab links.
                */

                const rel =
                    link.getAttribute("rel") || "";


                const relValues =
                    new Set(
                        rel
                            .split(/\s+/)
                            .filter(Boolean)
                    );


                relValues.add("noopener");
                relValues.add("noreferrer");


                link.setAttribute(
                    "rel",
                    Array.from(relValues).join(" ")
                );

            }
        );

    }


    /* =====================================================
       ESCAPE KEY
    ====================================================== */

    function setupEscapeKey() {

        document.addEventListener(
            "keydown",
            function (event) {

                if (event.key !== "Escape") {
                    return;
                }


                /*
                Close mobile menu.
                */

                closeMobileMenu();


                /*
                Close generic modal/lightbox if
                the page has one.
                */

                const openLightbox =
                    document.querySelector(
                        ".lightbox:not([hidden])"
                    );


                if (openLightbox) {

                    openLightbox.hidden =
                        true;

                    document.body.style.overflow =
                        "";

                }

            }
        );

    }


    /* =====================================================
       SMOOTH INTERNAL LINKS
    ====================================================== */

    function setupSmoothAnchors() {

        const links =
            document.querySelectorAll(
                'a[href^="#"]'
            );


        links.forEach(
            function (link) {

                link.addEventListener(
                    "click",
                    function (event) {

                        const href =
                            link.getAttribute("href");


                        if (
                            !href ||
                            href === "#"
                        ) {
                            return;
                        }


                        const target =
                            document.querySelector(
                                href
                            );


                        if (!target) {
                            return;
                        }


                        event.preventDefault();


                        target.scrollIntoView({
                            behavior: "smooth",
                            block: "start"
                        });

                    }
                );

            }
        );

    }


    /* =====================================================
       IMAGE ERROR HANDLING
    ====================================================== */

    function setupImageFallbacks() {

        const images =
            document.querySelectorAll("img");


        images.forEach(
            function (image) {

                image.addEventListener(
                    "error",
                    function () {

                        /*
                        Prevent broken image icons
                        from dominating the design.

                        Only hide images that fail to load.
                        */

                        image.classList.add(
                            "image-error"
                        );


                        /*
                        If the image belongs to a gallery
                        item, show a simple placeholder.
                        */

                        const galleryItem =
                            image.closest(".gitem");


                        if (galleryItem) {

                            galleryItem.classList.add(
                                "image-missing"
                            );

                        }

                    }
                );

            }
        );

    }


    /* =====================================================
       CURRENT YEAR HELPER
    ====================================================== */

    window.PANIMALAR_UTILS =
        window.PANIMALAR_UTILS || {};


    window.PANIMALAR_UTILS.getCurrentYear =
        function () {

            return new Date().getFullYear();

        };


    /* =====================================================
       INITIALIZE
    ====================================================== */

    function init() {

        setupMobileMenu();

        setupActiveNavigation();

        setupCopyrightYear();

        setupExternalLinks();

        setupEscapeKey();

        setupSmoothAnchors();

        setupImageFallbacks();

    }


    /* =====================================================
       START
    ====================================================== */

    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            init
        );

    } else {

        init();

    }

})();