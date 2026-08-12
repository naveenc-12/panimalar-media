"use strict";

/*
=========================================================
PANIMALAR MEDIA
PUBLIC RESOURCES
=========================================================

Data source:
    Supabase -> public.resources

Features:
    - Loads published resources from Supabase
    - Search
    - Category filters
    - Featured resources
    - Resource cards
    - Empty state
    - Safe HTML rendering
=========================================================
*/

(function () {

    /* =====================================================
       DOM ELEMENTS
    ===================================================== */

    const container =
        document.getElementById("resourcesContainer") ||
        document.querySelector(".resource-grid");

    const emptyState =
        document.getElementById("resourcesEmpty");

    const searchInput =
        document.getElementById("resourceSearch");

    const categoryContainer =
        document.getElementById("resourceFilters") ||
        document.getElementById("resourceCategories");


    /* =====================================================
       STATE
    ===================================================== */

    let resources = [];

    let activeCategory = "All";

    let searchQuery = "";


    /* =====================================================
       SUPABASE
    ===================================================== */

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

        return null;
    }


    /* =====================================================
       WAIT FOR SUPABASE
    ===================================================== */

    function waitForSupabase(timeout = 5000) {

        return new Promise(function (resolve) {

            const start = Date.now();

            function check() {

                const client =
                    getSupabaseClient();

                if (client) {

                    resolve(client);

                    return;
                }


                if (
                    Date.now() - start >= timeout
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
        });
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
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /* =====================================================
       SAFE URL
    ===================================================== */

    function safeURL(url) {

        if (!url) {
            return "#";
        }

        const value =
            String(url).trim();


        if (
            value === "#" ||
            value.startsWith("./") ||
            value.startsWith("../") ||
            value.startsWith("/") ||
            value.startsWith("assets/")
        ) {
            return value;
        }


        if (
            value.startsWith("https://") ||
            value.startsWith("http://")
        ) {
            return value;
        }


        return "#";
    }


    /* =====================================================
       NORMALIZE
    ===================================================== */

    function normalize(value) {

        return String(value || "")
            .toLowerCase()
            .trim();
    }


    /* =====================================================
       RESOURCE ICON
    ===================================================== */

    function getResourceIcon(type) {

        const value =
            normalize(type);


        switch (value) {

            case "document":
                return "📄";

            case "template":
                return "📋";

            case "guide":
                return "📖";

            case "tool":
                return "🛠️";

            case "video":
                return "🎬";

            case "link":
                return "🔗";

            default:
                return "📚";
        }
    }


    /* =====================================================
       BADGE CLASS
    ===================================================== */

    function getBadgeClass(type) {

        const value =
            normalize(type);

        if (
            value === "template"
        ) {
            return "template";
        }

        if (
            value === "guide"
        ) {
            return "guide";
        }

        if (
            value === "tool"
        ) {
            return "tool";
        }

        if (
            value === "video"
        ) {
            return "video";
        }

        if (
            value === "link"
        ) {
            return "link";
        }

        return "document";
    }


    /* =====================================================
       GET CATEGORIES
    ===================================================== */

    function getCategories() {

        const categories = [];

        resources.forEach(
            function (resource) {

                const category =
                    String(
                        resource.category || ""
                    ).trim();

                if (
                    category &&
                    !categories.includes(category)
                ) {
                    categories.push(category);
                }
            }
        );


        return categories.sort(
            function (a, b) {

                return a.localeCompare(b);
            }
        );
    }


    /* =====================================================
       CREATE CATEGORY FILTERS
    ===================================================== */

    function createCategoryFilters() {

        if (!categoryContainer) {
            return;
        }


        const categories =
            getCategories();


        categoryContainer.innerHTML = "";


        /* ALL */

        const allButton =
            document.createElement("button");

        allButton.type = "button";

        allButton.className =
            "chip active";

        allButton.dataset.resourceCategory =
            "All";

        allButton.textContent =
            "All";

        categoryContainer.appendChild(
            allButton
        );


        /* CATEGORIES */

        categories.forEach(
            function (category) {

                const button =
                    document.createElement("button");

                button.type = "button";

                button.className =
                    "chip";

                button.dataset.resourceCategory =
                    category;

                button.textContent =
                    category;

                categoryContainer.appendChild(
                    button
                );
            }
        );


        categoryContainer
            .querySelectorAll(
                "[data-resource-category]"
            )
            .forEach(
                function (button) {

                    button.addEventListener(
                        "click",
                        function () {

                            activeCategory =
                                button.dataset.resourceCategory;

                            categoryContainer
                                .querySelectorAll(
                                    "[data-resource-category]"
                                )
                                .forEach(
                                    function (item) {

                                        item.classList.remove(
                                            "active"
                                        );
                                    }
                                );

                            button.classList.add(
                                "active"
                            );

                            renderResources();
                        }
                    );
                }
            );
    }


    /* =====================================================
       FILTER RESOURCES
    ===================================================== */

    function getFilteredResources() {

        const query =
            normalize(searchQuery);


        return resources.filter(
            function (resource) {

                const category =
                    String(
                        resource.category || ""
                    ).trim();


                /* CATEGORY */

                if (
                    activeCategory !== "All" &&
                    normalize(category) !==
                        normalize(activeCategory)
                ) {
                    return false;
                }


                /* SEARCH */

                if (!query) {
                    return true;
                }


                const searchableText = [

                    resource.title,

                    resource.description,

                    resource.category,

                    resource.resource_type

                ]
                    .map(normalize)
                    .join(" ");


                return searchableText.includes(
                    query
                );
            }
        );
    }


    /* =====================================================
       CREATE RESOURCE CARD
    ===================================================== */

    function createResourceCard(resource) {

        const title =
            escapeHTML(
                resource.title || "Untitled Resource"
            );


        const description =
            escapeHTML(
                resource.description || ""
            );


        const category =
            escapeHTML(
                resource.category || "General"
            );


        const resourceType =
            escapeHTML(
                resource.resource_type || "Document"
            );


        const link =
            safeURL(
                resource.resource_url
            );


        const icon =
            getResourceIcon(
                resource.resource_type
            );


        const badgeClass =
            getBadgeClass(
                resource.resource_type
            );


        const isExternal =
            link.startsWith("http://") ||
            link.startsWith("https://");


        const thumbnail =
            safeURL(
                resource.thumbnail_url
            );


        const hasThumbnail =
            thumbnail !== "#";


        return `
            <article
                class="card res-card"
                data-resource-id="${escapeHTML(resource.id || "")}"
            >

                ${
                    hasThumbnail
                        ? `
                            <div class="res-thumbnail">
                                <img
                                    src="${escapeHTML(thumbnail)}"
                                    alt=""
                                    loading="lazy"
                                >
                            </div>
                          `
                        : ""
                }

                <div class="res-top">

                    <div
                        class="res-icon ${badgeClass}"
                    >
                        ${icon}
                    </div>

                    <span
                        class="badge ${badgeClass}"
                    >
                        ${category}
                    </span>

                    ${
                        resource.featured === true
                            ? `
                                <span class="badge featured">
                                    Featured
                                </span>
                              `
                            : ""
                    }

                </div>


                <h4>
                    ${title}
                </h4>


                ${
                    description
                        ? `
                            <p>
                                ${description}
                            </p>
                          `
                        : ""
                }


                <a
                    href="${escapeHTML(link)}"
                    class="btn btn-ghost btn-sm"
                    ${
                        isExternal
                            ? 'target="_blank" rel="noopener noreferrer"'
                            : ""
                    }
                >
                    Open Resource ↗
                </a>

            </article>
        `;
    }


    /* =====================================================
       RENDER
    ===================================================== */

    function renderResources() {

        if (!container) {
            return;
        }


        const filtered =
            getFilteredResources();


        /* EMPTY */

        if (
            filtered.length === 0
        ) {

            container.innerHTML = "";


            if (emptyState) {

                emptyState.hidden =
                    false;
            }


            return;
        }


        /* HIDE EMPTY */

        if (emptyState) {

            emptyState.hidden =
                true;
        }


        /* RENDER */

        container.innerHTML =
            filtered
                .map(
                    createResourceCard
                )
                .join("");
    }


    /* =====================================================
       SEARCH
    ===================================================== */

    function setupSearch() {

        if (!searchInput) {
            return;
        }


        searchInput.addEventListener(
            "input",
            function () {

                searchQuery =
                    searchInput.value;

                renderResources();
            }
        );
    }


    /* =====================================================
       ESCAPE SEARCH
    ===================================================== */

    function setupSearchEscape() {

        if (!searchInput) {
            return;
        }


        searchInput.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Escape"
                ) {

                    searchInput.value =
                        "";

                    searchQuery =
                        "";

                    renderResources();

                    searchInput.blur();
                }
            }
        );
    }


    /* =====================================================
       LOADING
    ===================================================== */

    function showLoading() {

        if (!container) {
            return;
        }


        container.innerHTML = `
            <div class="empty">

                <div class="big">
                    …
                </div>

                <h3>
                    Loading resources
                </h3>

                <p>
                    Please wait...
                </p>

            </div>
        `;
    }


    /* =====================================================
       ERROR
    ===================================================== */

    function showError(error) {

        console.error(
            "Public resources error:",
            error
        );


        if (!container) {
            return;
        }


        const message =
            error?.message ||
            "Unable to load resources.";


        container.innerHTML = `
            <div class="empty">

                <div class="big">
                    !
                </div>

                <h3>
                    Unable to load resources
                </h3>

                <p>
                    ${escapeHTML(message)}
                </p>

            </div>
        `;


        if (emptyState) {
            emptyState.hidden = true;
        }
    }


    /* =====================================================
       LOAD FROM SUPABASE
    ===================================================== */

    async function loadResources() {

        showLoading();


        const client =
            await waitForSupabase();


        if (!client) {

            showError(
                new Error(
                    "Supabase client is not available. Check js/supabase.js."
                )
            );

            return;
        }


        try {

            const result =
                await client
                    .from("resources")
                    .select(
                        [
                            "id",
                            "title",
                            "description",
                            "category",
                            "resource_type",
                            "resource_url",
                            "thumbnail_url",
                            "featured",
                            "published",
                            "created_at"
                        ].join(",")
                    )
                    .eq(
                        "published",
                        true
                    )
                    .order(
                        "featured",
                        {
                            ascending: false
                        }
                    )
                    .order(
                        "created_at",
                        {
                            ascending: false
                        });


            if (result.error) {
                throw result.error;
            }


            resources =
                Array.isArray(result.data)
                    ? result.data
                    : [];


            createCategoryFilters();

            renderResources();

        }
        catch (error) {

            showError(error);
        }
    }


    /* =====================================================
       INITIALIZE
    ===================================================== */

    async function init() {

        setupSearch();

        setupSearchEscape();

        await loadResources();
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

})();