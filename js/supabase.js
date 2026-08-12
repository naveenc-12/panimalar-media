"use strict";

/* =====================================================
   SUPABASE CONFIGURATION
===================================================== */

const SUPABASE_URL =
    "https://ucqjfyvjkqgrzoasndwx.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_g4q4QjvZ99YC8nAViwGCvg_y8qI1Glm";

/* =====================================================
   CREATE SHARED SUPABASE CLIENT
===================================================== */

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );