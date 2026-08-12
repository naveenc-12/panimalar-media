// ============================================================
// PANIMALAR MEDIA - BUS ROUTES ADMIN
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    // --------------------------------------------------------
    // ELEMENTS
    // --------------------------------------------------------

    const form = document.getElementById("busRouteForm");

    const routeId = document.getElementById("routeId");
    const routeName = document.getElementById("routeName");
    const busNumber = document.getElementById("busNumber");
    const startingPoint = document.getElementById("startingPoint");
    const destination = document.getElementById("destination");
    const departureTime = document.getElementById("departureTime");
    const arrivalTime = document.getElementById("arrivalTime");
    const stops = document.getElementById("stops");
    const notes = document.getElementById("notes");
    const active = document.getElementById("active");

    const saveBtn = document.getElementById("saveBtn");
    const cancelBtn = document.getElementById("cancelBtn");

    const routesList = document.getElementById("routesList");
    const routeCount = document.getElementById("routeCount");

    const message = document.getElementById("message");
    const formTitle = document.getElementById("formTitle");

    // --------------------------------------------------------
    // CHECK SUPABASE
    // --------------------------------------------------------

    if (typeof supabase === "undefined") {
        console.error("Supabase library is not loaded.");
        showMessage(
            "Supabase library is not loaded. Check your HTML script tags.",
            "error"
        );
        return;
    }

    // Your js/supabase.js should create the client.
    // We expect the variable to be named "supabaseClient".
    if (typeof supabaseClient === "undefined") {
        console.error("supabaseClient is not defined.");
        showMessage(
            "Supabase connection is not available. Check js/supabase.js.",
            "error"
        );
        return;
    }

    // --------------------------------------------------------
    // LOAD ROUTES
    // --------------------------------------------------------

    loadRoutes();


    // --------------------------------------------------------
    // LOAD ALL ROUTES
    // --------------------------------------------------------

    async function loadRoutes() {

        routesList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🚌</div>
                <p>Loading bus routes...</p>
            </div>
        `;

        try {

            const { data, error } = await supabaseClient
                .from("bus_routes")
                .select(`
                    id,
                    route_name,
                    bus_number,
                    starting_point,
                    destination,
                    departure_time,
                    arrival_time,
                    stops,
                    notes,
                    active,
                    created_at
                `)
                .order("created_at", {
                    ascending: false
                });

            if (error) {
                throw error;
            }

            renderRoutes(data || []);

        } catch (error) {

            console.error("Failed to load bus routes:", error);

            routesList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">⚠️</div>
                    <p>Failed to load bus routes.</p>
                    <small>${escapeHtml(error.message)}</small>
                </div>
            `;

            routeCount.textContent = "0 routes";
        }
    }


    // --------------------------------------------------------
    // RENDER ROUTES
    // --------------------------------------------------------

    function renderRoutes(routes) {

        routeCount.textContent =
            `${routes.length} ${routes.length === 1 ? "route" : "routes"}`;

        if (routes.length === 0) {

            routesList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🚌</div>
                    <p>No bus routes yet.</p>
                    <small>Add your first bus route using the form.</small>
                </div>
            `;

            return;
        }

        routesList.innerHTML = routes
            .map(route => createRouteHTML(route))
            .join("");

        // ----------------------------------------------------
        // EDIT BUTTONS
        // ----------------------------------------------------

        document.querySelectorAll(".edit-btn").forEach(button => {

            button.addEventListener("click", () => {

                const id = button.dataset.id;

                const route = routes.find(item => item.id === id);

                if (route) {
                    editRoute(route);
                }

            });

        });


        // ----------------------------------------------------
        // DELETE BUTTONS
        // ----------------------------------------------------

        document.querySelectorAll(".delete-btn").forEach(button => {

            button.addEventListener("click", async () => {

                const id = button.dataset.id;

                await deleteRoute(id);

            });

        });

    }


    // --------------------------------------------------------
    // CREATE ROUTE HTML
    // --------------------------------------------------------

    function createRouteHTML(route) {

        const statusClass = route.active
            ? "active"
            : "inactive";

        const statusText = route.active
            ? "ACTIVE"
            : "INACTIVE";


        return `
            <div class="route-item">

                <div class="route-top">

                    <div>

                        <div class="route-title">
                            ${escapeHtml(route.route_name)}
                        </div>

                        ${
                            route.bus_number
                                ? `
                                    <div class="route-number">
                                        Bus ${escapeHtml(route.bus_number)}
                                    </div>
                                  `
                                : ""
                        }

                    </div>

                    <span class="status ${statusClass}">
                        ${statusText}
                    </span>

                </div>


                <div class="route-path">

                    <span>
                        ${escapeHtml(route.starting_point || "Not specified")}
                    </span>

                    <span class="route-arrow">
                        →
                    </span>

                    <span>
                        ${escapeHtml(route.destination || "Not specified")}
                    </span>

                </div>


                <div class="route-info">

                    <div class="info-item">

                        <span class="info-label">
                            Departure
                        </span>

                        <span class="info-value">
                            ${formatTime(route.departure_time)}
                        </span>

                    </div>


                    <div class="info-item">

                        <span class="info-label">
                            Arrival
                        </span>

                        <span class="info-value">
                            ${formatTime(route.arrival_time)}
                        </span>

                    </div>

                </div>


                ${
                    route.stops
                        ? `
                            <div class="route-stops">
                                <strong>Stops:</strong>
                                ${escapeHtml(route.stops)}
                            </div>
                          `
                        : ""
                }


                ${
                    route.notes
                        ? `
                            <div class="route-notes">
                                <strong>Notes:</strong>
                                ${escapeHtml(route.notes)}
                            </div>
                          `
                        : ""
                }


                <div class="route-actions">

                    <button
                        type="button"
                        class="edit-btn"
                        data-id="${route.id}"
                    >
                        ✏️ Edit
                    </button>

                    <button
                        type="button"
                        class="delete-btn"
                        data-id="${route.id}"
                    >
                        🗑️ Delete
                    </button>

                </div>

            </div>
        `;
    }


    // --------------------------------------------------------
    // ADD / UPDATE ROUTE
    // --------------------------------------------------------

    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        const id = routeId.value.trim();

        const routeData = {

            route_name: routeName.value.trim(),

            bus_number:
                busNumber.value.trim() || null,

            starting_point:
                startingPoint.value.trim() || null,

            destination:
                destination.value.trim() || null,

            departure_time:
                departureTime.value || null,

            arrival_time:
                arrivalTime.value || null,

            stops:
                stops.value.trim() || null,

            notes:
                notes.value.trim() || null,

            active:
                active.checked

        };


        // Route name is required
        if (!routeData.route_name) {

            showMessage(
                "Please enter a route name.",
                "error"
            );

            routeName.focus();

            return;
        }


        saveBtn.disabled = true;

        saveBtn.textContent =
            id ? "Updating..." : "Adding...";


        try {

            let result;


            // ------------------------------------------------
            // UPDATE
            // ------------------------------------------------

            if (id) {

                result = await supabaseClient
                    .from("bus_routes")
                    .update(routeData)
                    .eq("id", id)
                    .select()
                    .single();

            }


            // ------------------------------------------------
            // INSERT
            // ------------------------------------------------

            else {

                result = await supabaseClient
                    .from("bus_routes")
                    .insert([routeData])
                    .select()
                    .single();

            }


            if (result.error) {
                throw result.error;
            }


            showMessage(
                id
                    ? "Bus route updated successfully."
                    : "Bus route added successfully.",
                "success"
            );


            resetForm();

            await loadRoutes();


        } catch (error) {

            console.error(
                "Failed to save bus route:",
                error
            );

            showMessage(
                error.message ||
                "Failed to save bus route.",
                "error"
            );

        } finally {

            saveBtn.disabled = false;

            saveBtn.textContent = "Add Route";

        }

    });


    // --------------------------------------------------------
    // EDIT ROUTE
    // --------------------------------------------------------

    function editRoute(route) {

        routeId.value =
            route.id || "";

        routeName.value =
            route.route_name || "";

        busNumber.value =
            route.bus_number || "";

        startingPoint.value =
            route.starting_point || "";

        destination.value =
            route.destination || "";

        departureTime.value =
            convertTimeForInput(route.departure_time);

        arrivalTime.value =
            convertTimeForInput(route.arrival_time);

        stops.value =
            route.stops || "";

        notes.value =
            route.notes || "";

        active.checked =
            route.active !== false;


        formTitle.textContent =
            "Edit Bus Route";

        saveBtn.textContent =
            "Update Route";

        cancelBtn.classList.add("show");


        // Scroll to form
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }


    // --------------------------------------------------------
    // CANCEL EDIT
    // --------------------------------------------------------

    cancelBtn.addEventListener("click", () => {

        resetForm();

    });


    // --------------------------------------------------------
    // RESET FORM
    // --------------------------------------------------------

    function resetForm() {

        form.reset();

        routeId.value = "";

        active.checked = true;

        formTitle.textContent =
            "Add Bus Route";

        saveBtn.textContent =
            "Add Route";

        cancelBtn.classList.remove("show");

    }


    // --------------------------------------------------------
    // DELETE ROUTE
    // --------------------------------------------------------

    async function deleteRoute(id) {

        const confirmed = confirm(
            "Are you sure you want to delete this bus route?"
        );

        if (!confirmed) {
            return;
        }


        try {

            const { error } = await supabaseClient
                .from("bus_routes")
                .delete()
                .eq("id", id);


            if (error) {
                throw error;
            }


            showMessage(
                "Bus route deleted successfully.",
                "success"
            );


            // If deleted route was being edited
            if (routeId.value === id) {
                resetForm();
            }


            await loadRoutes();


        } catch (error) {

            console.error(
                "Failed to delete bus route:",
                error
            );

            showMessage(
                error.message ||
                "Failed to delete bus route.",
                "error"
            );

        }

    }


    // --------------------------------------------------------
    // FORMAT TIME
    // --------------------------------------------------------

    function formatTime(time) {

        if (!time) {
            return "Not specified";
        }


        const parts = time.split(":");

        if (parts.length < 2) {
            return time;
        }


        let hours =
            parseInt(parts[0], 10);

        const minutes =
            parts[1];


        if (isNaN(hours)) {
            return time;
        }


        const ampm =
            hours >= 12
                ? "PM"
                : "AM";


        hours =
            hours % 12 || 12;


        return `${hours}:${minutes} ${ampm}`;

    }


    // --------------------------------------------------------
    // CONVERT TIME FOR HTML INPUT
    // --------------------------------------------------------

    function convertTimeForInput(time) {

        if (!time) {
            return "";
        }


        // Supabase normally returns HH:MM:SS
        // HTML time input expects HH:MM

        return time.substring(0, 5);

    }


    // --------------------------------------------------------
    // MESSAGE
    // --------------------------------------------------------

    function showMessage(text, type) {

        message.textContent = text;

        message.className =
            `message show ${type}`;


        setTimeout(() => {

            message.classList.remove("show");

        }, 5000);

    }


    // --------------------------------------------------------
    // HTML ESCAPE
    // --------------------------------------------------------

    function escapeHtml(value) {

        if (value === null || value === undefined) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    // --------------------------------------------------------
    // LOGOUT
    // --------------------------------------------------------

    const logoutBtn =
        document.getElementById("logoutBtn");


    if (logoutBtn) {

        logoutBtn.addEventListener("click", async () => {

            try {

                if (
                    typeof supabaseClient !== "undefined" &&
                    supabaseClient.auth
                ) {

                    await supabaseClient.auth.signOut();

                }

            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );

            }


            window.location.href =
                "index.html";

        });

    }

});