"use strict";


/* =========================================================
   CLUBS ADMIN
========================================================= */


let editingClubId = null;

let existingLogoUrl = null;


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log("[Admin Clubs] Initializing...");


        if (
            typeof supabaseClient === "undefined" ||
            !supabaseClient
        ) {

            console.error(
                "[Admin Clubs] Supabase client unavailable."
            );

            alert(
                "Supabase connection is not available."
            );

            return;
        }


        setupClubForm();

        setupLogoPreview();

        setupCancelButton();

        setupLogout();


        await loadClubs();

    }
);



/* =========================================================
   FORM SETUP
========================================================= */

function setupClubForm() {

    const form =
        document.getElementById("clubForm");


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        handleClubSubmit
    );

}



/* =========================================================
   LOGO PREVIEW
========================================================= */

function setupLogoPreview() {

    const input =
        document.getElementById("clubLogo");

    const preview =
        document.getElementById("clubLogoPreview");

    const previewImage =
        document.getElementById(
            "clubLogoPreviewImage"
        );


    if (!input) {
        return;
    }


    input.addEventListener(
        "change",
        () => {

            const file =
                input.files?.[0];


            if (!file) {

                preview.style.display =
                    "none";

                return;
            }


            const reader =
                new FileReader();


            reader.onload =
                (event) => {

                    previewImage.src =
                        event.target.result;

                    preview.style.display =
                        "flex";

                };


            reader.readAsDataURL(file);

        }
    );

}



/* =========================================================
   CANCEL EDIT
========================================================= */

function setupCancelButton() {

    const button =
        document.getElementById(
            "clubCancel"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        resetClubForm
    );

}



/* =========================================================
   SUBMIT CLUB
========================================================= */

async function handleClubSubmit(event) {

    event.preventDefault();


    const submitButton =
        document.getElementById(
            "clubSubmit"
        );


    const name =
        document
            .getElementById("clubName")
            .value
            .trim();


    const description =
        document
            .getElementById("clubDescription")
            .value
            .trim();


    const coordinatorName =
        document
            .getElementById("coordinatorName")
            .value
            .trim();


    const coordinatorEmail =
        document
            .getElementById("coordinatorEmail")
            .value
            .trim();


    const published =
        document
            .getElementById("clubPublished")
            .checked;


    const logoInput =
        document.getElementById(
            "clubLogo"
        );


    const logoFile =
        logoInput.files?.[0] || null;


    if (!name) {

        alert(
            "Please enter the club name."
        );

        return;
    }


    try {

        submitButton.disabled = true;

        submitButton.textContent =
            editingClubId
                ? "Saving..."
                : "Adding...";


        /* =================================================
           UPLOAD LOGO IF SELECTED
        ================================================== */

        let logoUrl =
            existingLogoUrl;


        if (logoFile) {

            logoUrl =
                await uploadClubLogo(
                    logoFile
                );

        }


        /* =================================================
           CREATE / UPDATE DATA
        ================================================== */

        const clubData = {

            name,

            description:
                description || null,

            logo_url:
                logoUrl || null,

            coordinator_name:
                coordinatorName || null,

            coordinator_email:
                coordinatorEmail || null,

            published

        };


        let result;


        /* =================================================
           UPDATE
        ================================================== */

        if (editingClubId) {

            result =
                await supabaseClient
                    .from("clubs")
                    .update(clubData)
                    .eq(
                        "id",
                        editingClubId
                    );

        }


        /* =================================================
           INSERT
        ================================================== */

        else {

            result =
                await supabaseClient
                    .from("clubs")
                    .insert(
                        clubData
                    );

        }


        if (result.error) {

            throw result.error;

        }


        alert(
            editingClubId
                ? "Club updated successfully."
                : "Club added successfully."
        );


        resetClubForm();

        await loadClubs();


    } catch (error) {

        console.error(
            "[Admin Clubs] Save error:",
            error
        );


        alert(
            "Failed to save club:\n\n" +
            error.message
        );


    } finally {

        submitButton.disabled =
            false;

        submitButton.textContent =
            editingClubId
                ? "Save Changes"
                : "Add Club";

    }

}



