"use strict";

/*
=========================================================
PANIMALAR MEDIA
PUBLIC BUS ROUTES
SUPABASE VERSION
=========================================================
*/


document.addEventListener("DOMContentLoaded", () => {


    // =====================================================
    // ELEMENTS
    // =====================================================

    const container =
        document.getElementById("busRoutesContainer");

    const emptyState =
        document.getElementById("busRoutesEmpty");

    const originSelect =
        document.getElementById("busOrigin");


    if (!container) {
        console.error(
            "busRoutesContainer was not found."
        );
        return;
    }


    if (!originSelect) {
        console.error(
            "busOrigin was not found."
        );
        return;
    }


    // =====================================================
    // DATA
    // =====================================================

    let allRoutes = [];


    // =====================================================
    // START
    // =====================================================

    loadBusRoutes();


    // =====================================================
    // LOAD FROM SUPABASE
    // =====================================================

    async function loadBusRoutes() {

        showLoading();


        try {

            if (
                typeof supabaseClient ===
                "undefined"
            ) {

                throw new Error(
                    "Supabase client is not available."
                );

            }


            const {
                data,
                error
            } = await supabaseClient

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
                    active
                `)

                .eq(
                    "active",
                    true
                )

                .order(
                    "route_name",
                    {
                        ascending: true
                    }
                );


            if (error) {
                throw error;
            }


            allRoutes =
                data || [];


            populateOriginFilter(
                allRoutes
            );


            renderRoutes(
                allRoutes
            );


        } catch (error) {

            console.error(
                "Failed to load bus routes:",
                error
            );


            container.innerHTML = "";


            emptyState.hidden = false;


            const heading =
                emptyState.querySelector("h3");

            const paragraph =
                emptyState.querySelector("p");


            if (heading) {
                heading.textContent =
                    "Unable to load bus routes";
            }


            if (paragraph) {
                paragraph.textContent =
                    "Please try again later.";
            }

        }

    }


    // =====================================================
    // POPULATE STARTING POINT FILTER
    // =====================================================

    function populateOriginFilter(
        routes
    ) {

        const origins =
            [
                ...new Set(
                    routes
                        .map(
                            route =>
                                route.starting_point
                        )
                        .filter(Boolean)
                )
            ]
            .sort(
                (a, b) =>
                    a.localeCompare(b)
            );


        originSelect.innerHTML = `
            <option value="All">
                All locations
            </option>
        `;


        origins.forEach(
            origin => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    origin;

                option.textContent =
                    origin;

                originSelect.appendChild(
                    option
                );

            }
        );

    }


    // =====================================================
    // FILTER
    // =====================================================

    originSelect.addEventListener(
        "change",
        () => {

            const selected =
                originSelect.value;


            if (
                selected ===
                "All"
            ) {

                renderRoutes(
                    allRoutes
                );

                return;
            }


            const filtered =
                allRoutes.filter(
                    route =>
                        route.starting_point ===
                        selected
                );


            renderRoutes(
                filtered
            );

        }
    );


    // =====================================================
    // RENDER
    // =====================================================

    function renderRoutes(
        routes
    ) {

        container.innerHTML = "";


        if (
            !routes ||
            routes.length === 0
        ) {

            emptyState.hidden = false;

            return;
        }


        emptyState.hidden = true;


        routes.forEach(
            route => {

                container.insertAdjacentHTML(
                    "beforeend",
                    createRouteCard(route)
                );

            }
        );

    }


    // =====================================================
    // ROUTE CARD
    // =====================================================

    function createRouteCard(
        route
    ) {

        const routeName =
            escapeHtml(
                route.route_name ||
                "Bus Route"
            );


        const busNumber =
            escapeHtml(
                route.bus_number ||
                "N/A"
            );


        const startingPoint =
            escapeHtml(
                route.starting_point ||
                "Not specified"
            );


        const destination =
            escapeHtml(
                route.destination ||
                "Not specified"
            );


        const stops =
            escapeHtml(
                route.stops ||
                "Stops not specified"
            );


        const notes =
            escapeHtml(
                route.notes ||
                ""
            );


        const departure =
            formatTime(
                route.departure_time
            );


        const arrival =
            formatTime(
                route.arrival_time
            );


        return `

            <article class="card bus-card">

                <div class="bus-no">
                    ${busNumber}
                </div>


                <div class="bus-main">

                    <div class="bus-route">
                        ${routeName}
                    </div>


                    <div class="bus-stops">

                        ${startingPoint}

                        <span>
                            →
                        </span>

                        ${destination}

                    </div>


                    <div class="bus-times">

                        <div>

                            <span>
                                Departure
                            </span>

                            ${departure}

                        </div>


                        <div>

                            <span>
                                Arrival
                            </span>

                            ${arrival}

                        </div>

                    </div>


                    ${
                        route.stops
                            ? `

                                <div
                                    class="bus-stops"
                                    style="
                                        margin-top:10px;
                                    "
                                >

                                    <strong>
                                        Stops:
                                    </strong>

                                    ${stops}

                                </div>

                              `
                            : ""
                    }


                    ${
                        route.notes
                            ? `

                                <div class="bus-note">

                                    <span>
                                        ℹ
                                    </span>

                                    <span>
                                        ${notes}
                                    </span>

                                </div>

                              `
                            : ""
                    }

                </div>

            </article>

        `;

    }


    // =====================================================
    // TIME FORMAT
    // =====================================================

    function formatTime(
        time
    ) {

        if (!time) {
            return "—";
        }


        const parts =
            time.split(":");


        if (
            parts.length < 2
        ) {

            return time;

        }


        let hours =
            parseInt(
                parts[0],
                10
            );


        const minutes =
            parts[1];


        if (
            Number.isNaN(hours)
        ) {

            return time;

        }


        const suffix =
            hours >= 12
                ? "PM"
                : "AM";


        hours =
            hours % 12 || 12;


        return `${hours}:${minutes} ${suffix}`;

    }


    // =====================================================
    // LOADING
    // =====================================================

    function showLoading() {

        emptyState.hidden = true;


        container.innerHTML = `

            <div
                class="empty"
                style="
                    grid-column:1/-1;
                "
            >

                <div class="big">
                    🚌
                </div>

                <p>
                    Loading bus routes...
                </p>

            </div>

        `;

    }


    // =====================================================
    // ESCAPE HTML
    // =====================================================

    function escapeHtml(
        value
    ) {

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

});