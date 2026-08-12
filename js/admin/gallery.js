"use strict";

/*
=========================================================
PANIMALAR MEDIA
ADMIN — GALLERY
=========================================================

Handles:
- Load gallery
- Add gallery media
- Upload image to Supabase Storage
- Image URL alternative
- Edit gallery media
- Delete gallery media
- Publish / hide
- Featured
- Search
- Category filtering
- Statistics

Supabase:
Uses the existing global supabaseClient.

Database table:
gallery

Storage bucket:
media
=========================================================
*/

(function () {

    const TABLE_NAME = "gallery";
    const STORAGE_BUCKET = "media";

    let galleryItems = [];
    let activeCategory = "All";
    let searchQuery = "";
    let editingId = null;


    /* =====================================================
       DOM ELEMENTS
    ===================================================== */

    const form =
        document.getElementById("galleryForm");

    const galleryId =
        document.getElementById("galleryId");

    const titleInput =
        document.getElementById("galleryTitle");

    const descriptionInput =
        document.getElementById("galleryDescription");

    const categoryInput =
        document.getElementById("galleryCategory");

    const eventNameInput =
        document.getElementById("galleryEventName");

    const eventDateInput =
        document.getElementById("galleryEventDate");

    const fileInput =
        document.getElementById("galleryFile");

    const imageUrlInput =
        document.getElementById("galleryImageUrl");

    const preview =
        document.getElementById("galleryPreview");

    const previewImage =
        document.getElementById("galleryPreviewImage");

    const featuredInput =
        document.getElementById("galleryFeatured");

    const publishedInput =
        document.getElementById("galleryPublished");

    const saveButton =
        document.getElementById("saveGalleryBtn");

    const cancelButton =
        document.getElementById("cancelGalleryEditBtn");

    const formTitle =
        document.getElementById("galleryFormTitle");

    const list =
        document.getElementById("galleryList");

    const searchInput =
        document.getElementById("gallerySearch");

    const filters =
        document.getElementById("galleryFilters");

    const message =
        document.getElementById("galleryMessage");

    const totalItems =
        document.getElementById("totalGalleryItems");

    const publishedItems =
        document.getElementById("publishedGalleryItems");

    const hiddenItems =
        document.getElementById("hiddenGalleryItems");

    const categoriesCount =
        document.getElementById("galleryCategoriesCount");


    /* =====================================================
       SUPABASE CLIENT
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

                setTimeout(check, 100);
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
       MESSAGE
    ===================================================== */

    function showMessage(text, type = "success") {

        if (!message) {
            return;
        }

        message.hidden = false;

        message.textContent = text;

        message.className =
            "admin-message admin-message-" + type;

        setTimeout(function () {

            if (message) {
                message.hidden = true;
            }

        }, 4000);
    }


    /* =====================================================
       LOADING
    ===================================================== */

    function showLoading() {

        if (!list) {
            return;
        }

        list.innerHTML = `
            <div class="admin-loading">
                Loading gallery...
            </div>
        `;
    }


    /* =====================================================
       ERROR
    ===================================================== */

    function showError(error) {

        console.error(
            "Gallery error:",
            error
        );

        if (!list) {
            return;
        }

        const errorText =
            error?.message ||
            "Unable to load gallery.";

        list.innerHTML = `
            <div class="admin-error">

                <div class="admin-error-icon">
                    !
                </div>

                <h3>
                    Failed to load gallery
                </h3>

                <p>
                    ${escapeHTML(errorText)}
                </p>

                <button
                    type="button"
                    class="admin-btn admin-btn-secondary"
                    id="retryGalleryBtn"
                >
                    Try Again
                </button>

            </div>
        `;

        const retry =
            document.getElementById(
                "retryGalleryBtn"
            );

        if (retry) {

            retry.addEventListener(
                "click",
                loadGallery
            );
        }
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
       FORMAT DATE
    ===================================================== */

    function formatDate(value) {

        if (!value) {
            return "";
        }

        const date =
            new Date(value);

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
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    }


    /* =====================================================
       UPDATE STATISTICS
    ===================================================== */

    function updateStatistics() {

        const total =
            galleryItems.length;

        const published =
            galleryItems.filter(
                item => item.published === true
            ).length;

        const hidden =
            galleryItems.filter(
                item => item.published !== true
            ).length;

        const categories =
            new Set(
                galleryItems
                    .map(item => normalize(item.category))
                    .filter(Boolean)
            );

        if (totalItems) {
            totalItems.textContent = total;
        }

        if (publishedItems) {
            publishedItems.textContent = published;
        }

        if (hiddenItems) {
            hiddenItems.textContent = hidden;
        }

        if (categoriesCount) {
            categoriesCount.textContent =
                categories.size;
        }
    }


    /* =====================================================
       RENDER FILTERS
    ===================================================== */

    function renderFilters() {

        if (!filters) {
            return;
        }

        const categories =
            [
                ...new Set(
                    galleryItems
                        .map(item => item.category)
                        .filter(Boolean)
                )
            ]
            .sort(
                (a, b) =>
                    String(a).localeCompare(
                        String(b)
                    )
            );

        filters.innerHTML = "";

        const allButton =
            document.createElement("button");

        allButton.type = "button";

        allButton.className =
            "admin-filter" +
            (
                activeCategory === "All"
                    ? " active"
                    : ""
            );

        allButton.dataset.category = "All";

        allButton.textContent = "All";

        filters.appendChild(allButton);


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

            filters.appendChild(button);
        });
    }


    /* =====================================================
       FILTER GALLERY
    ===================================================== */

    function getFilteredItems() {

        return galleryItems.filter(
            function (item) {

                const category =
                    item.category || "";

                if (
                    activeCategory !== "All" &&
                    category !== activeCategory
                ) {
                    return false;
                }

                if (!searchQuery) {
                    return true;
                }

                const searchable =
                    [
                        item.title,
                        item.description,
                        item.category,
                        item.event_name
                    ]
                        .map(normalize)
                        .join(" ");

                return searchable.includes(
                    searchQuery
                );
            }
        );
    }


    /* =====================================================
       RENDER GALLERY
    ===================================================== */

    function renderGallery() {

        if (!list) {
            return;
        }

        const items =
            getFilteredItems();

        if (!items.length) {

            list.innerHTML = `
                <div class="admin-loading">
                    No gallery media found.
                </div>
            `;

            return;
        }


        list.innerHTML =
            items
                .map(createGalleryCard)
                .join("");
    }


    /* =====================================================
       CREATE CARD
    ===================================================== */

    function createGalleryCard(item) {

        const title =
            escapeHTML(
                item.title ||
                "Untitled Media"
            );

        const description =
            escapeHTML(
                item.description ||
                ""
            );

        const category =
            escapeHTML(
                item.category ||
                "Gallery"
            );

        const eventName =
            escapeHTML(
                item.event_name ||
                ""
            );

        const imageUrl =
            escapeHTML(
                item.image_url ||
                ""
            );

        const date =
            formatDate(
                item.event_date
            );

        const status =
            item.published
                ? "Published"
                : "Hidden";

        const statusClass =
            item.published
                ? "published"
                : "hidden";


        return `
            <article class="admin-gallery-card">

                ${
                    imageUrl
                        ? `
                            <div class="admin-gallery-image">
                                <img
                                    src="${imageUrl}"
                                    alt="${title}"
                                    loading="lazy"
                                    onerror="this.style.display='none'"
                                >
                            </div>
                          `
                        : ""
                }

                <div class="admin-gallery-card-body">

                    <div class="admin-gallery-card-top">

                        <span class="admin-pill">
                            ${category}
                        </span>

                        <span
                            class="admin-status ${statusClass}"
                        >
                            ${status}
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
                        eventName
                            ? `
                                <div class="admin-gallery-meta">
                                    Event:
                                    ${eventName}
                                </div>
                              `
                            : ""
                    }


                    ${
                        date
                            ? `
                                <div class="admin-gallery-meta">
                                    ${date}
                                </div>
                              `
                            : ""
                    }


                    <div class="admin-gallery-actions">

                        <button
                            type="button"
                            class="admin-btn admin-btn-secondary"
                            data-action="edit"
                            data-id="${escapeHTML(item.id)}"
                        >
                            Edit
                        </button>


                        <button
                            type="button"
                            class="admin-btn admin-btn-secondary"
                            data-action="toggle"
                            data-id="${escapeHTML(item.id)}"
                        >
                            ${
                                item.published
                                    ? "Hide"
                                    : "Publish"
                            }
                        </button>


                        <button
                            type="button"
                            class="admin-btn admin-btn-danger"
                            data-action="delete"
                            data-id="${escapeHTML(item.id)}"
                        >
                            Delete
                        </button>

                    </div>

                </div>

            </article>
        `;
    }


    /* =====================================================
       LOAD GALLERY
    ===================================================== */

    async function loadGallery() {

        const client =
            getSupabaseClient();

        if (!client) {

            showError(
                new Error(
                    "Supabase client is not available. Check ../js/supabase.js."
                )
            );

            return;
        }

        showLoading();


        try {

            const result =
                await client
                    .from(TABLE_NAME)
                    .select("*")
                    .order(
                        "created_at",
                        {
                            ascending: false
                        }
                    );


            if (result.error) {
                throw result.error;
            }


            galleryItems =
                result.data || [];


            updateStatistics();

            renderFilters();

            renderGallery();


        } catch (error) {

            showError(error);
        }
    }


    /* =====================================================
       IMAGE PREVIEW
    ===================================================== */

    function showPreview(url) {

        if (
            !preview ||
            !previewImage
        ) {
            return;
        }

        if (!url) {

            preview.style.display =
                "none";

            previewImage.src = "";

            return;
        }

        previewImage.src = url;

        preview.style.display =
            "block";
    }


    /* =====================================================
       FILE PREVIEW
    ===================================================== */

    if (fileInput) {

        fileInput.addEventListener(
            "change",
            function () {

                const file =
                    fileInput.files?.[0];

                if (!file) {
                    return;
                }

                if (
                    !file.type.startsWith(
                        "image/"
                    )
                ) {

                    showMessage(
                        "Please select an image file.",
                        "error"
                    );

                    fileInput.value = "";

                    return;
                }

                const objectUrl =
                    URL.createObjectURL(
                        file
                    );

                showPreview(objectUrl);

                /*
                Device upload takes priority.
                Clear URL field so the two sources
                remain mutually exclusive.
                */

                if (imageUrlInput) {
                    imageUrlInput.value = "";
                }
            }
        );
    }


    /* =====================================================
       URL PREVIEW
    ===================================================== */

    if (imageUrlInput) {

        imageUrlInput.addEventListener(
            "input",
            function () {

                const url =
                    imageUrlInput.value.trim();

                if (!url) {
                    showPreview("");
                    return;
                }

                /*
                URL source takes priority.
                Clear file input.
                */

                if (
                    fileInput &&
                    fileInput.files.length
                ) {
                    fileInput.value = "";
                }

                showPreview(url);
            }
        );
    }


    /* =====================================================
       UPLOAD IMAGE
    ===================================================== */

    async function uploadImage(
        client,
        file
    ) {

        if (!file) {
            return null;
        }


        if (
            !file.type.startsWith("image/")
        ) {

            throw new Error(
                "Only image files are allowed."
            );
        }


        /*
        20 MB safety limit.
        */

        const maxSize =
            20 * 1024 * 1024;

        if (file.size > maxSize) {

            throw new Error(
                "Image is too large. Maximum size is 20 MB."
            );
        }


        const extension =
            file.name
                .split(".")
                .pop()
                .toLowerCase()
                .replace(/[^a-z0-9]/g, "");


        const randomName =
            crypto.randomUUID();


        const filePath =
            `gallery/${randomName}.${extension}`;


        const uploadResult =
            await client.storage
                .from(STORAGE_BUCKET)
                .upload(
                    filePath,
                    file,
                    {
                        cacheControl: "3600",
                        upsert: false,
                        contentType: file.type
                    }
                );


        if (uploadResult.error) {
            throw uploadResult.error;
        }


        const publicResult =
            client.storage
                .from(STORAGE_BUCKET)
                .getPublicUrl(
                    filePath
                );


        if (
            !publicResult ||
            !publicResult.data ||
            !publicResult.data.publicUrl
        ) {

            throw new Error(
                "Image uploaded, but public URL could not be generated."
            );
        }


        return publicResult
            .data
            .publicUrl;
    }


    /* =====================================================
       SAVE GALLERY
    ===================================================== */

    async function saveGallery(event) {

        event.preventDefault();


        const client =
            getSupabaseClient();


        if (!client) {

            showMessage(
                "Supabase client is not available.",
                "error"
            );

            return;
        }


        const title =
            titleInput?.value.trim() || "";


        const description =
            descriptionInput?.value.trim() || null;


        const category =
            categoryInput?.value.trim() || null;


        const eventName =
            eventNameInput?.value.trim() || null;


        const eventDate =
            eventDateInput?.value || null;


        const imageUrl =
            imageUrlInput?.value.trim() || "";


        const file =
            fileInput?.files?.[0] || null;


        const featured =
            !!featuredInput?.checked;


        const published =
            !!publishedInput?.checked;


        /* =================================================
           VALIDATION
        ================================================= */

        if (!title) {

            showMessage(
                "Please enter a title.",
                "error"
            );

            titleInput?.focus();

            return;
        }


        /*
        On new media, either a file OR URL is required.
        During edit, existing image_url can be retained.
        */

        const existingItem =
            editingId
                ? galleryItems.find(
                    item =>
                        item.id === editingId
                )
                : null;


        if (
            !file &&
            !imageUrl &&
            !existingItem?.image_url
        ) {

            showMessage(
                "Please upload an image or provide an image URL.",
                "error"
            );

            return;
        }


        saveButton.disabled = true;

        saveButton.textContent =
            editingId
                ? "Updating..."
                : "Adding...";


        try {

            let finalImageUrl =
                imageUrl ||
                existingItem?.image_url ||
                null;


            /*
            DEVICE UPLOAD
            */

            if (file) {

                saveButton.textContent =
                    "Uploading image...";


                finalImageUrl =
                    await uploadImage(
                        client,
                        file
                    );
            }


            /*
            GET CURRENT USER
            */

            let currentUserId = null;

            try {

                const {
                    data
                } =
                    await client.auth.getUser();

                currentUserId =
                    data?.user?.id || null;

            } catch (userError) {

                console.warn(
                    "Could not get current user:",
                    userError
                );
            }


            /*
            DATABASE VALUES

            These exactly match your gallery
            table structure.
            */

            const values = {

                title:
                    title,

                description:
                    description,

                image_url:
                    finalImageUrl,

                category:
                    category,

                event_name:
                    eventName,

                event_date:
                    eventDate,

                featured:
                    featured,

                published:
                    published
            };


            /*
            Only set created_by when creating.
            */

            if (
                !editingId &&
                currentUserId
            ) {

                values.created_by =
                    currentUserId;
            }


            let result;


            /* =================================================
               UPDATE
            ================================================= */

            if (editingId) {

                result =
                    await client
                        .from(TABLE_NAME)
                        .update(values)
                        .eq(
                            "id",
                            editingId
                        );

            }


            /* =================================================
               INSERT
            ================================================= */

            else {

                result =
                    await client
                        .from(TABLE_NAME)
                        .insert([
                            values
                        ]);
            }


            if (result.error) {
                throw result.error;
            }


            showMessage(
                editingId
                    ? "Gallery media updated successfully."
                    : "Gallery media added successfully.",
                "success"
            );


            resetForm();


            await loadGallery();


        } catch (error) {

            console.error(
                "Save gallery error:",
                error
            );


            showMessage(
                error?.message ||
                "Failed to save gallery media.",
                "error"
            );


        } finally {

            saveButton.disabled = false;

            saveButton.textContent =
                editingId
                    ? "Update Media"
                    : "Add Media";
        }
    }


    /* =====================================================
       EDIT
    ===================================================== */

    function editGallery(item) {

        editingId =
            item.id;


        if (galleryId) {
            galleryId.value =
                item.id || "";
        }


        if (titleInput) {
            titleInput.value =
                item.title || "";
        }


        if (descriptionInput) {
            descriptionInput.value =
                item.description || "";
        }


        if (categoryInput) {
            categoryInput.value =
                item.category || "";
        }


        if (eventNameInput) {
            eventNameInput.value =
                item.event_name || "";
        }


        if (eventDateInput) {
            eventDateInput.value =
                item.event_date || "";
        }


        if (imageUrlInput) {
            imageUrlInput.value =
                item.image_url || "";
        }


        if (fileInput) {
            fileInput.value = "";
        }


        if (featuredInput) {
            featuredInput.checked =
                !!item.featured;
        }


        if (publishedInput) {
            publishedInput.checked =
                !!item.published;
        }


        showPreview(
            item.image_url || ""
        );


        if (formTitle) {

            formTitle.textContent =
                "Edit Gallery Media";
        }


        if (saveButton) {

            saveButton.textContent =
                "Update Media";
        }


        if (cancelButton) {
            cancelButton.hidden =
                false;
        }


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }


    /* =====================================================
       RESET FORM
    ===================================================== */

    function resetForm() {

        editingId = null;


        if (form) {
            form.reset();
        }


        if (galleryId) {
            galleryId.value = "";
        }


        if (preview) {

            preview.style.display =
                "none";
        }


        if (previewImage) {
            previewImage.src = "";
        }


        if (formTitle) {

            formTitle.textContent =
                "Add Gallery Media";
        }


        if (saveButton) {

            saveButton.textContent =
                "Add Media";

            saveButton.disabled =
                false;
        }


        if (cancelButton) {

            cancelButton.hidden =
                true;
        }


        if (publishedInput) {
            publishedInput.checked =
                true;
        }
    }


    /* =====================================================
       TOGGLE PUBLISHED
    ===================================================== */

    async function toggleGallery(id) {

        const client =
            getSupabaseClient();


        const item =
            galleryItems.find(
                gallery =>
                    gallery.id === id
            );


        if (!client || !item) {
            return;
        }


        try {

            const result =
                await client
                    .from(TABLE_NAME)
                    .update({
                        published:
                            !item.published
                    })
                    .eq(
                        "id",
                        id
                    );


            if (result.error) {
                throw result.error;
            }


            showMessage(
                item.published
                    ? "Media hidden."
                    : "Media published.",
                "success"
            );


            await loadGallery();


        } catch (error) {

            console.error(
                "Toggle gallery error:",
                error
            );


            showMessage(
                error.message ||
                "Failed to update media.",
                "error"
            );
        }
    }


    /* =====================================================
       DELETE
    ===================================================== */

    async function deleteGallery(id) {

        const client =
            getSupabaseClient();


        const item =
            galleryItems.find(
                gallery =>
                    gallery.id === id
            );


        if (!client || !item) {
            return;
        }


        const confirmed =
            window.confirm(
                `Delete "${item.title}"?\n\nThis cannot be undone.`
            );


        if (!confirmed) {
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
                "Gallery media deleted.",
                "success"
            );


            await loadGallery();


        } catch (error) {

            console.error(
                "Delete gallery error:",
                error
            );


            showMessage(
                error.message ||
                "Failed to delete media.",
                "error"
            );
        }
    }


    /* =====================================================
       FORM SUBMIT
    ===================================================== */

    if (form) {

        form.addEventListener(
            "submit",
            saveGallery
        );
    }


    /* =====================================================
       CANCEL EDIT
    ===================================================== */

    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            resetForm
        );
    }


    /* =====================================================
       SEARCH
    ===================================================== */

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            function () {

                searchQuery =
                    normalize(
                        searchInput.value
                    );

                renderGallery();
            }
        );
    }


    /* =====================================================
       FILTERS
    ===================================================== */

    if (filters) {

        filters.addEventListener(
            "click",
            function (event) {

                const button =
                    event.target.closest(
                        "[data-category]"
                    );


                if (!button) {
                    return;
                }


                activeCategory =
                    button.dataset.category ||
                    "All";


                renderFilters();

                renderGallery();
            }
        );
    }


    /* =====================================================
       GALLERY ACTIONS
    ===================================================== */

    if (list) {

        list.addEventListener(
            "click",
            function (event) {

                const button =
                    event.target.closest(
                        "[data-action]"
                    );


                if (!button) {
                    return;
                }


                const id =
                    button.dataset.id;


                const action =
                    button.dataset.action;


                const item =
                    galleryItems.find(
                        gallery =>
                            gallery.id === id
                    );


                if (!item) {
                    return;
                }


                if (
                    action === "edit"
                ) {

                    editGallery(item);
                }


                else if (
                    action === "toggle"
                ) {

                    toggleGallery(id);
                }


                else if (
                    action === "delete"
                ) {

                    deleteGallery(id);
                }
            }
        );
    }


    /* =====================================================
       INITIALIZE
    ===================================================== */

    async function init() {

        const client =
            await waitForSupabase(
                5000
            );


        if (!client) {

            if (list) {

                list.innerHTML = `
                    <div class="admin-error">

                        <h3>
                            Supabase client not available
                        </h3>

                        <p>
                            Check that
                            ../js/supabase.js
                            loads before gallery.js.
                        </p>

                    </div>
                `;
            }

            return;
        }


        await loadGallery();
    }


    init();


})();