/* =========================================================
   UPLOAD CLUB LOGO
========================================================= */

async function uploadClubLogo(file) {

    console.log(
        "[Admin Clubs] Uploading logo:",
        file.name
    );


    const safeName =
        file.name
            .replace(
                /[^a-zA-Z0-9._-]/g,
                "-"
            );


    const uniqueName =
        `${Date.now()}-${safeName}`;


    const filePath =
        `clubs/${uniqueName}`;


    /*
       Uses the existing "media"
       Supabase Storage bucket.
    */

    const {
        error
    } =
        await supabaseClient
            .storage
            .from("media")
            .upload(
                filePath,
                file,
                {
                    cacheControl:
                        "3600",

                    upsert:
                        false,

                    contentType:
                        file.type
                }
            );


    if (error) {

        console.error(
            "[Admin Clubs] Logo upload error:",
            error
        );

        throw error;

    }


    const {
        data
    } =
        supabaseClient
            .storage
            .from("media")
            .getPublicUrl(
                filePath
            );


    if (!data?.publicUrl) {

        throw new Error(
            "Could not generate public logo URL."
        );

    }


    console.log(
        "[Admin Clubs] Logo uploaded."
    );


    return data.publicUrl;

}



/* =========================================================
   LOAD EXISTING CLUBS
========================================================= */

async function loadClubs() {

    const list =
        document.getElementById(
            "clubList"
        );


    if (!list) {
        return;
    }


    list.innerHTML = `
        <div class="admin-loading">
            Loading clubs...
        </div>
    `;


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("clubs")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (error) {
            throw error;
        }


        if (
            !data ||
            data.length === 0
        ) {

            list.innerHTML = `
                <div class="admin-empty">
                    No clubs have been added yet.
                </div>
            `;

            return;
        }


        list.innerHTML =
            data
                .map(
                    renderAdminClub
                )
                .join("");


        attachClubActions();


    } catch (error) {

        console.error(
            "[Admin Clubs] Load error:",
            error
        );


        list.innerHTML = `
            <div class="admin-error">
                Failed to load clubs.
            </div>
        `;

    }

}



/* =========================================================
   RENDER ADMIN CLUB
========================================================= */

function renderAdminClub(club) {

    const logo =
        club.logo_url
            ? `
                <img
                    src="${escapeHTML(club.logo_url)}"
                    alt=""
                    class="admin-club-logo"
                >
              `
            : `
                <div class="admin-club-logo-placeholder">
                    ${escapeHTML(
                        (club.name || "?")
                            .charAt(0)
                            .toUpperCase()
                    )}
                </div>
              `;


    const status =
        club.published
            ? `
                <span class="admin-status published">
                    Published
                </span>
              `
            : `
                <span class="admin-status draft">
                    Hidden
                </span>
              `;


    return `

        <div
            class="admin-club-item"
            data-club-id="${escapeHTML(club.id)}"
        >

            <!-- CLUB INFORMATION -->

            <div class="admin-club-info">

                <!-- LOGO -->

                <div class="admin-club-logo-wrap">
                    ${logo}
                </div>


                <!-- DETAILS -->

                <div class="admin-club-details">

                    <h3>
                        ${escapeHTML(club.name)}
                    </h3>


                    ${
                        club.coordinator_name
                            ? `
                                <p>
                                    Coordinator:
                                    ${escapeHTML(
                                        club.coordinator_name
                                    )}
                                </p>
                              `
                            : ""
                    }


                    ${status}

                </div>

            </div>


            <!-- ACTION BUTTONS -->

            <div class="admin-club-actions">

                <button
                    type="button"
                    class="admin-secondary-button club-edit-button"
                    data-id="${escapeHTML(club.id)}"
                >
                    Edit
                </button>


                <button
                    type="button"
                    class="admin-danger-button club-delete-button"
                    data-id="${escapeHTML(club.id)}"
                >
                    Delete
                </button>

            </div>

        </div>

    `;
}



