"use strict";

/*
=========================================================
PANIMALAR MEDIA
ADMIN DASHBOARD
=========================================================
*/

document.addEventListener("DOMContentLoaded", async () => {

    /*
    -----------------------------------------------------
    Check Supabase
    -----------------------------------------------------
    */

    if (typeof supabaseClient === "undefined") {
        console.error("Supabase client is not available.");
        return;
    }


    /*
    -----------------------------------------------------
    DOM ELEMENTS
    -----------------------------------------------------
    */

    const adminUserName =
        document.getElementById("adminUserName");

    const adminUserAvatar =
        document.getElementById("adminUserAvatar");

    const adminLogoutButton =
        document.getElementById("adminLogoutButton");

    const eventCount =
        document.getElementById("eventCount");

    const announcementCount =
        document.getElementById("announcementCount");

    const resourceCount =
        document.getElementById("resourceCount");

    const questionCount =
        document.getElementById("questionCount");

    const recentActivity =
        document.getElementById("recentActivity");


    /*
    =====================================================
    AUTHENTICATION
    =====================================================
    */

    async function checkAdminAccess() {

        try {

            const {
                data: {
                    user
                },
                error
            } = await supabaseClient.auth.getUser();


            if (error || !user) {

                window.location.href =
                    "index.html";

                return null;
            }


            /*
            -------------------------------------------------
            Check admin profile
            -------------------------------------------------
            */

            const {
                data: profile,
                error: profileError
            } = await supabaseClient
                .from("profiles")
                .select("id, email, full_name, role")
                .eq("id", user.id)
                .maybeSingle();


            if (profileError) {

                console.error(
                    "Profile error:",
                    profileError
                );

                showError(
                    "Unable to verify administrator access."
                );

                return null;
            }


            /*
            -------------------------------------------------
            Make sure user is admin
            -------------------------------------------------
            */

            if (!profile || profile.role !== "admin") {

                alert(
                    "You do not have administrator access."
                );

                await supabaseClient.auth.signOut();

                window.location.href =
                    "index.html";

                return null;
            }


            /*
            -------------------------------------------------
            Display admin information
            -------------------------------------------------
            */

            const displayName =
                profile.full_name ||
                profile.email ||
                user.email ||
                "Admin";


            if (adminUserName) {

                adminUserName.textContent =
                    displayName;

            }


            if (adminUserAvatar) {

                adminUserAvatar.textContent =
                    displayName
                        .charAt(0)
                        .toUpperCase();

            }


            return user;

        } catch (error) {

            console.error(
                "Authentication check failed:",
                error
            );

            window.location.href =
                "index.html";

            return null;
        }
    }


    /*
    =====================================================
    COUNT RECORDS
    =====================================================
    */

    async function getCount(tableName) {

        try {

            const {
                count,
                error
            } = await supabaseClient
                .from(tableName)
                .select("*", {
                    count: "exact",
                    head: true
                });


            if (error) {

                console.error(
                    `Error counting ${tableName}:`,
                    error
                );

                return 0;
            }


            return count || 0;

        } catch (error) {

            console.error(
                `Count failed for ${tableName}:`,
                error
            );

            return 0;
        }
    }


    /*
    =====================================================
    LOAD STATISTICS
    =====================================================
    */

    async function loadStatistics() {

        /*
        -------------------------------------------------
        These table names must match the Supabase
        tables we created.
        -------------------------------------------------
        */

        const [
            events,
            announcements,
            resources,
            questions
        ] = await Promise.all([

            getCount("events"),

            getCount("announcements"),

            getCount("resources"),

            getCount("questions")

        ]);


        if (eventCount) {

            eventCount.textContent =
                events;

        }


        if (announcementCount) {

            announcementCount.textContent =
                announcements;

        }


        if (resourceCount) {

            resourceCount.textContent =
                resources;

        }


        if (questionCount) {

            questionCount.textContent =
                questions;

        }
    }


    /*
    =====================================================
    RECENT ACTIVITY
    =====================================================
    */

    async function loadRecentActivity() {

        if (!recentActivity) {
            return;
        }


        recentActivity.innerHTML = "";


        const activityItems = [];


        /*
        -------------------------------------------------
        EVENTS
        -------------------------------------------------
        */

        try {

            const {
                data,
                error
            } = await supabaseClient
                .from("events")
                .select("*")
                .order("created_at", {
                    ascending: false
                })
                .limit(5);


            if (!error && data) {

                data.forEach(item => {

                    activityItems.push({

                        title:
                            item.title ||
                            "Untitled event",

                        type:
                            "Event",

                        date:
                            item.created_at ||
                            item.date ||
                            null

                    });

                });

            }

        } catch (error) {

            console.error(
                "Could not load events:",
                error
            );

        }


        /*
        -------------------------------------------------
        ANNOUNCEMENTS
        -------------------------------------------------
        */

        try {

            const {
                data,
                error
            } = await supabaseClient
                .from("announcements")
                .select("*")
                .order("created_at", {
                    ascending: false
                })
                .limit(5);


            if (!error && data) {

                data.forEach(item => {

                    activityItems.push({

                        title:
                            item.title ||
                            "Untitled announcement",

                        type:
                            "Announcement",

                        date:
                            item.created_at ||
                            item.date ||
                            null

                    });

                });

            }

        } catch (error) {

            console.error(
                "Could not load announcements:",
                error
            );

        }


        /*
        -------------------------------------------------
        RESOURCES
        -------------------------------------------------
        */

        try {

            const {
                data,
                error
            } = await supabaseClient
                .from("resources")
                .select("*")
                .order("created_at", {
                    ascending: false
                })
                .limit(5);


            if (!error && data) {

                data.forEach(item => {

                    activityItems.push({

                        title:
                            item.title ||
                            "Untitled resource",

                        type:
                            "Resource",

                        date:
                            item.created_at ||
                            item.date ||
                            null

                    });

                });

            }

        } catch (error) {

            console.error(
                "Could not load resources:",
                error
            );

        }


        /*
        -------------------------------------------------
        SORT EVERYTHING
        -------------------------------------------------
        */

        activityItems.sort((a, b) => {

            const dateA =
                a.date
                    ? new Date(a.date).getTime()
                    : 0;

            const dateB =
                b.date
                    ? new Date(b.date).getTime()
                    : 0;

            return dateB - dateA;

        });


        /*
        -------------------------------------------------
        SHOW ONLY 8
        -------------------------------------------------
        */

        const latestItems =
            activityItems.slice(0, 8);


        if (latestItems.length === 0) {

            recentActivity.innerHTML = `
                <div class="admin-loading">
                    No recent activity yet.
                </div>
            `;

            return;
        }


        latestItems.forEach(item => {

            const element =
                document.createElement("div");


            element.className =
                "admin-activity-item";


            const formattedDate =
                formatDate(item.date);


            element.innerHTML = `

                <div class="admin-activity-dot"></div>

                <div class="admin-activity-info">

                    <strong>
                        ${escapeHTML(item.title)}
                    </strong>

                    <span>
                        ${formattedDate}
                    </span>

                </div>

                <div class="admin-activity-type">
                    ${escapeHTML(item.type)}
                </div>

            `;


            recentActivity.appendChild(
                element
            );

        });

    }


    /*
    =====================================================
    DATE FORMATTER
    =====================================================
    */

    function formatDate(dateValue) {

        if (!dateValue) {

            return "Recently";

        }


        const date =
            new Date(dateValue);


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


    /*
    =====================================================
    HTML ESCAPE
    =====================================================
    */

    function escapeHTML(value) {

        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");

    }


    /*
    =====================================================
    LOGOUT
    =====================================================
    */

    if (adminLogoutButton) {

        adminLogoutButton.addEventListener(
            "click",
            async () => {

                const confirmed =
                    confirm(
                        "Are you sure you want to sign out?"
                    );


                if (!confirmed) {
                    return;
                }


                const {
                    error
                } =
                    await supabaseClient
                        .auth
                        .signOut();


                if (error) {

                    console.error(
                        "Logout failed:",
                        error
                    );

                    alert(
                        "Unable to sign out. Please try again."
                    );

                    return;
                }


                window.location.href =
                    "index.html";

            }
        );

    }


    /*
    =====================================================
    IMPORTANT
    =====================================================

    Sidebar navigation is intentionally NOT handled
    here.

    Your sidebar already uses normal HTML links:

        events.html
        announcements.html
        resources.html
        gallery.html
        bus-routes.html
        questions.html

    Therefore the browser should handle navigation
    naturally.

    The old code displayed:

        "management will be added next."

    That code has been removed.

    =====================================================
    */


    /*
    =====================================================
    INITIALIZE DASHBOARD
    =====================================================
    */

    const user =
        await checkAdminAccess();


    if (!user) {
        return;
    }


    await Promise.all([

        loadStatistics(),

        loadRecentActivity()

    ]);


    console.log(
        "Panimalar Media Admin Dashboard loaded."
    );

});