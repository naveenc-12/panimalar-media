"use strict";

/*
=========================================================
PANIMALAR MEDIA
PUBLIC — ANNOUNCEMENTS
Loads announcements dynamically from Supabase
=========================================================
*/

document.addEventListener("DOMContentLoaded", async () => {

    // -----------------------------------------------------
    // CHECK SUPABASE
    // -----------------------------------------------------

    if (typeof supabaseClient === "undefined") {
        console.error("Supabase client is not available.");
        return;
    }


    // -----------------------------------------------------
    // GET CONTAINER
    // -----------------------------------------------------

    const container =
        document.getElementById("announcementsList") ||
        document.getElementById("announcementList") ||
        document.querySelector(".announcements-list");

    if (!container) {
        console.error(
            "Announcements container not found."
        );
        return;
    }


    // -----------------------------------------------------
    // LOAD ANNOUNCEMENTS
    // -----------------------------------------------------

    async function loadAnnouncements() {

        container.innerHTML = `
            <div class="admin-loading">
                Loading announcements...
            </div>
        `;


        const {
            data,
            error
        } = await supabaseClient
            .from("announcements")
            .select("*")
            .eq("published", true)
            .order("published_at", {
                ascending: false,
                nullsFirst: false
            });


        if (error) {

            console.error(
                "Failed to load announcements:",
                error
            );

            container.innerHTML = `
                <div class="empty">
                    <div class="big">—</div>
                    <h4>
                        Unable to load announcements
                    </h4>
                    <p>
                        Please try again later.
                    </p>
                </div>
            `;

            return;
        }


        if (!data || data.length === 0) {

            container.innerHTML = `
                <div class="empty">
                    <div class="big">—</div>
                    <h4>
                        No announcements yet
                    </h4>
                    <p>
                        Check back soon for updates.
                    </p>
                </div>
            `;

            return;
        }


        // -------------------------------------------------
        // RENDER
        // -------------------------------------------------

        container.innerHTML =
            data.map(
                announcement =>
                    createAnnouncement(
                        announcement
                    )
            ).join("");
    }


    // -----------------------------------------------------
    // CREATE ANNOUNCEMENT HTML
    // -----------------------------------------------------

    function createAnnouncement(announcement) {

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

        const category =
            escapeHTML(
                announcement.category ||
                "General"
            );

        const priority =
            announcement.priority ||
            "normal";

        const date =
            formatDate(
                announcement.published_at
            );


        const priorityClass =
            priority.toLowerCase();


        return `
            <div class="ann-list-item">

                <span
                    class="ann-dot"
                    style="
                        background:
                        ${getAnnouncementColor(
                            category
                        )};
                        margin-top:8px;
                    "
                ></span>

                <div>

                    ${
                        priority === "urgent"
                        ? `
                            <span
                                class="badge badge-pink"
                                style="margin-bottom:6px;"
                            >
                                🚨 Urgent
                            </span>
                        `
                        : ""
                    }

                    ${
                        priority === "important"
                        ? `
                            <span
                                class="badge badge-pink"
                                style="margin-bottom:6px;"
                            >
                                📌 Important
                            </span>
                        `
                        : ""
                    }

                    <h5
                        style="
                            font-size:15px;
                            margin-bottom:4px;
                        "
                    >
                        ${title}
                    </h5>

                    <p
                        class="muted"
                        style="
                            font-size:13px;
                            margin-top:4px;
                        "
                    >
                        ${content}
                    </p>

                    <div
                        class="meta"
                        style="
                            margin-top:6px;
                            font-family:var(--font-mono);
                            font-size:11px;
                            color:var(--text-faint);
                        "
                    >
                        ${category.toUpperCase()}
                        ·
                        ${date}
                    </div>

                </div>

            </div>
        `;
    }


    // -----------------------------------------------------
    // DATE FORMAT
    // -----------------------------------------------------

    function formatDate(value) {

        if (!value) {
            return "Recently";
        }

        const date =
            new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "Recently";
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


    // -----------------------------------------------------
    // CATEGORY COLOR
    // -----------------------------------------------------

    function getAnnouncementColor(category) {

        const value =
            category.toLowerCase();


        if (value.includes("deadline")) {
            return "#ff4d6d";
        }

        if (value.includes("event")) {
            return "#7c5cff";
        }

        if (value.includes("bus")) {
            return "#00b894";
        }

        if (value.includes("recruit")) {
            return "#f39c12";
        }

        if (value.includes("workshop")) {
            return "#3498db";
        }

        if (value.includes("notice")) {
            return "#9b59b6";
        }

        return "#7c5cff";
    }


    // -----------------------------------------------------
    // ESCAPE HTML
    // -----------------------------------------------------

    function escapeHTML(value) {

        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }


    // -----------------------------------------------------
    // INITIAL LOAD
    // -----------------------------------------------------

    await loadAnnouncements();

});