"use strict";

/*
=========================================================
PANIMALAR MEDIA
ADMIN AUTHENTICATION
=========================================================
*/

(function () {

    const ADMIN_DASHBOARD = "dashboard.html";


    /* =====================================================
       LOGIN ELEMENTS
    ====================================================== */

    const loginForm =
        document.getElementById("adminLoginForm");

    const emailInput =
        document.getElementById("adminEmail");

    const passwordInput =
        document.getElementById("adminPassword");

    const loginButton =
        document.getElementById("adminLoginButton");

    const errorBox =
        document.getElementById("adminLoginError");


    /* =====================================================
       ERROR
    ====================================================== */

    function showError(message) {

        if (!errorBox) return;

        errorBox.textContent = message;
        errorBox.classList.add("visible");
    }


    function hideError() {

        if (!errorBox) return;

        errorBox.textContent = "";
        errorBox.classList.remove("visible");
    }


    /* =====================================================
       LOADING
    ====================================================== */

    function setLoading(loading) {

        if (!loginButton) return;

        loginButton.disabled = loading;

        loginButton.textContent =
            loading ? "Signing in..." : "Sign in";
    }


    /* =====================================================
       ADMIN CHECK
    ====================================================== */

    async function isAdmin(userId) {

        const { data, error } =
            await supabaseClient
                .from("profiles")
                .select("role")
                .eq("id", userId)
                .maybeSingle();

        if (error) {

            console.error(
                "Admin role check failed:",
                error
            );

            throw error;
        }

        return (
            data &&
            data.role === "admin"
        );
    }


    /* =====================================================
       CURRENT PAGE
    ====================================================== */

    function isLoginPage() {

        const page =
            window.location.pathname
                .split("/")
                .pop();

        return (
            page === "index.html" ||
            page === ""
        );
    }


    /* =====================================================
       LOGOUT BUTTON
    ====================================================== */

    function setupLogout() {

        const logoutButton =
            document.getElementById("adminLogoutButton") ||
            document.getElementById("signOutBtn");

        if (!logoutButton) {
            return;
        }

        /*
        Prevent attaching the listener more than once.
        */
        if (logoutButton.dataset.logoutReady === "true") {
            return;
        }

        logoutButton.dataset.logoutReady = "true";


        logoutButton.addEventListener(
            "click",
            async function (event) {

                event.preventDefault();

                const confirmed = confirm(
                    "Are you sure you want to sign out?"
                );

                if (!confirmed) {
                    return;
                }


                logoutButton.disabled = true;


                try {

                    await supabaseClient.auth.signOut();

                } catch (error) {

                    console.error(
                        "Logout error:",
                        error
                    );

                }


                /*
                The login page is:
                /admin/index.html

                Since every admin page is already inside
                /admin/, this correctly resolves to:
                /admin/index.html
                */

                window.location.href = "index.html";
            }
        );
    }


    /* =====================================================
       SESSION CHECK
    ====================================================== */

    async function checkSession() {

        try {

            const {
                data,
                error
            } =
                await supabaseClient
                    .auth
                    .getSession();


            if (error) {

                console.error(
                    "Session check failed:",
                    error
                );

                return false;
            }


            const session =
                data.session;


            /*
            -------------------------------------------------
            LOGIN PAGE
            -------------------------------------------------
            If already logged in and admin,
            go to dashboard.
            */

            if (isLoginPage()) {

                if (!session) {
                    return true;
                }


                const admin =
                    await isAdmin(
                        session.user.id
                    );


                if (admin) {

                    window.location.href =
                        ADMIN_DASHBOARD;

                    return false;
                }


                /*
                Logged-in user is not an admin.
                Sign them out.
                */

                await supabaseClient
                    .auth
                    .signOut();

                return true;
            }


            /*
            -------------------------------------------------
            OTHER ADMIN PAGES
            -------------------------------------------------
            */

            if (!session) {

                window.location.href =
                    "index.html";

                return false;
            }


            const admin =
                await isAdmin(
                    session.user.id
                );


            if (!admin) {

                await supabaseClient
                    .auth
                    .signOut();

                window.location.href =
                    "index.html";

                return false;
            }


            /*
            Valid admin session.
            */
            return true;

        } catch (error) {

            console.error(
                "Session check failed:",
                error
            );

            return false;
        }
    }


    /* =====================================================
       LOGIN
    ====================================================== */

    async function handleLogin(event) {

        event.preventDefault();

        hideError();


        const email =
            emailInput
                ? emailInput.value.trim()
                : "";


        const password =
            passwordInput
                ? passwordInput.value
                : "";


        if (!email) {

            showError(
                "Please enter your email address."
            );

            emailInput?.focus();

            return;
        }


        if (!password) {

            showError(
                "Please enter your password."
            );

            passwordInput?.focus();

            return;
        }


        setLoading(true);


        try {

            const {
                data,
                error
            } =
                await supabaseClient
                    .auth
                    .signInWithPassword({
                        email,
                        password
                    });


            if (error) {

                console.error(
                    "Login failed:",
                    error
                );

                showError(
                    getLoginErrorMessage(error)
                );

                setLoading(false);

                return;
            }


            if (
                !data ||
                !data.user
            ) {

                showError(
                    "Login failed. Please try again."
                );

                setLoading(false);

                return;
            }


            /*
            -------------------------------------------------
            VERIFY ADMIN ROLE
            -------------------------------------------------
            */

            const admin =
                await isAdmin(
                    data.user.id
                );


            if (!admin) {

                await supabaseClient
                    .auth
                    .signOut();

                showError(
                    "You do not have permission to access the admin panel."
                );

                setLoading(false);

                return;
            }


            /*
            -------------------------------------------------
            SUCCESSFUL LOGIN
            -------------------------------------------------
            */

            window.location.href =
                ADMIN_DASHBOARD;

        } catch (error) {

            console.error(
                "Unexpected login error:",
                error
            );

            showError(
                "Something went wrong while signing in. Please try again."
            );

            setLoading(false);
        }
    }


    /* =====================================================
       LOGIN ERROR
    ====================================================== */

    function getLoginErrorMessage(error) {

        const message =
            String(
                error?.message || ""
            ).toLowerCase();


        if (
            message.includes(
                "invalid login credentials"
            )
        ) {

            return "Incorrect email or password.";
        }


        if (
            message.includes(
                "email not confirmed"
            )
        ) {

            return "Please verify your email address before signing in.";
        }


        if (
            message.includes(
                "too many requests"
            )
        ) {

            return "Too many login attempts. Please wait a moment and try again.";
        }


        return (
            error?.message ||
            "Unable to sign in. Please try again."
        );
    }


    /* =====================================================
       LOGOUT FUNCTION
    ====================================================== */

    async function logout() {

        try {

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

                return false;
            }


            return true;

        } catch (error) {

            console.error(
                "Unexpected logout error:",
                error
            );

            return false;
        }
    }


    /*
    Make logout available globally
    in case another admin script uses it.
    */

    window.adminLogout = logout;


    /* =====================================================
       INITIALIZE
    ====================================================== */

    async function init() {

        /*
        Make sure Supabase exists.
        */

        if (
            typeof supabaseClient ===
            "undefined"
        ) {

            console.error(
                "supabaseClient is not available. Check js/supabase.js."
            );

            showError(
                "Unable to connect to the authentication service."
            );

            return;
        }


        /*
        -------------------------------------------------
        CHECK SESSION
        -------------------------------------------------
        */

        const authenticated =
            await checkSession();


        /*
        -------------------------------------------------
        SETUP LOGOUT
        -------------------------------------------------
        
        THIS WAS MISSING IN YOUR ORIGINAL FILE.

        Every admin page will now automatically
        connect its logout button.
        */

        if (authenticated) {
            setupLogout();
        }


        /*
        -------------------------------------------------
        LOGIN FORM
        -------------------------------------------------
        */

        if (loginForm) {

            loginForm.addEventListener(
                "submit",
                handleLogin
            );
        }
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