"use strict";

/* =========================================================
   PANIMALAR MEDIA
   ADMIN EVENTS MANAGEMENT
   ========================================================= */


/* =========================================================
   STATE
========================================================= */

let editingEventId = null;
let events = [];


/* =========================================================
   SUPABASE STORAGE
========================================================= */

const EVENT_IMAGE_BUCKET = "media";


/* =========================================================
   INITIALIZE
========================================================= */

function initializeEventsPage() {

    setupForm();
    setupSlug();
    setupCancel();
    setupLogout();
    setupImageUpload();

    loadEvents();
}


/* =========================================================
   START
========================================================= */

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initializeEventsPage
    );

} else {

    initializeEventsPage();

}


/* =========================================================
   DOM HELPER
========================================================= */

function $(id) {
    return document.getElementById(id);
}


/* =========================================================
   SUPABASE CHECK
========================================================= */

function hasSupabaseClient() {

    if (
        typeof supabaseClient === "undefined" ||
        !supabaseClient
    ) {

        console.error(
            "supabaseClient is not available."
        );

        showMessage(
            "Supabase client is not available.",
            "error"
        );

        return false;
    }

    return true;
}


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(
    text,
    type = "success"
) {

    const box = $("message");

    if (!box) {
        console.log(text);
        return;
    }

    box.textContent = text;

    box.className =
        `message show ${type}`;

    setTimeout(() => {

        box.className =
            "message";

    }, 4000);
}


/* =========================================================
   SLUGIFY
========================================================= */

function slugify(text) {

    return String(text || "")
        .toLowerCase()
        .trim()
        .replace(
            /[^a-z0-9\s-]/g,
            ""
        )
        .replace(
            /\s+/g,
            "-"
        )
        .replace(
            /-+/g,
            "-"
        );
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
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


/* =========================================================
   DATE
========================================================= */

function formatDate(value) {

    if (!value) {
        return "No date";
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


/* =========================================================
   TIME
========================================================= */

function formatTime(value) {

    if (!value) {
        return "";
    }

    const parts =
        value.split(":");

    if (parts.length < 2) {
        return value;
    }

    const hour =
        Number(parts[0]);

    const minute =
        parts[1];

    const suffix =
        hour >= 12
            ? "PM"
            : "AM";

    const displayHour =
        hour % 12 || 12;

    return `${displayHour}:${minute} ${suffix}`;
}


/* =========================================================
   IMAGE UPLOAD SETUP
========================================================= */

function setupImageUpload() {

    const imageFile =
        $("imageFile");

    const imageUrl =
        $("imageUrl");

    const preview =
        $("imagePreview");

    const previewImage =
        $("imagePreviewImage");


    if (!imageFile) {
        return;
    }


    imageFile.addEventListener(
        "change",
        () => {

            const file =
                imageFile.files &&
                imageFile.files[0];

            if (!file) {

                if (preview) {
                    preview.style.display =
                        "none";
                }

                return;
            }


            /* Validate image */

            if (!file.type.startsWith("image/")) {

                showMessage(
                    "Please select an image file.",
                    "error"
                );

                imageFile.value = "";

                if (preview) {
                    preview.style.display =
                        "none";
                }

                return;
            }


            /* Limit: 10 MB */

            const maxSize =
                10 * 1024 * 1024;

            if (file.size > maxSize) {

                showMessage(
                    "Image must be smaller than 10 MB.",
                    "error"
                );

                imageFile.value = "";

                if (preview) {
                    preview.style.display =
                        "none";
                }

                return;
            }


            /* Local preview */

            if (previewImage) {

                const objectUrl =
                    URL.createObjectURL(file);

                previewImage.src =
                    objectUrl;

                previewImage.onload =
                    () => {

                        URL.revokeObjectURL(
                            objectUrl
                        );

                    };
            }


            if (preview) {
                preview.style.display =
                    "block";
            }


            /* Clear manually entered URL */

            if (imageUrl) {
                imageUrl.value = "";
            }

        }
    );
}


/* =========================================================
   UPLOAD EVENT IMAGE
========================================================= */

async function uploadEventImage(file) {

    if (!file) {
        return null;
    }


    if (!hasSupabaseClient()) {
        throw new Error(
            "Supabase client is not available."
        );
    }


    /* Validate file */

    if (!file.type.startsWith("image/")) {

        throw new Error(
            "Please select a valid image."
        );
    }


    const maxSize =
        10 * 1024 * 1024;

    if (file.size > maxSize) {

        throw new Error(
            "Image must be smaller than 10 MB."
        );
    }


    /*
       Create a unique filename.

       Example:
       events/1723478293-freshers-day.webp
    */

    const originalName =
        file.name
            .toLowerCase()
            .replace(
                /[^a-z0-9.]+/g,
                "-"
            );

    const extension =
        originalName.includes(".")
            ? originalName.substring(
                originalName.lastIndexOf(".")
            )
            : "";

    const baseName =
        originalName
            .replace(
                /\.[^/.]+$/,
                ""
            )
            .substring(
                0,
                80
            );

    const uniqueName =
        `${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 8)}-${baseName || "event"}${extension}`;


    const filePath =
        `events/${uniqueName}`;


    console.log(
        "[Events] Uploading image:",
        filePath
    );


    /* Upload */

    const {
        error: uploadError
    } =
        await supabaseClient
            .storage
            .from(EVENT_IMAGE_BUCKET)
            .upload(
                filePath,
                file,
                {
                    cacheControl: "3600",
                    upsert: false,
                    contentType: file.type
                }
            );


    if (uploadError) {

        console.error(
            "[Events] Image upload error:",
            uploadError
        );

        throw uploadError;
    }


    /* Get public URL */

    const {
        data
    } =
        supabaseClient
            .storage
            .from(EVENT_IMAGE_BUCKET)
            .getPublicUrl(
                filePath
            );


    if (
        !data ||
        !data.publicUrl
    ) {

        throw new Error(
            "Image uploaded but public URL could not be generated."
        );
    }


    console.log(
        "[Events] Image uploaded:",
        data.publicUrl
    );


    return data.publicUrl;
}


/* =========================================================
   LOAD EVENTS
========================================================= */

async function loadEvents() {

    if (!hasSupabaseClient()) {
        return;
    }


    const list =
        $("eventList");


    if (!list) {

        console.error(
            "eventList element not found."
        );

        return;
    }


    /* LOADING */

    list.innerHTML = `
        <div class="loading">
            Loading events...
        </div>
    `;


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("events")
                .select("*")
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


        if (error) {

            console.error(
                "Events loading error:",
                error
            );

            showError(
                error.message ||
                "Failed to load events."
            );

            return;
        }


        events =
            data || [];


        if (!events.length) {

            list.innerHTML = `
                <div class="empty">
                    No events yet.
                </div>
            `;

            return;
        }


        renderEvents();


    } catch (error) {

        console.error(
            "Events loading error:",
            error
        );

        showError(
            error.message ||
            "Failed to load events."
        );
    }
}


/* =========================================================
   RENDER EVENTS
========================================================= */

function renderEvents() {

    const list =
        $("eventList");


    if (!list) {
        return;
    }


    list.innerHTML =
        events.map(
            event => {

                const title =
                    escapeHTML(
                        event.title
                    );

                const category =
                    escapeHTML(
                        event.category ||
                        "General"
                    );

                const location =
                    escapeHTML(
                        event.location ||
                        "Location not specified"
                    );

                const date =
                    formatDate(
                        event.event_date
                    );

                const start =
                    formatTime(
                        event.start_time
                    );

                const end =
                    formatTime(
                        event.end_time
                    );

                const time =
                    start
                        ? `${start}${end ? ` – ${end}` : ""}`
                        : "";


                return `

                    <div
                        class="event-item"
                        data-event-id="${escapeHTML(event.id)}"
                    >

                        <div class="event-head">

                            <div>

                                ${
                                    event.image_url
                                        ? `
                                            <img
                                                src="${escapeHTML(event.image_url)}"
                                                alt="${title}"
                                                style="
                                                    width:100%;
                                                    max-height:220px;
                                                    object-fit:cover;
                                                    border-radius:12px;
                                                    margin-bottom:16px;
                                                "
                                            >
                                        `
                                        : ""
                                }

                                <h3 class="event-title">
                                    ${title}
                                </h3>


                                <div class="event-meta">

                                    ${category}

                                    ·

                                    ${date}

                                    ${
                                        time
                                            ? ` · ${time}`
                                            : ""
                                    }

                                    ·

                                    ${location}

                                </div>

                            </div>


                            <div class="badges">

                                ${
                                    event.published

                                        ? `
                                            <span class="badge green">
                                                Published
                                            </span>
                                          `

                                        : `
                                            <span class="badge red">
                                                Draft
                                            </span>
                                          `
                                }


                                ${
                                    event.featured

                                        ? `
                                            <span class="badge">
                                                Featured
                                            </span>
                                          `

                                        : ""
                                }

                            </div>

                        </div>


                        <div class="event-actions">

                            <button
                                type="button"
                                class="btn"
                                data-edit="${escapeHTML(event.id)}"
                            >
                                Edit
                            </button>


                            <button
                                type="button"
                                class="btn"
                                data-toggle="${escapeHTML(event.id)}"
                            >
                                ${
                                    event.published
                                        ? "Unpublish"
                                        : "Publish"
                                }
                            </button>


                            <button
                                type="button"
                                class="btn danger"
                                data-delete="${escapeHTML(event.id)}"
                            >
                                Delete
                            </button>

                        </div>

                    </div>

                `;

            }
        ).join("");


    attachEventActions();
}


/* =========================================================
   EVENT BUTTONS
========================================================= */

function attachEventActions() {


    document
        .querySelectorAll(
            "[data-edit]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        button.dataset.edit;


                    const event =
                        events.find(
                            item =>
                                String(item.id) ===
                                String(id)
                        );


                    if (event) {
                        editEvent(event);
                    }

                }
            );

        });


    document
        .querySelectorAll(
            "[data-toggle]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    togglePublished(
                        button.dataset.toggle
                    );

                }
            );

        });


    document
        .querySelectorAll(
            "[data-delete]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    deleteEvent(
                        button.dataset.delete
                    );

                }
            );

        });

}


/* =========================================================
   FORM SETUP
========================================================= */

function setupForm() {

    const form =
        $("eventForm");


    if (!form) {

        console.error(
            "eventForm not found."
        );

        return;
    }


    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            await saveEvent();

        }
    );
}


/* =========================================================
   SLUG SETUP
========================================================= */

function setupSlug() {

    const title =
        $("eventTitle");

    const slug =
        $("eventSlug");


    if (
        !title ||
        !slug
    ) {
        return;
    }


    title.addEventListener(
        "input",
        () => {

            if (!editingEventId) {

                slug.value =
                    slugify(
                        title.value
                    );

            }

        }
    );
}


/* =========================================================
   CANCEL
========================================================= */

function setupCancel() {

    const button =
        $("cancelButton");


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        resetForm
    );
}


/* =========================================================
   LOGOUT
========================================================= */

function setupLogout() {

    const button =
        $("logoutButton");


    /*
       Some versions of the admin HTML
       use adminLogoutButton.
    */

    const actualButton =
        button ||
        $("adminLogoutButton");


    if (!actualButton) {
        return;
    }


    actualButton.addEventListener(
        "click",
        async () => {

            if (
                typeof supabaseClient !==
                "undefined"
            ) {

                await supabaseClient
                    .auth
                    .signOut();

            }


            window.location.href =
                "index.html";

        }
    );
}


/* =========================================================
   SAVE EVENT
========================================================= */

async function saveEvent() {

    if (!hasSupabaseClient()) {
        return;
    }


    const titleInput =
        $("eventTitle");


    const categoryInput =
        $("eventCategory");


    const slugInput =
        $("eventSlug");


    const descriptionInput =
        $("eventDescription");


    const dateInput =
        $("eventDate");


    const startInput =
        $("startTime");


    const endInput =
        $("endTime");


    const locationInput =
        $("eventLocation");


    const imageInput =
        $("imageUrl");


    const imageFileInput =
        $("imageFile");


    const registrationInput =
        $("registrationUrl");


    const featuredInput =
        $("featured");


    const publishedInput =
        $("published");


    if (
        !titleInput ||
        !dateInput
    ) {

        return;
    }


    const title =
        titleInput.value.trim();


    const category =
        categoryInput
            ? categoryInput.value.trim()
            : "General";


    let slug =
        slugInput
            ? slugInput.value.trim()
            : "";


    if (!slug) {

        slug =
            slugify(title);

    }


    const description =
        descriptionInput
            ? descriptionInput.value.trim() || null
            : null;


    const eventDate =
        dateInput.value;


    const startTime =
        startInput
            ? startInput.value || null
            : null;


    const endTime =
        endInput
            ? endInput.value || null
            : null;


    const location =
        locationInput
            ? locationInput.value.trim() || null
            : null;


    let imageUrl =
        imageInput
            ? imageInput.value.trim() || null
            : null;


    const registrationUrl =
        registrationInput
            ? registrationInput.value.trim() || null
            : null;


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
            "Please enter an event title.",
            "error"
        );

        return;
    }


    if (!eventDate) {

        showMessage(
            "Please select an event date.",
            "error"
        );

        return;
    }


    const submitButton =
        $("submitButton");


    try {

        /* Disable button */

        if (submitButton) {

            submitButton.disabled =
                true;

            submitButton.textContent =
                "Preparing...";
        }


        /* =====================================================
           IMAGE UPLOAD
        ===================================================== */

        const selectedFile =
            imageFileInput &&
            imageFileInput.files &&
            imageFileInput.files[0];


        if (selectedFile) {

            if (submitButton) {
                submitButton.textContent =
                    "Uploading image...";
            }


            imageUrl =
                await uploadEventImage(
                    selectedFile
                );


            /*
               Put generated public URL
               into Image URL field.
            */

            if (imageInput) {
                imageInput.value =
                    imageUrl;
            }

        }


        /* =====================================================
           PAYLOAD
        ===================================================== */

        const payload = {

            title,

            slug,

            description,

            category:
                category || "General",

            event_date:
                eventDate,

            start_time:
                startTime,

            end_time:
                endTime,

            location,

            image_url:
                imageUrl,

            registration_url:
                registrationUrl,

            featured,

            published,

            updated_at:
                new Date().toISOString()

        };


        /* =====================================================
           BUTTON
        ===================================================== */

        if (submitButton) {

            submitButton.textContent =
                editingEventId
                    ? "Saving..."
                    : "Publishing...";
        }


        /* =====================================================
           INSERT / UPDATE
        ===================================================== */

        let result;


        if (editingEventId) {

            result =
                await supabaseClient
                    .from("events")
                    .update(payload)
                    .eq(
                        "id",
                        editingEventId
                    );

        } else {

            const {
                data: userData,
                error: userError
            } =
                await supabaseClient
                    .auth
                    .getUser();


            if (
                userError ||
                !userData ||
                !userData.user
            ) {

                throw new Error(
                    "You are not logged in."
                );
            }


            payload.created_by =
                userData.user.id;


            result =
                await supabaseClient
                    .from("events")
                    .insert(
                        payload
                    );
        }


        if (result.error) {
            throw result.error;
        }


        showMessage(
            editingEventId
                ? "Event updated successfully."
                : "Event created successfully.",
            "success"
        );


        resetForm();

        await loadEvents();


    } catch (error) {

        console.error(
            "Event save error:",
            error
        );


        showMessage(
            error.message ||
            "Failed to save event.",
            "error"
        );


    } finally {

        if (submitButton) {

            submitButton.disabled =
                false;

            submitButton.textContent =
                "Publish Event";
        }

    }
}


/* =========================================================
   EDIT EVENT
========================================================= */