/* =========================================================
   ATTACH ACTION BUTTONS
========================================================= */

function attachClubActions() {


    document
        .querySelectorAll(
            ".club-edit-button"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        editClub(
                            button.dataset.id
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            ".club-delete-button"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        deleteClub(
                            button.dataset.id
                        );

                    }
                );

            }
        );

}



/* =========================================================
   EDIT CLUB
========================================================= */

async function editClub(id) {

    try {

        const {
            data: club,
            error
        } =
            await supabaseClient
                .from("clubs")
                .select("*")
                .eq(
                    "id",
                    id
                )
                .single();


        if (error) {
            throw error;
        }


        editingClubId =
            club.id;


        existingLogoUrl =
            club.logo_url || null;


        document
            .getElementById("clubName")
            .value =
            club.name || "";


        document
            .getElementById("clubDescription")
            .value =
            club.description || "";


        document
            .getElementById("coordinatorName")
            .value =
            club.coordinator_name || "";


        document
            .getElementById("coordinatorEmail")
            .value =
            club.coordinator_email || "";


        document
            .getElementById("clubPublished")
            .checked =
            club.published;


        /* =================================================
           EXISTING LOGO PREVIEW
        ================================================== */

        if (club.logo_url) {

            const preview =
                document.getElementById(
                    "clubLogoPreview"
                );

            const image =
                document.getElementById(
                    "clubLogoPreviewImage"
                );


            image.src =
                club.logo_url;


            preview.style.display =
                "flex";

        }


        document
            .getElementById(
                "clubFormTitle"
            )
            .textContent =
            "Edit Club";


        document
            .getElementById(
                "clubSubmit"
            )
            .textContent =
            "Save Changes";


        document
            .getElementById(
                "clubCancel"
            )
            .style.display =
            "inline-flex";


        /* Scroll to form */

        document
            .getElementById("clubForm")
            .scrollIntoView({
                behavior: "smooth",
                block: "start"
            });


    } catch (error) {

        console.error(
            "[Admin Clubs] Edit error:",
            error
        );


        alert(
            "Failed to load club:\n\n" +
            error.message
        );

    }

}



/* =========================================================
   DELETE CLUB
========================================================= */

async function deleteClub(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this club?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const {
            error
        } =
            await supabaseClient
                .from("clubs")
                .delete()
                .eq(
                    "id",
                    id
                );


        if (error) {
            throw error;
        }


        alert(
            "Club deleted successfully."
        );


        await loadClubs();


    } catch (error) {

        console.error(
            "[Admin Clubs] Delete error:",
            error
        );


        alert(
            "Failed to delete club:\n\n" +
            error.message
        );

    }

}



/* =========================================================
   RESET FORM
========================================================= */

function resetClubForm() {

    editingClubId =
        null;


    existingLogoUrl =
        null;


    document
        .getElementById("clubForm")
        .reset();


    document
        .getElementById(
            "clubPublished"
        )
        .checked =
        true;


    document
        .getElementById(
            "clubFormTitle"
        )
        .textContent =
        "Add Club";


    document
        .getElementById(
            "clubSubmit"
        )
        .textContent =
        "Add Club";


    document
        .getElementById(
            "clubCancel"
        )
        .style.display =
        "none";


    document
        .getElementById(
            "clubLogoPreview"
        )
        .style.display =
        "none";


    document
        .getElementById(
            "clubLogoPreviewImage"
        )
        .src =
        "";

}



/* =========================================================
   LOGOUT
========================================================= */

function setupLogout() {

    const button =
        document.getElementById(
            "adminLogoutButton"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        async () => {

            try {

                await supabaseClient
                    .auth
                    .signOut();


                window.location.href =
                    "login.html";


            } catch (error) {

                console.error(
                    "[Admin Clubs] Logout error:",
                    error
                );

            }

        }
    );

}



/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
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