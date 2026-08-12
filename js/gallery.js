"use strict";

/*
=========================================================
PANIMALAR MEDIA
PUBLIC GALLERY — SUPABASE
=========================================================

Table:
    gallery

Fields:
    id
    title
    description
    image_url
    category
    event_name
    event_date
    featured
    published
    created_at
    updated_at

Only published gallery items are shown.
=========================================================
*/


(function () {

    /* =====================================================
       CONFIG
    ===================================================== */

    const SUPABASE_URL =
        "https://ucqjfyvjkqgrzoasndwx.supabase.co";

    const SUPABASE_PUBLISHABLE_KEY =
        "sb_publishable_g4q4QjvZ99YC8nAViwGCvg_y8qI1Glm";

    const TABLE_NAME = "gallery";


    /* =====================================================
       STATE
    ===================================================== */

    let gallery = [];

    let activeEvent = "All";
    let activeCategory = "All";

    let visibleItems = [];

    let currentIndex = 0;


    /* =====================================================
       DOM
    ===================================================== */

    const galleryGrid =
        document.getElementById("galleryGrid");

    const galleryEmpty =
        document.getElementById("galleryEmpty");

    const galleryMeta =
        document.getElementById("galleryMeta");

    const eventTabs =
        document.getElementById("galleryEvents") ||
        document.getElementById("galleryEventTabs");

    const categoryTabs =
        document.getElementById("galleryCategories") ||
        document.getElementById("galleryCategoryTabs");


    /* =====================================================
       SUPABASE CLIENT
    ===================================================== */

    let client = null;


    function getSupabaseClient() {

        /*
         * First use the project's existing client.
         */

        if (
            typeof window.supabaseClient !==
            "undefined" &&
            window.supabaseClient
        ) {
            return window.supabaseClient;
        }


        /*
         * Some versions of supabase.js define
         * supabaseClient as a global lexical variable
         * instead of window.supabaseClient.
         */

        try {

            if (
                typeof supabaseClient !==
                "undefined" &&
                supabaseClient
            ) {
                return supabaseClient;
            }

        } catch (error) {
            /*
             * Ignore and continue.
             */
        }


        /*
         * Final fallback:
         * create the client directly.
         *
         * This prevents the public gallery from
         * breaking because of global-variable timing.
         */

        if (
            window.supabase &&
            typeof window.supabase.createClient ===
            "function"
        ) {

            try {

                return window.supabase.createClient(
                    SUPABASE_URL,
                    SUPABASE_PUBLISHABLE_KEY
                );

            } catch (error) {

                console.error(
                    "[Gallery] Could not create Supabase client:",
                    error
                );
            }
        }


        return null;
    }


    /* =====================================================
       WAIT FOR SUPABASE
    ===================================================== */

    function waitForSupabase(
        timeout = 5000
    ) {

        return new Promise(
            function (resolve) {

                const start =
                    Date.now();


                function check() {

                    const found =
                        getSupabaseClient();


                    if (found) {

                        resolve(found);

                        return;
                    }


                    if (
                        Date.now() - start >=
                        timeout
                    ) {

                        resolve(null);

                        return;
                    }


                    setTimeout(
                        check,
                        100
                    );
                }


                check();
            }
        );
    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHTML(value) {

        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }


        return String(value)
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );
    }


    /* =====================================================
       SAFE IMAGE URL
    ===================================================== */

    function safeImageURL(url) {

        if (!url) {
            return "";
        }


        const value =
            String(url).trim();


        if (
            value.startsWith("https://") ||
            value.startsWith("http://") ||
            value.startsWith("./") ||
            value.startsWith("../") ||
            value.startsWith("/") ||
            value.startsWith("assets/")
        ) {
            return value;
        }


        return "";
    }


    /* =====================================================
       FORMAT DATE
    ===================================================== */

    function formatDate(value) {

        if (!value) {
            return "";
        }


        const date =
            new Date(
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


    /* =====================================================
       SHOW LOADING
    ===================================================== */

    function showLoading() {

        if (!galleryGrid) {
            return;
        }


        galleryGrid.innerHTML = `
            <div class="gallery-loading">
                Loading gallery...
            </div>
        `;


        if (galleryEmpty) {
            galleryEmpty.hidden = true;
        }
    }


    /* =====================================================
       SHOW EMPTY
    ===================================================== */

    function showEmpty() {

        if (galleryGrid) {
            galleryGrid.innerHTML = "";
        }


        if (galleryEmpty) {

            galleryEmpty.hidden = false;

            return;
        }


        if (galleryGrid) {

            galleryGrid.innerHTML = `
                <div class="gallery-empty">
                    <div class="big">—</div>

                    <h3>
                        No photos yet
                    </h3>

                    <p>
                        Photos from events will appear here soon.
                    </p>
                </div>
            `;
        }
    }


    /* =====================================================
       SHOW ERROR
    ===================================================== */

    function showError(message) {

        console.error(
            "[Gallery]",
            message
        );


        if (galleryEmpty) {

            galleryEmpty.hidden = true;
        }


        if (galleryGrid) {

            galleryGrid.innerHTML = `
                <div class="gallery-empty">
                    <div class="big">!</div>

                    <h3>
                        Gallery unavailable
                    </h3>

                    <p>
                        ${escapeHTML(message)}
                    </p>
                </div>
            `;
        }
    }


    /* =====================================================
       LOAD GALLERY FROM SUPABASE
    ===================================================== */

    async function loadGallery() {

        showLoading();


        client =
            await waitForSupabase();


        if (!client) {

            showError(
                "Supabase client could not be initialized."
            );

            return;
        }


        console.log(
            "[Gallery] Supabase connected."
        );


        try {

            const {
                data,
                error
            } = await client
                .from(TABLE_NAME)
                .select(
                    `
                    id,
                    title,
                    description,
                    image_url,
                    category,
                    event_name,
                    event_date,
                    featured,
                    published,
                    created_at,
                    updated_at
                    `
                )
                .eq(
                    "published",
                    true
                )
                .order(
                    "event_date",
                    {
                        ascending: false,
                        nullsFirst: false
                    }
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


            if (error) {

                console.error(
                    "[Gallery] Supabase query error:",
                    error
                );

                showError(
                    error.message ||
                    "Unable to load gallery."
                );

                return;
            }


            gallery =
                data || [];


            console.log(
                "[Gallery] Loaded:",
                gallery.length,
                "items"
            );


            buildEventTabs();

            buildCategoryTabs();

            renderGallery();

        } catch (error) {

            console.error(
                "[Gallery] Unexpected error:",
                error
            );

            showError(
                error.message ||
                "Unable to load gallery."
            );
        }
    }


    /* =====================================================
       BUILD EVENT TABS
    ===================================================== */

    function buildEventTabs() {

        if (!eventTabs) {
            return;
        }


        const events = [];


        gallery.forEach(
            function (item) {

                const eventName =
                    item.event_name;


                if (!eventName) {
                    return;
                }


                if (
                    !events.includes(
                        eventName
                    )
                ) {

                    events.push(
                        eventName
                    );
                }
            }
        );


        events.sort(
            function (a, b) {

                return a.localeCompare(
                    b
                );
            }
        );


        eventTabs.innerHTML = "";


        addEventTab(
            "All",
            "All Events",
            activeEvent === "All"
        );


        events.forEach(
            function (eventName) {

                addEventTab(
                    eventName,
                    eventName,
                    activeEvent === eventName
                );
            }
        );
    }


    /* =====================================================
       ADD EVENT TAB
    ===================================================== */

    function addEventTab(
        value,
        label,
        active
    ) {

        if (!eventTabs) {
            return;
        }


        const button =
            document.createElement(
                "button"
            );


        button.type =
            "button";


        button.className =
            "subchip";


        if (active) {

            button.classList.add(
                "active"
            );
        }


        button.textContent =
            label;


        button.addEventListener(
            "click",
            function () {

                activeEvent =
                    value;


                /*
                 * Reset category when
                 * event changes.
                 */

                activeCategory =
                    "All";


                buildEventTabs();

                buildCategoryTabs();

                renderGallery();
            }
        );


        eventTabs.appendChild(
            button
        );
    }


    /* =====================================================
       BUILD CATEGORY TABS
    ===================================================== */

    function buildCategoryTabs() {

        if (!categoryTabs) {
            return;
        }


        const categories = [];


        gallery.forEach(
            function (item) {

                if (!item.category) {
                    return;
                }


                if (
                    !categories.includes(
                        item.category
                    )
                ) {

                    categories.push(
                        item.category
                    );
                }
            }
        );


        categories.sort(
            function (a, b) {

                return a.localeCompare(
                    b
                );
            }
        );


        categoryTabs.innerHTML = "";


        addCategoryTab(
            "All",
            "All",
            activeCategory === "All"
        );


        categories.forEach(
            function (category) {

                addCategoryTab(
                    category,
                    category,
                    activeCategory === category
                );
            }
        );
    }


    /* =====================================================
       ADD CATEGORY TAB
    ===================================================== */

    function addCategoryTab(
        value,
        label,
        active
    ) {

        if (!categoryTabs) {
            return;
        }


        const button =
            document.createElement(
                "button"
            );


        button.type =
            "button";


        button.className =
            "subchip";


        if (active) {

            button.classList.add(
                "active"
            );
        }


        button.textContent =
            label;


        button.addEventListener(
            "click",
            function () {

                activeCategory =
                    value;


                buildCategoryTabs();

                renderGallery();
            }
        );


        categoryTabs.appendChild(
            button
        );
    }


    /* =====================================================
       FILTER
    ===================================================== */

    function getVisibleItems() {

        return gallery.filter(
            function (item) {

                if (
                    activeEvent !==
                    "All"
                ) {

                    if (
                        item.event_name !==
                        activeEvent
                    ) {
                        return false;
                    }
                }


                if (
                    activeCategory !==
                    "All"
                ) {

                    if (
                        item.category !==
                        activeCategory
                    ) {
                        return false;
                    }
                }


                return true;
            }
        );
    }


    /* =====================================================
       RENDER GALLERY
    ===================================================== */

    function renderGallery() {

        if (!galleryGrid) {
            return;
        }


        visibleItems =
            getVisibleItems();


        if (galleryMeta) {

            const count =
                visibleItems.length;


            galleryMeta.textContent =
                `${count} ${
                    count === 1
                        ? "photo"
                        : "photos"
                }`;
        }


        if (
            !visibleItems.length
        ) {

            showEmpty();

            return;
        }


        if (galleryEmpty) {
            galleryEmpty.hidden = true;
        }


        galleryGrid.innerHTML =
            "";


        visibleItems.forEach(
            function (
                item,
                index
            ) {

                const imageURL =
                    safeImageURL(
                        item.image_url
                    );


                if (!imageURL) {
                    return;
                }


                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "gallery-card";


                card.innerHTML = `
                    <div class="gallery-card-image">

                        <img
                            src="${escapeHTML(imageURL)}"
                            alt="${escapeHTML(
                                item.title ||
                                "Gallery image"
                            )}"
                            loading="lazy"
                        >

                    </div>

                    <div class="gallery-card-content">

                        ${
                            item.category
                                ? `
                                    <span class="gallery-card-category">
                                        ${escapeHTML(
                                            item.category
                                        )}
                                    </span>
                                `
                                : ""
                        }

                        <h3>
                            ${escapeHTML(
                                item.title ||
                                "Untitled"
                            )}
                        </h3>

                        ${
                            item.description
                                ? `
                                    <p>
                                        ${escapeHTML(
                                            item.description
                                        )}
                                    </p>
                                `
                                : ""
                        }

                        ${
                            item.event_name
                                ? `
                                    <div class="gallery-card-event">
                                        ${escapeHTML(
                                            item.event_name
                                        )}
                                    </div>
                                `
                                : ""
                        }

                        ${
                            item.event_date
                                ? `
                                    <div class="gallery-card-date">
                                        ${escapeHTML(
                                            formatDate(
                                                item.event_date
                                            )
                                        )}
                                    </div>
                                `
                                : ""
                        }

                    </div>
                `;


                card.addEventListener(
                    "click",
                    function () {

                        openLightbox(
                            index
                        );
                    }
                );


                galleryGrid.appendChild(
                    card
                );
            }
        );
    }


    /* =====================================================
       LIGHTBOX
    ===================================================== */

    let lightbox =
        document.getElementById(
            "galleryLightbox"
        );


    let lightboxImage =
        document.getElementById(
            "lightboxImage"
        );


    let lightboxClose =
        document.getElementById(
            "lightboxClose"
        );


    let lightboxPrev =
        document.getElementById(
            "lightboxPrev"
        );


    let lightboxNext =
        document.getElementById(
            "lightboxNext"
        );


    let lightboxCaption =
        document.getElementById(
            "lightboxCaption"
        );


    /*
     * If your HTML doesn't contain
     * a lightbox, create one.
     */

    function ensureLightbox() {

        if (lightbox) {
            return;
        }


        lightbox =
            document.createElement(
                "div"
            );


        lightbox.id =
            "galleryLightbox";


        lightbox.className =
            "lightbox";


        lightbox.hidden =
            true;


        lightbox.innerHTML = `
            <button
                type="button"
                class="lightbox-close"
                id="lightboxClose"
                aria-label="Close"
            >
                ×
            </button>

            <button
                type="button"
                class="lightbox-prev"
                id="lightboxPrev"
                aria-label="Previous"
            >
                ←
            </button>

            <div class="lightbox-content">

                <img
                    id="lightboxImage"
                    src=""
                    alt=""
                >

                <div
                    id="lightboxCaption"
                    class="lightbox-caption"
                ></div>

            </div>

            <button
                type="button"
                class="lightbox-next"
                id="lightboxNext"
                aria-label="Next"
            >
                →
            </button>
        `;


        document.body.appendChild(
            lightbox
        );


        lightboxImage =
            document.getElementById(
                "lightboxImage"
            );


        lightboxClose =
            document.getElementById(
                "lightboxClose"
            );


        lightboxPrev =
            document.getElementById(
                "lightboxPrev"
            );


        lightboxNext =
            document.getElementById(
                "lightboxNext"
            );


        lightboxCaption =
            document.getElementById(
                "lightboxCaption"
            );


        setupLightboxEvents();
    }


    /* =====================================================
       SETUP LIGHTBOX EVENTS
    ===================================================== */

    function setupLightboxEvents() {

        if (!lightbox) {
            return;
        }


        if (lightboxClose) {

            lightboxClose.addEventListener(
                "click",
                closeLightbox
            );
        }


        if (lightboxPrev) {

            lightboxPrev.addEventListener(
                "click",
                previousImage
            );
        }


        if (lightboxNext) {

            lightboxNext.addEventListener(
                "click",
                nextImage
            );
        }


        lightbox.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    lightbox
                ) {

                    closeLightbox();
                }
            }
        );
    }


    /* =====================================================
       OPEN LIGHTBOX
    ===================================================== */

    function openLightbox(
        index
    ) {

        ensureLightbox();


        currentIndex =
            index;


        updateLightbox();


        lightbox.hidden =
            false;


        document.body.classList.add(
            "lightbox-open"
        );
    }


    /* =====================================================
       UPDATE LIGHTBOX
    ===================================================== */

    function updateLightbox() {

        const item =
            visibleItems[
                currentIndex
            ];


        if (!item) {
            return;
        }


        const imageURL =
            safeImageURL(
                item.image_url
            );


        if (lightboxImage) {

            lightboxImage.src =
                imageURL;


            lightboxImage.alt =
                item.title ||
                "Gallery image";
        }


        if (lightboxCaption) {

            lightboxCaption.innerHTML = `
                <strong>
                    ${escapeHTML(
                        item.title ||
                        ""
                    )}
                </strong>

                ${
                    item.description
                        ? `
                            <p>
                                ${escapeHTML(
                                    item.description
                                )}
                            </p>
                        `
                        : ""
                }
            `;
        }


        if (lightboxPrev) {

            lightboxPrev.style.display =
                visibleItems.length > 1
                    ? ""
                    : "none";
        }


        if (lightboxNext) {

            lightboxNext.style.display =
                visibleItems.length > 1
                    ? ""
                    : "none";
        }
    }


    /* =====================================================
       CLOSE LIGHTBOX
    ===================================================== */

    function closeLightbox() {

        if (!lightbox) {
            return;
        }


        lightbox.hidden =
            true;


        document.body.classList.remove(
            "lightbox-open"
        );
    }


    /* =====================================================
       PREVIOUS
    ===================================================== */

    function previousImage() {

        if (
            visibleItems.length <=
            1
        ) {
            return;
        }


        currentIndex--;


        if (
            currentIndex < 0
        ) {

            currentIndex =
                visibleItems.length - 1;
        }


        updateLightbox();
    }


    /* =====================================================
       NEXT
    ===================================================== */

    function nextImage() {

        if (
            visibleItems.length <=
            1
        ) {
            return;
        }


        currentIndex++;


        if (
            currentIndex >=
            visibleItems.length
        ) {

            currentIndex = 0;
        }


        updateLightbox();
    }


    /* =====================================================
       KEYBOARD
    ===================================================== */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                !lightbox ||
                lightbox.hidden
            ) {
                return;
            }


            if (
                event.key ===
                "Escape"
            ) {

                closeLightbox();

            } else if (
                event.key ===
                "ArrowLeft"
            ) {

                previousImage();

            } else if (
                event.key ===
                "ArrowRight"
            ) {

                nextImage();
            }
        }
    );


    /* =====================================================
       INITIALIZE
    ===================================================== */

    async function init() {

        console.log(
            "[Gallery] Initializing..."
        );


        /*
         * Wait until the DOM and Supabase
         * are available.
         */

        client =
            await waitForSupabase();


        if (!client) {

            showError(
                "Supabase client not found. Check that the Supabase CDN is loaded."
            );

            return;
        }


        console.log(
            "[Gallery] Supabase client ready."
        );


        ensureLightbox();


        await loadGallery();
    }


    /* =====================================================
       START
    ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            init
        );

    } else {

        init();
    }


    /* =====================================================
       GLOBAL DEBUG
    ===================================================== */

    window.PublicGallery = {

        reload:
            loadGallery,

        getItems:
            function () {
                return gallery;
            }
    };


})();