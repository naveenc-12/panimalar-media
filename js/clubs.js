"use strict";

/* =========================================================
   CLUBS PAGE
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    loadClubs();
});


/* =========================================================
   ESCAPE HTML
   Prevents club names/descriptions from injecting HTML
========================================================= */

function escapeClubHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================================================
   LOAD CLUBS
========================================================= */

async function loadClubs() {

    const container =
        document.getElementById("clubsGrid");

    if (!container) {
        return;
    }


    /* -----------------------------------------------------
       Check Supabase
    ----------------------------------------------------- */

    if (
        typeof supabaseClient === "undefined" ||
        !supabaseClient
    ) {

        console.error(
            "[Clubs] Supabase client is not available."
        );

        container.innerHTML = `
            <div class="clubs-error">
                Unable to connect to the club database.
            </div>
        `;

        return;
    }


    try {

        console.log("[Clubs] Loading clubs...");


        /* -------------------------------------------------
           Get published clubs only
        ------------------------------------------------- */

        const {
            data,
            error
        } = await supabaseClient
            .from("clubs")
            .select("*")
            .eq("published", true)
            .order("name", {
                ascending: true
            });


        if (error) {

            console.error(
                "[Clubs] Supabase error:",
                error
            );

            container.innerHTML = `
                <div class="clubs-error">
                    Unable to load clubs right now.
                </div>
            `;

            return;
        }


        console.log(
            `[Clubs] Loaded ${data?.length || 0} clubs.`
        );


        /* -------------------------------------------------
           No clubs
        ------------------------------------------------- */

        if (!data || data.length === 0) {

            container.innerHTML = `
                <div class="clubs-empty">

                    <h3>
                        No clubs available yet
                    </h3>

                    <p>
                        Club information will appear here
                        once it is published.
                    </p>

                </div>
            `;

            return;
        }


        /* -------------------------------------------------
           Render clubs
        ------------------------------------------------- */

        container.innerHTML =
            data
                .map(renderClub)
                .join("");


    } catch (error) {

        console.error(
            "[Clubs] Unexpected error:",
            error
        );

        container.innerHTML = `
            <div class="clubs-error">
                Something went wrong while loading clubs.
            </div>
        `;
    }
}


/* =========================================================
   RENDER CLUB
========================================================= */

function renderClub(club) {

    const name =
        escapeClubHTML(
            club.name
        );


    const description =
        escapeClubHTML(
            club.description || ""
        );


    const coordinator =
        escapeClubHTML(
            club.coordinator_name || ""
        );


    const email =
        escapeClubHTML(
            club.coordinator_email || ""
        );


    const logo =
        escapeClubHTML(
            club.logo_url || ""
        );


    /* -----------------------------------------------------
       Logo
    ----------------------------------------------------- */

    const logoHTML = logo
        ? `
            <img
                src="${logo}"
                alt="${name} logo"
                class="club-logo"
                loading="lazy"
            >
          `
        : `
            <span class="club-logo-placeholder">
                ${name.charAt(0).toUpperCase()}
            </span>
          `;


    /* -----------------------------------------------------
       Email
    ----------------------------------------------------- */

    const emailHTML = email
        ? `
            <a
                href="mailto:${email}"
                class="club-email"
            >
                ${email}
            </a>
          `
        : "";


    /* -----------------------------------------------------
       Card
    ----------------------------------------------------- */

    return `

        <article class="club-card">


            <div class="club-logo-wrap">

                ${logoHTML}

            </div>


            <h2 class="club-name">
                ${name}
            </h2>


            ${
                description
                    ? `
                        <p class="club-description">
                            ${description}
                        </p>
                      `
                    : ""
            }


            ${
                coordinator
                    ? `
                        <div class="club-coordinator">

                            <span class="club-coordinator-label">
                                Coordinator
                            </span>

                            <p class="club-coordinator-name">
                                ${coordinator}
                            </p>

                            ${emailHTML}

                        </div>
                      `
                    : ""
            }


        </article>

    `;
}