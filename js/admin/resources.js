"use strict";

/* =========================================================
   PANIMALAR MEDIA
   ADMIN — RESOURCES
   ========================================================= */

(function () {

    /* =====================================================
       SUPABASE
    ====================================================== */

    const SUPABASE_URL =
        "https://ucqjfyvjkqgrzoasndwx.supabase.co";

    const SUPABASE_PUBLISHABLE_KEY =
        "sb_publishable_g4q4QjvZ99YC8nAViwGCvg_y8qI1Glm";

    const TABLE_NAME = "resources";

    let client = null;


    /* =====================================================
       STATE
    ====================================================== */

    let resources = [];
    let activeCategory = "All";
    let searchQuery = "";
    let editingId = null;


    /* =====================================================
       DOM
    ====================================================== */

    const form =
        document.getElementById("resourceForm");

    const resourceIdInput =
        document.getElementById("resourceId");

    const titleInput =
        document.getElementById("resourceTitle");

    const descriptionInput =
        document.getElementById("resourceDescription");

    const categoryInput =
        document.getElementById("resourceCategory");

    const typeInput =
        document.getElementById("resourceType");

    const urlInput =
        document.getElementById("resourceLink");

    const thumbnailInput =
        document.getElementById("resourceThumbnail");

    const featuredInput =
        document.getElementById("resourceFeatured");

    const publishedInput =
        document.getElementById("resourcePublished");

    const saveButton =
        document.getElementById("saveResourceBtn");

    const cancelButton =
        document.getElementById("cancelEditBtn");

    const formTitle =
        document.getElementById("resourceFormTitle");

    const list =
        document.getElementById("resourcesList");

    const searchInput =
        document.getElementById("resourceSearch");

    const filters =
        document.getElementById("resourceFilters");

    const message =
        document.getElementById("resourceMessage");

    const totalResources =
        document.getElementById("totalResources");

    const publishedResources =
        document.getElementById("publishedResources");

    const hiddenResources =
        document.getElementById("hiddenResources");

    const categoriesCount =
        document.getElementById("resourceCategoriesCount");


    /* =====================================================
       GET SUPABASE CLIENT
    ====================================================== */

    function getSupabaseClient() {

        /* ---------------------------------------------
           First use the shared client if it exists
        --------------------------------------------- */

        if (
            window.supabaseClient &&
            typeof window.supabaseClient.from === "function"
        ) {
            return window.supabaseClient;
        }


        /* ---------------------------------------------
           Otherwise create our own client
        --------------------------------------------- */

        if (
            window.supabase &&
            typeof window.supabase.createClient === "function"
        ) {

            try {

                client =
                    window.supabase.createClient(
                        SUPABASE_URL,
                        SUPABASE_PUBLISHABLE_KEY
                    );

                return client;

            } catch (error) {

                console.error(
                    "Failed to create Supabase client:",
                    error
                );

                return null;
            }
        }


        return null;
    }


    /* =====================================================
       ESCAPE HTML
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
       NORMALIZE
    ====================================================== */

    function normalize(value) {

        return String(value || "")
            .toLowerCase()
            .trim();
    }


    /* =====================================================
       MESSAGE
    ====================================================== */

    function showMessage(
        text,
        type = "success"
    ) {

        if (!message) {
            return;
        }

        message.hidden = false;

        message.textContent = text;

        message.className =
            "admin-message admin-message-" +
            type;

        setTimeout(function () {

            if (message) {
                message.hidden = true;
            }

        }, 4000);
    }


    /* =====================================================
       LOADING
    ====================================================== */

    function showLoading() {

        if (!list) {
            return;
        }

        list.innerHTML = `
            <div class="admin-loading">
                Loading resources...
            </div>
        `;
    }


    /* =====================================================
       ERROR
    ====================================================== */

    function showError(error) {

        console.error(
            "Resources error:",
            error
        );

        if (!list) {
            return;
        }

        const errorText =
            error?.message ||
            "Unable to load resources.";

        list.innerHTML = `
            <div class="admin-error">

                <div class="admin-error-icon">
                    !
                </div>

                <h3>
                    Failed to load resources
                </h3>

                <p>
                    ${escapeHTML(errorText)}
                </p>

                <button
                    type="button"
                    class="admin-btn admin-btn-secondary"
                    id="retryResourcesBtn"
                >
                    Try Again
                </button>

            </div>
        `;

        const retryButton =
            document.getElementById(
                "retryResourcesBtn"
            );

        if (retryButton) {

            retryButton.addEventListener(
                "click",
                loadResources
            );
        }
    }


    /* =====================================================
       LOAD RESOURCES
    ====================================================== */

    async function loadResources() {

        showLoading();

        client = getSupabaseClient();

        if (!client) {

            showError({
                message:
                    "Supabase client could not be created. Check that the Supabase CDN is loaded before resources.js."
            });

            return;
        }

        try {

            const result =
                await client
                    .from(TABLE_NAME)
                    .select(`
                        id,
                        title,
                        description,
                        category,
                        resource_type,
                        resource_url,
                        thumbnail_url,
                        featured,
                        published,
                        created_by,
                        created_at,
                        updated_at
                    `)
                    .order(
                        "created_at",
                        {
                            ascending: false
                        }
                    );


            if (result.error) {
                throw result.error;
            }


            resources =
                Array.isArray(result.data)
                    ? result.data
                    : [];


            updateStats();

            createFilters();

            renderResources();

        } catch (error) {

            showError(error);
        }
    }


    /* =====================================================
       STATISTICS
    ====================================================== */

    function updateStats() {

        if (totalResources) {

            totalResources.textContent =
                resources.length;
        }


        const published =
            resources.filter(function (resource) {

                return resource.published === true;

            }).length;


        if (publishedResources) {

            publishedResources.textContent =
                published;
        }


        if (hiddenResources) {

            hiddenResources.textContent =
                resources.length - published;
        }


        const categories =
            new Set(
                resources
                    .map(function (resource) {

                        return normalize(
                            resource.category
                        );

                    })
                    .filter(Boolean)
            );


        if (categoriesCount) {

            categoriesCount.textContent =
                categories.size;
        }
    }


    /* =====================================================
       CATEGORIES
    ====================================================== */

    function getCategories() {

        return Array.from(

            new Set(

                resources
                    .map(function (resource) {

                        return resource.category;

                    })
                    .filter(Boolean)

            )

        ).sort(function (a, b) {

            return String(a)
                .localeCompare(String(b));

        });
    }


    /* =====================================================
       FILTERS
    ====================================================== */

    function createFilters() {

        if (!filters) {
            return;
        }

        filters.innerHTML = "";


        const categories = [
            "All",
            ...getCategories()
        ];


        categories.forEach(function (category) {

            const button =
                document.createElement("button");

            button.type = "button";

            button.className =
                "admin-filter" +
                (
                    activeCategory === category
                        ? " active"
                        : ""
                );

            button.dataset.category =
                category;

            button.textContent =
                category;

            button.addEventListener(
                "click",
                function () {

                    activeCategory =
                        category;

                    filters
                        .querySelectorAll(
                            ".admin-filter"
                        )
                        .forEach(function (item) {

                            item.classList.toggle(
                                "active",
                                item === button
                            );

                        });

                    renderResources();

                }
            );

            filters.appendChild(button);

        });
    }


    /* =====================================================
       FILTER RESOURCES
    ====================================================== */

    function getFilteredResources() {

        return resources.filter(
            function (resource) {

                if (
                    activeCategory !== "All" &&
                    resource.category !== activeCategory
                ) {

                    return false;
                }


                if (!searchQuery) {
                    return true;
                }


                const searchableText = [

                    resource.title,

                    resource.category,

                    resource.description,

                    resource.resource_type,

                    resource.resource_url

                ]
                    .map(normalize)
                    .join(" ");


                return searchableText.includes(
                    searchQuery
                );

            }
        );
    }


    /* =====================================================
       RESOURCE CARD
    ====================================================== */

    function createResourceCard(resource) {

        const id =
            escapeHTML(resource.id);

        const title =
            escapeHTML(
                resource.title ||
                "Untitled Resource"
            );

        const description =
            escapeHTML(
                resource.description || ""
            );

        const category =
            escapeHTML(
                resource.category ||
                "Resource"
            );

        const resourceType =
            escapeHTML(
                resource.resource_type ||
                "Document"
            );

        const resourceUrl =
            escapeHTML(
                resource.resource_url ||
                "#"
            );

        const thumbnail =
            escapeHTML(
                resource.thumbnail_url ||
                ""
            );

        const isPublished =
            resource.published === true;

        const isFeatured =
            resource.featured === true;


        const statusClass =
            isPublished
                ? "published"
                : "hidden";


        const statusText =
            isPublished
                ? "Published"
                : "Hidden";


        return `

            <article
                class="admin-resource-item"
                data-resource-id="${id}"
            >

                ${
                    thumbnail
                        ? `
                            <div class="admin-resource-thumbnail">

                                <img
                                    src="${thumbnail}"
                                    alt=""
                                    loading="lazy"
                                >

                            </div>
                        `
                        : ""
                }


                <div class="admin-resource-content">

                    <div class="admin-resource-meta">

                        <span class="admin-badge">
                            ${category}
                        </span>

                        <span class="admin-badge">
                            ${resourceType}
                        </span>

                        ${
                            isFeatured
                                ? `
                                    <span class="admin-badge">
                                        Featured
                                    </span>
                                `
                                : ""
                        }

                        <span
                            class="admin-status ${statusClass}"
                        >
                            ${statusText}
                        </span>

                    </div>


                    <h3>
                        ${title}
                    </h3>


                    ${
                        description
                            ? `
                                <p>
                                    ${description}
                                </p>
                            `
                            : ""
                    }


                    ${
                        resource.resource_url
                            ? `
                                <div class="admin-resource-link">

                                    <a
                                        href="${resourceUrl}"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Open Resource ↗
                                    </a>

                                </div>
                            `
                            : ""
                    }


                    <div class="admin-resource-actions">

                        <button
                            type="button"
                            class="admin-btn admin-btn-secondary"
                            data-action="edit"
                            data-id="${id}"
                        >
                            Edit
                        </button>


                        <button
                            type="button"
                            class="admin-btn admin-btn-secondary"
                            data-action="toggle"
                            data-id="${id}"
                        >
                            ${
                                isPublished
                                    ? "Hide"
                                    : "Publish"
                            }
                        </button>


                        <button
                            type="button"
                            class="admin-btn admin-btn-danger"
                            data-action="delete"
                            data-id="${id}"
                        >
                            Delete
                        </button>

                    </div>

                </div>

            </article>

        `;
    }


    /* =====================================================
       RENDER
    ====================================================== */

    function renderResources() {

        if (!list) {
            return;
        }

        const filtered =
            getFilteredResources();


        if (filtered.length === 0) {

            list.innerHTML = `

                <div class="admin-empty">

                    <div class="admin-empty-icon">
                        —
                    </div>

                    <h3>
                        No resources found
                    </h3>

                    <p>
                        ${
                            searchQuery ||
                            activeCategory !== "All"
                                ? "Try another search or category."
                                : "Create your first resource using the form."
                        }
                    </p>

                </div>

            `;

            return;
        }


        list.innerHTML =
            filtered
                .map(createResourceCard)
                .join("");


        attachResourceActions();
    }


    /* =====================================================
       RESOURCE ACTIONS
    ====================================================== */

    function attachResourceActions() {

        if (!list) {
            return;
        }


        list
            .querySelectorAll("[data-action]")
            .forEach(function (button) {

                button.addEventListener(
                    "click",
                    async function () {

                        const action =
                            button.dataset.action;

                        const id =
                            button.dataset.id;


                        if (action === "edit") {

                            editResource(id);

                            return;
                        }


                        if (action === "toggle") {

                            await togglePublished(id);

                            return;
                        }


                        if (action === "delete") {

                            await deleteResource(id);

                        }

                    }
                );

            });
    }


    /* =====================================================
       EDIT
    ====================================================== */

    function editResource(id) {

        const resource =
            resources.find(
                function (item) {

                    return String(item.id) ===
                        String(id);

                }
            );


        if (!resource) {
            return;
        }


        editingId =
            resource.id;


        if (resourceIdInput) {
            resourceIdInput.value =
                resource.id;
        }

        if (titleInput) {
            titleInput.value =
                resource.title || "";
        }

        if (descriptionInput) {
            descriptionInput.value =
                resource.description || "";
        }

        if (categoryInput) {
            categoryInput.value =
                resource.category || "";
        }

        if (typeInput) {
            typeInput.value =
                resource.resource_type ||
                "document";
        }

        if (urlInput) {
            urlInput.value =
                resource.resource_url || "";
        }

        if (thumbnailInput) {
            thumbnailInput.value =
                resource.thumbnail_url || "";
        }

        if (featuredInput) {
            featuredInput.checked =
                resource.featured === true;
        }

        if (publishedInput) {
            publishedInput.checked =
                resource.published === true;
        }


        if (formTitle) {
            formTitle.textContent =
                "Edit Resource";
        }

        if (saveButton) {
            saveButton.textContent =
                "Update Resource";
        }

        if (cancelButton) {
            cancelButton.hidden =
                false;
        }


        if (form) {

            form.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }
    }


    /* =====================================================
       RESET FORM
    ====================================================== */

    function resetForm() {

        editingId = null;


        if (form) {
            form.reset();
        }


        if (resourceIdInput) {
            resourceIdInput.value = "";
        }


        if (publishedInput) {
            publishedInput.checked = true;
        }


        if (featuredInput) {
            featuredInput.checked = false;
        }


        if (typeInput) {
            typeInput.value = "document";
        }


        if (formTitle) {
            formTitle.textContent =
                "Create Resource";
        }


        if (saveButton) {
            saveButton.textContent =
                "Add Resource";
        }


        if (cancelButton) {
            cancelButton.hidden = true;
        }
    }


    /* =====================================================
       SAVE RESOURCE
    ====================================================== */

    async function saveResource(event) {

        event.preventDefault();


        client = getSupabaseClient();


        if (!client) {

            showMessage(
                "Supabase client is not available.",
                "error"
            );

            return;
        }


        const title =
            titleInput?.value.trim();

        const description =
            descriptionInput?.value.trim();

        const category =
            categoryInput?.value.trim();

        const resourceType =
            typeInput?.value.trim() ||
            "document";

        const resourceUrl =
            urlInput?.value.trim();

        const thumbnailUrl =
            thumbnailInput?.value.trim();

        const featured =
            featuredInput
                ? featuredInput.checked
                : false;

        const published =
            publishedInput
                ? publishedInput.checked
                : true;


        if (!title) {

            showMessage(
                "Please enter a resource title.",
                "error"
            );

            return;
        }


        if (!category) {

            showMessage(
                "Please enter a category.",
                "error"
            );

            return;
        }


        if (!resourceUrl) {

            showMessage(
                "Please enter a resource URL.",
                "error"
            );

            return;
        }


        /*
         * IMPORTANT:
         *
         * These match your actual Supabase
         * resources table.
         *
         * There is NO:
         * icon
         * button_text
         * link_text
         */

        const payload = {

            title: title,

            description:
                description || null,

            category:
                category,

            resource_type:
                resourceType,

            resource_url:
                resourceUrl,

            thumbnail_url:
                thumbnailUrl || null,

            featured:
                featured,

            published:
                published
        };


        if (saveButton) {

            saveButton.disabled = true;

            saveButton.textContent =
                editingId
                    ? "Updating..."
                    : "Adding...";
        }


        try {

            let result;


            /* UPDATE */

            if (editingId) {

                result =
                    await client
                        .from(TABLE_NAME)
                        .update(payload)
                        .eq(
                            "id",
                            editingId
                        );

            }


            /* INSERT */

            else {

                result =
                    await client
                        .from(TABLE_NAME)
                        .insert([
                            payload
                        ]);

            }


            if (result.error) {
                throw result.error;
            }


            showMessage(
                editingId
                    ? "Resource updated successfully."
                    : "Resource added successfully.",
                "success"
            );


            resetForm();

            await loadResources();


        } catch (error) {

            console.error(
                "Save resource error:",
                error
            );


            showMessage(
                error?.message ||
                "Failed to save resource.",
                "error"
            );


        } finally {

            if (saveButton) {

                saveButton.disabled =
                    false;

                saveButton.textContent =
                    "Add Resource";
            }
        }
    }


    /* =====================================================
       PUBLISH / HIDE
    ====================================================== */

    async function togglePublished(id) {

        client = getSupabaseClient();


        if (!client) {

            showMessage(
                "Supabase client is not available.",
                "error"
            );

            return;
        }


        const resource =
            resources.find(
                function (item) {

                    return String(item.id) ===
                        String(id);

                }
            );


        if (!resource) {
            return;
        }


        const current =
            resource.published === true;


        try {

            const result =
                await client
                    .from(TABLE_NAME)
                    .update({
                        published: !current
                    })
                    .eq(
                        "id",
                        id
                    );


            if (result.error) {
                throw result.error;
            }


            showMessage(
                !current
                    ? "Resource published."
                    : "Resource hidden.",
                "success"
            );


            await loadResources();


        } catch (error) {

            console.error(
                "Toggle resource error:",
                error
            );


            showMessage(
                error?.message ||
                "Failed to update resource.",
                "error"
            );
        }
    }


    /* =====================================================
       DELETE
    ====================================================== */

    async function deleteResource(id) {

        const resource =
            resources.find(
                function (item) {

                    return String(item.id) ===
                        String(id);

                }
            );


        if (!resource) {
            return;
        }


        const confirmed =
            window.confirm(
                `Delete "${resource.title || "this resource"}"?\n\nThis cannot be undone.`
            );


        if (!confirmed) {
            return;
        }


        client = getSupabaseClient();


        if (!client) {

            showMessage(
                "Supabase client is not available.",
                "error"
            );

            return;
        }


        try {

            const result =
                await client
                    .from(TABLE_NAME)
                    .delete()
                    .eq(
                        "id",
                        id
                    );


            if (result.error) {
                throw result.error;
            }


            showMessage(
                "Resource deleted successfully.",
                "success"
            );


            await loadResources();


        } catch (error) {

            console.error(
                "Delete resource error:",
                error
            );


            showMessage(
                error?.message ||
                "Failed to delete resource.",
                "error"
            );
        }
    }


    /* =====================================================
       SEARCH
    ====================================================== */

    function setupSearch() {

        if (!searchInput) {
            return;
        }


        searchInput.addEventListener(
            "input",
            function () {

                searchQuery =
                    normalize(
                        searchInput.value
                    );

                renderResources();

            }
        );


        searchInput.addEventListener(
            "keydown",
            function (event) {

                if (event.key === "Escape") {

                    searchInput.value = "";

                    searchQuery = "";

                    renderResources();

                    searchInput.blur();
                }

            }
        );
    }


    /* =====================================================
       CANCEL EDIT
    ====================================================== */

    function setupCancel() {

        if (!cancelButton) {
            return;
        }


        cancelButton.addEventListener(
            "click",
            function () {

                resetForm();

            }
        );
    }


    /* =====================================================
       FORM
    ====================================================== */

    function setupForm() {

        if (!form) {
            return;
        }


        form.addEventListener(
            "submit",
            saveResource
        );
    }


    /* =====================================================
       SIGN OUT
    ====================================================== */

    function setupSignOut() {

        const button =
            document.getElementById(
                "signOutBtn"
            );


        if (!button) {
            return;
        }


        button.addEventListener(
            "click",
            async function () {

                client = getSupabaseClient();


                if (client) {

                    try {

                        await client.auth.signOut();

                    } catch (error) {

                        console.error(
                            "Sign out error:",
                            error
                        );
                    }
                }


                window.location.href =
                    "index.html";

            }
        );
    }


    /* =====================================================
       INITIALIZE
    ====================================================== */

    async function init() {

        setupSearch();

        setupCancel();

        setupForm();

        setupSignOut();

        await loadResources();
    }


    /* =====================================================
       START
    ====================================================== */

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