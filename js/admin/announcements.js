"use strict";

/*
=========================================================
PANIMALAR MEDIA
ADMIN — ANNOUNCEMENTS
=========================================================
*/

document.addEventListener("DOMContentLoaded", async () => {

    /*
    =====================================================
    SUPABASE CHECK
    =====================================================
    */

    if (typeof supabaseClient === "undefined") {
        console.error("Supabase client is not available.");
        return;
    }


    /*
    =====================================================
    DOM ELEMENTS
    =====================================================
    */

    const form =
        document.getElementById("announcementForm");

    const list =
        document.getElementById("announcementList");

    const titleInput =
        document.getElementById("announcementTitle");

    const contentInput =
        document.getElementById("announcementContent");

    const categoryInput =
        document.getElementById("announcementCategory");

    const imageInput =
        document.getElementById("announcementImage");

    const linkInput =
        document.getElementById("announcementLink");

    const priorityInput =
        document.getElementById("announcementPriority");

    const publishedInput =
        document.getElementById("announcementPublished");

    const submitButton =
        document.getElementById("announcementSubmit");

    const cancelButton =
        document.getElementById("announcementCancel");

    const formTitle =
        document.getElementById("announcementFormTitle");

    const message =
        document.getElementById("announcementMessage");


    let editingId = null;


    /*
    =====================================================
    AUTH CHECK
    =====================================================
    */

    async function checkAdmin() {

        try {

            const {
                data: { user },
                error
            } = await supabaseClient.auth.getUser();


            if (error || !user) {

                window.location.href = "index.html";

                return false;
            }


            const {
                data: profile,
                error: profileError
            } = await supabaseClient
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .maybeSingle();


            if (
                profileError ||
                !profile ||
                profile.role !== "admin"
            ) {

                await supabaseClient.auth.signOut();

                window.location.href = "index.html";

                return false;
            }


            return true;

        } catch (error) {

            console.error(
                "Admin authentication failed:",
                error
            );

            return false;
        }
    }


    /*
    =====================================================
    LOAD ANNOUNCEMENTS
    =====================================================
    */

    async function loadAnnouncements() {

        if (!list) {
            return;
        }


        list.innerHTML = `
            <div class="admin-loading">
                Loading announcements...
            </div>
        `;


        try {

            const {
                data,
                error
            } = await supabaseClient
                .from("announcements")
                .select("*")
                .order("published_at", {
                    ascending: false,
                    nullsFirst: false
                });


            if (error) {
                throw error;
            }


            if (!data || data.length === 0) {

                list.innerHTML = `
                    <div class="admin-loading">
                        No announcements yet.
                    </div>
                `;

                return;
            }


            list.innerHTML = "";


            data.forEach(
                announcement => {

                    list.appendChild(
                        createAnnouncementCard(
                            announcement
                        )
                    );

                }
            );


        } catch (error) {

            console.error(
                "Failed to load announcements:",
                error
            );


            list.innerHTML = `
                <div class="admin-loading">
                    Failed to load announcements.
                </div>
            `;
        }
    }


    /*
    =====================================================
    CREATE ANNOUNCEMENT CARD

    IMPORTANT:
    These class names match the existing CSS.
    DO NOT change them unless the CSS is also changed.
    =====================================================
    */

    function createAnnouncementCard(announcement) {

        const card =
            document.createElement("div");


        /*
        -------------------------------------------------
        THIS IS THE IMPORTANT FIX
        -------------------------------------------------

        Old JS:
        admin-announcement-card

        Correct CSS:
        admin-announcement-item
        */

        card.className =
            "admin-announcement-item";


        const published =
            announcement.published === true;


        const statusText =
            published
                ? "Published"
                : "Draft";


        const statusClass =
            published
                ? "admin-badge-published"
                : "";


        const date =
            formatDate(
                announcement.published_at ||
                announcement.created_at
            );


        const category =
            escapeHTML(
                announcement.category ||
                "General"
            );


        const title =
            escapeHTML(
                announcement.title ||
                "Untitled announcement"
            );


        const content =
            escapeHTML(
                announcement.content ||
                ""
            );


        const priority =
            escapeHTML(
                announcement.priority ||
                "normal"
            );


        /*
        -------------------------------------------------
        IMAGE
        -------------------------------------------------
        */

        const imageHTML =
            announcement.image_url
                ? `
                    <div
                        class="admin-announcement-image"
                        style="
                            margin-top:14px;
                            margin-bottom:14px;
                        "
                    >
                        <img
                            src="${escapeHTML(
                                announcement.image_url
                            )}"
                            alt="${title}"
                            style="
                                width:100%;
                                max-height:220px;
                                object-fit:cover;
                                border-radius:10px;
                                display:block;
                            "
                            onerror="
                                this.parentElement.style.display='none';
                            "
                        >
                    </div>
                `
                : "";


        /*
        -------------------------------------------------
        LINK
        -------------------------------------------------
        */

        const linkHTML =
            announcement.link_url
                ? `
                    <div style="margin-top:10px;">
                        <a
                            href="${escapeHTML(
                                announcement.link_url
                            )}"
                            target="_blank"
                            rel="noopener noreferrer"
                            style="
                                color:#c28cff;
                                text-decoration:none;
                                font-size:12px;
                                font-weight:600;
                            "
                        >
                            Open link ↗
                        </a>
                    </div>
                `
                : "";


        /*
        -------------------------------------------------
        CARD HTML

        These classes match your actual CSS.
        -------------------------------------------------
        */

        card.innerHTML = `

            <div class="admin-announcement-top">

                <div class="admin-announcement-badges">

                    <span
                        class="admin-badge admin-badge-category"
                    >
                        ${category}
                    </span>


                    <span
                        class="admin-badge ${statusClass}"
                    >
                        ${statusText}
                    </span>

                </div>


                <div
                    class="admin-announcement-actions"
                >

                    <button
                        type="button"
                        class="admin-secondary-button"
                        data-edit-id="${escapeHTML(
                            announcement.id
                        )}"
                    >
                        Edit
                    </button>


                    <button
                        type="button"
                        class="admin-danger-button"
                        data-delete-id="${escapeHTML(
                            announcement.id
                        )}"
                    >
                        Delete
                    </button>

                </div>

            </div>


            <h3>
                ${title}
            </h3>


            <p>
                ${content}
            </p>


            ${imageHTML}


            <div class="admin-announcement-meta">

                <span>
                    Priority:
                    ${priority}
                </span>


                <span>
                    ${date}
                </span>

            </div>


            ${linkHTML}

        `;


        /*
        =================================================
        EDIT BUTTON
        =================================================
        */

        const editButton =
            card.querySelector(
                "[data-edit-id]"
            );


        if (editButton) {

            editButton.addEventListener(
                "click",
                () => {

                    editAnnouncement(
                        announcement
                    );

                }
            );
        }


        /*
        =================================================
        DELETE BUTTON
        =================================================
        */

        const deleteButton =
            card.querySelector(
                "[data-delete-id]"
            );


        if (deleteButton) {

            deleteButton.addEventListener(
                "click",
                () => {

                    deleteAnnouncement(
                        announcement.id
                    );

                }
            );
        }


        return card;
    }


    /*
    =====================================================
    CREATE / UPDATE ANNOUNCEMENT
    =====================================================
    */

    if (form) {

        form.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                clearMessage();


                const title =
                    titleInput
                        ? titleInput.value.trim()
                        : "";


                const content =
                    contentInput
                        ? contentInput.value.trim()
                        : "";


                const category =
                    categoryInput
                        ? categoryInput.value.trim()
                        : "";


                const imageUrl =
                    imageInput
                        ? imageInput.value.trim()
                        : "";


                const linkUrl =
                    linkInput
                        ? linkInput.value.trim()
                        : "";


                const priority =
                    priorityInput
                        ? priorityInput.value
                        : "normal";


                const published =
                    publishedInput
                        ? publishedInput.checked
                        : true;


                /*
                =========================================
                VALIDATION
                =========================================
                */

                if (!title) {

                    showMessage(
                        "Please enter a title.",
                        "error"
                    );


                    if (titleInput) {
                        titleInput.focus();
                    }

                    return;
                }


                if (!content) {

                    showMessage(
                        "Please enter announcement content.",
                        "error"
                    );


                    if (contentInput) {
                        contentInput.focus();
                    }

                    return;
                }


                /*
                =========================================
                BUTTON STATE
                =========================================
                */

                if (submitButton) {

                    submitButton.disabled = true;

                    submitButton.textContent =
                        editingId
                            ? "Updating..."
                            : "Publishing...";
                }


                try {

                    /*
                    =====================================
                    SUPABASE DATA

                    IMPORTANT:
                    Database uses:

                    published
                    published_at

                    NOT:
                    status
                    =====================================
                    */

                    const announcementData = {

                        title: title,

                        content: content,

                        category:
                            category ||
                            "General",

                        image_url:
                            imageUrl ||
                            null,

                        link_url:
                            linkUrl ||
                            null,

                        priority:
                            priority ||
                            "normal",

                        published:
                            published,

                        published_at:
                            published
                                ? new Date().toISOString()
                                : null

                    };


                    /*
                    =====================================
                    UPDATE
                    =====================================
                    */

                    if (editingId) {

                        const {
                            error
                        } = await supabaseClient
                            .from("announcements")
                            .update(
                                announcementData
                            )
                            .eq(
                                "id",
                                editingId
                            );


                        if (error) {
                            throw error;
                        }


                        showMessage(
                            "Announcement updated successfully.",
                            "success"
                        );

                    }


                    /*
                    =====================================
                    INSERT
                    =====================================
                    */

                    else {

                        const {
                            error
                        } = await supabaseClient
                            .from("announcements")
                            .insert(
                                announcementData
                            );


                        if (error) {
                            throw error;
                        }


                        showMessage(
                            "Announcement created successfully.",
                            "success"
                        );

                    }


                    /*
                    =====================================
                    RESET + RELOAD
                    =====================================
                    */

                    resetForm();

                    await loadAnnouncements();

                }


                catch (error) {

                    console.error(
                        "Announcement save failed:",
                        error
                    );


                    showMessage(
                        error.message ||
                        "Failed to save announcement.",
                        "error"
                    );

                }


                finally {

                    if (submitButton) {

                        submitButton.disabled =
                            false;


                        submitButton.textContent =
                            editingId
                                ? "Update Announcement"
                                : "Publish Announcement";
                    }

                }

            }
        );
    }


    /*
    =====================================================
    EDIT ANNOUNCEMENT
    =====================================================
    */

    function editAnnouncement(announcement) {

        editingId =
            announcement.id;


        if (titleInput) {

            titleInput.value =
                announcement.title ||
                "";
        }


        if (contentInput) {

            contentInput.value =
                announcement.content ||
                "";
        }


        if (categoryInput) {

            categoryInput.value =
                announcement.category ||
                "";
        }


        if (imageInput) {

            imageInput.value =
                announcement.image_url ||
                "";
        }


        if (linkInput) {

            linkInput.value =
                announcement.link_url ||
                "";
        }


        if (priorityInput) {

            priorityInput.value =
                announcement.priority ||
                "normal";
        }


        if (publishedInput) {

            publishedInput.checked =
                announcement.published === true;
        }


        if (formTitle) {

            formTitle.textContent =
                "Edit Announcement";
        }


        if (submitButton) {

            submitButton.textContent =
                "Update Announcement";
        }


        if (cancelButton) {

            cancelButton.style.display =
                "inline-flex";
        }


        if (form) {

            form.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }

    }


    /*
    =====================================================
    DELETE ANNOUNCEMENT
    =====================================================
    */

    async function deleteAnnouncement(id) {

        const confirmed =
            confirm(
                "Are you sure you want to delete this announcement?"
            );


        if (!confirmed) {
            return;
        }


        try {

            const {
                error
            } = await supabaseClient
                .from("announcements")
                .delete()
                .eq(
                    "id",
                    id
                );


            if (error) {
                throw error;
            }


            showMessage(
                "Announcement deleted successfully.",
                "success"
            );


            await loadAnnouncements();

        }


        catch (error) {

            console.error(
                "Delete failed:",
                error
            );


            showMessage(
                error.message ||
                "Failed to delete announcement.",
                "error"
            );

        }

    }


    /*
    =====================================================
    CANCEL EDIT
    =====================================================
    */

    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            () => {

                resetForm();

            }
        );

    }


    /*
    =====================================================
    RESET FORM
    =====================================================
    */

    function resetForm() {

        editingId = null;


        if (form) {
            form.reset();
        }


        if (categoryInput) {

            categoryInput.value =
                "General";
        }


        if (priorityInput) {

            priorityInput.value =
                "normal";
        }


        if (publishedInput) {

            publishedInput.checked =
                true;
        }


        if (formTitle) {

            formTitle.textContent =
                "Create Announcement";
        }


        if (submitButton) {

            submitButton.textContent =
                "Publish Announcement";
        }


        if (cancelButton) {

            cancelButton.style.display =
                "none";
        }

    }


    /*
    =====================================================
    MESSAGE
    =====================================================
    */

    function showMessage(
        text,
        type
    ) {

        if (!message) {
            return;
        }


        message.textContent =
            text;


        message.className =
            `admin-form-message ${type}`;


        setTimeout(
            () => {

                clearMessage();

            },
            4000
        );

    }


    function clearMessage() {

        if (!message) {
            return;
        }


        message.textContent =
            "";


        message.className =
            "admin-form-message";

    }


    /*
    =====================================================
    DATE FORMAT
    =====================================================
    */

    function formatDate(value) {

        if (!value) {

            return "Not published";
        }


        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "Unknown date";
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


    /*
    =====================================================
    ESCAPE HTML
    =====================================================
    */

    function escapeHTML(value) {

        return String(
            value ?? ""
        )
            .replaceAll(
                "&",
                "&amp;"
            )
            .replaceAll(
                "<",
                "&lt;"
            )
            .replaceAll(
                ">",
                "&gt;"
            )
            .replaceAll(
                '"',
                "&quot;"
            )
            .replaceAll(
                "'",
                "&#039;"
            );

    }


    /*
    =====================================================
    INITIALIZE
    =====================================================
    */

    const isAdmin =
        await checkAdmin();


    if (!isAdmin) {
        return;
    }


    await loadAnnouncements();

});