function editEvent(event) {

    editingEventId =
        event.id;


    const formTitle =
        $("formTitle");


    if (formTitle) {

        formTitle.textContent =
            "Edit Event";

    }


    const submitButton =
        $("submitButton");


    if (submitButton) {

        submitButton.textContent =
            "Save Changes";

    }


    const cancelButton =
        $("cancelButton");


    if (cancelButton) {

        cancelButton.style.display =
            "inline-block";

    }


    const eventId =
        $("eventId");


    if (eventId) {

        eventId.value =
            event.id || "";

    }


    setValue(
        "eventTitle",
        event.title
    );


    setValue(
        "eventCategory",
        event.category
    );


    setValue(
        "eventSlug",
        event.slug
    );


    setValue(
        "eventDescription",
        event.description
    );


    setValue(
        "eventDate",
        event.event_date
    );


    setValue(
        "startTime",
        event.start_time
    );


    setValue(
        "endTime",
        event.end_time
    );


    setValue(
        "eventLocation",
        event.location
    );


    setValue(
        "imageUrl",
        event.image_url
    );


    /* Clear file input */

    const imageFile =
        $("imageFile");

    if (imageFile) {
        imageFile.value = "";
    }


    /* Show existing image */

    const preview =
        $("imagePreview");

    const previewImage =
        $("imagePreviewImage");


    if (
        preview &&
        previewImage &&
        event.image_url
    ) {

        previewImage.src =
            event.image_url;

        preview.style.display =
            "block";

    } else if (preview) {

        preview.style.display =
            "none";
    }


    setValue(
        "registrationUrl",
        event.registration_url
    );


    const featured =
        $("featured");


    if (featured) {

        featured.checked =
            Boolean(
                event.featured
            );

    }


    const published =
        $("published");


    if (published) {

        published.checked =
            Boolean(
                event.published
            );

    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   SET VALUE
========================================================= */

function setValue(
    id,
    value
) {

    const element =
        $(id);


    if (element) {

        element.value =
            value ?? "";

    }
}


/* =========================================================
   DELETE EVENT
========================================================= */

async function deleteEvent(id) {

    if (!hasSupabaseClient()) {
        return;
    }


    const confirmed =
        confirm(
            "Delete this event permanently?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const {
            error
        } =
            await supabaseClient
                .from("events")
                .delete()
                .eq(
                    "id",
                    id
                );


        if (error) {
            throw error;
        }


        showMessage(
            "Event deleted.",
            "success"
        );


        if (
            String(editingEventId) ===
            String(id)
        ) {

            resetForm();

        }


        await loadEvents();


    } catch (error) {

        console.error(
            "Delete failed:",
            error
        );


        showMessage(
            error.message ||
            "Failed to delete event.",
            "error"
        );

    }
}


/* =========================================================
   TOGGLE PUBLISHED
========================================================= */

async function togglePublished(id) {

    if (!hasSupabaseClient()) {
        return;
    }


    try {

        const {
            data: event,
            error: fetchError
        } =
            await supabaseClient
                .from("events")
                .select("published")
                .eq(
                    "id",
                    id
                )
                .single();


        if (fetchError) {
            throw fetchError;
        }


        const {
            error
        } =
            await supabaseClient
                .from("events")
                .update({

                    published:
                        !event.published,

                    updated_at:
                        new Date().toISOString()

                })
                .eq(
                    "id",
                    id
                );


        if (error) {
            throw error;
        }


        showMessage(
            event.published
                ? "Event unpublished."
                : "Event published.",
            "success"
        );


        await loadEvents();


    } catch (error) {

        console.error(
            "Publish toggle failed:",
            error
        );


        showMessage(
            error.message ||
            "Failed to update event.",
            "error"
        );

    }
}


/* =========================================================
   RESET
========================================================= */

function resetForm() {

    editingEventId =
        null;


    const form =
        $("eventForm");


    if (form) {
        form.reset();
    }


    const published =
        $("published");


    if (published) {
        published.checked = true;
    }


    const formTitle =
        $("formTitle");


    if (formTitle) {

        formTitle.textContent =
            "Create Event";

    }


    const submitButton =
        $("submitButton");


    if (submitButton) {

        submitButton.textContent =
            "Publish Event";

    }


    const cancelButton =
        $("cancelButton");


    if (cancelButton) {

        cancelButton.style.display =
            "none";

    }


    const eventId =
        $("eventId");


    if (eventId) {
        eventId.value = "";
    }


    /* Clear image preview */

    const preview =
        $("imagePreview");

    const previewImage =
        $("imagePreviewImage");


    if (preview) {
        preview.style.display =
            "none";
    }


    if (previewImage) {
        previewImage.src = "";
    }


    const imageFile =
        $("imageFile");

    if (imageFile) {
        imageFile.value = "";
    }
}


/* =========================================================
   ERROR
========================================================= */

function showError(message) {

    const list =
        $("eventList");


    if (!list) {
        return;
    }


    list.innerHTML = `
        <div class="empty">

            Failed to load events.

            <br><br>

            ${escapeHTML(message)}

        </div>
    `;
}