"use strict";

// ============================================
// SUPABASE
// ============================================

const SUPABASE_URL =
    "https://ucqjfyvjkqgrzoasndwx.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_g4q4QjvZ99YC8nAViwGCvg_y8qI1Glm";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


// ============================================
// ELEMENTS
// ============================================

const questionForm = document.getElementById("questionForm");
const questionText = document.getElementById("questionText");
const questionCategory = document.getElementById("questionCategory");
const questionSearch = document.getElementById("questionSearch");
const questionFilters = document.getElementById("questionFilters");
const questionFeed = document.getElementById("questionFeed");
const questionEmpty = document.getElementById("questionEmpty");
const questionSubmit = document.getElementById("questionSubmit");
const questionCharCount = document.getElementById("questionCharCount");


// ============================================
// STATE
// ============================================

let allQuestions = [];
let allAnswers = [];

let activeCategory = "All";
let openReplyFor = null;


// ============================================
// LOAD QUESTIONS + ANSWERS
// ============================================

async function loadQuestions() {

    questionFeed.innerHTML = `
        <div class="empty">
            <div class="big">...</div>
            <h3>Loading questions</h3>
            <p>Please wait.</p>
        </div>
    `;


    // ----------------------------------------
    // QUESTIONS
    // ----------------------------------------

    const {
        data: questions,
        error: questionsError
    } = await supabaseClient
        .from("questions")
        .select("*")
        .eq("status", "published")
        .order("created_at", {
            ascending: false
        });


    if (questionsError) {

        console.error(
            "Question loading error:",
            questionsError
        );

        showError(questionsError.message);

        return;
    }


    allQuestions = questions || [];


    // ----------------------------------------
    // ANSWERS
    // ----------------------------------------

    const {
        data: answers,
        error: answersError
    } = await supabaseClient
        .from("answers")
        .select("*")
        .eq("status", "published")
        .order("created_at", {
            ascending: true
        });


    if (answersError) {

        console.error(
            "Answer loading error:",
            answersError
        );

        // Don't completely break the page
        allAnswers = [];

    } else {

        allAnswers = answers || [];

    }


    createCategoryFilters();

    renderQuestions();
}


// ============================================
// ERROR
// ============================================

function showError(message) {

    questionFeed.innerHTML = `
        <div class="empty">
            <div class="big">!</div>

            <h3>
                Unable to load questions
            </h3>

            <p>
                ${escapeHTML(message)}
            </p>
        </div>
    `;
}


// ============================================
// CATEGORY FILTERS
// ============================================

function createCategoryFilters() {

    if (!questionFilters) return;


    const categories = [
        "All",
        ...new Set(
            allQuestions
                .map(q => q.category)
                .filter(Boolean)
        )
    ];


    questionFilters.innerHTML =
        categories
            .map(category => `
                <span
                    class="chip ${
                        activeCategory === category
                            ? "active"
                            : ""
                    }"
                    data-category="${escapeHTML(category)}"
                >
                    ${escapeHTML(category)}
                </span>
            `)
            .join("");


    document
        .querySelectorAll("[data-category]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    activeCategory =
                        button.dataset.category;

                    createCategoryFilters();

                    renderQuestions();

                }
            );

        });
}


// ============================================
// RENDER QUESTIONS
// ============================================

function renderQuestions() {

    const search =
        questionSearch?.value
            ?.trim()
            .toLowerCase() || "";


    const questions =
        allQuestions.filter(question => {

            const categoryMatch =
                activeCategory === "All" ||
                question.category === activeCategory;


            const searchMatch =
                !search ||
                (question.question || "")
                    .toLowerCase()
                    .includes(search);


            return categoryMatch && searchMatch;

        });


    if (!questions.length) {

        questionFeed.innerHTML = "";

        if (questionEmpty) {
            questionEmpty.hidden = false;
        }

        return;
    }


    if (questionEmpty) {
        questionEmpty.hidden = true;
    }


    questionFeed.innerHTML =
        questions
            .map(createQuestionCard)
            .join("");


    attachQuestionEvents();
}


// ============================================
// QUESTION CARD
// ============================================

function createQuestionCard(question) {

    const id = question.id;


    const category =
        escapeHTML(
            question.category || "Other"
        );


    const text =
        escapeHTML(
            question.question || ""
        );


    const date =
        formatDate(
            question.created_at
        );


    // Get replies for this question

    const replies =
        allAnswers.filter(
            answer =>
                answer.question_id === id
        );


    return `
        <div class="qcard">

            <div class="qhead">

                <div class="qwho">

                    <span class="qavatar">
                        🕶️
                    </span>

                    <div>

                        <div
                            style="
                                font-size:13px;
                                font-weight:600;
                            "
                        >
                            Anonymous
                        </div>

                        <div class="qmeta">
                            ${date}
                        </div>

                    </div>

                </div>


                <span class="badge badge-violet">
                    ${category}
                </span>

            </div>


            <div class="qtext">
                ${text}
            </div>


            <div class="qfoot">

                <span class="rcount">
                    ${replies.length}
                    ${
                        replies.length === 1
                            ? "reply"
                            : "replies"
                    }
                </span>


                <div
                    style="
                        display:flex;
                        gap:14px;
                        align-items:center;
                    "
                >

                    <button
                        class="flag"
                        data-flag="${id}"
                    >
                        🚩 Report
                    </button>


                    <button
                        class="btn btn-ghost btn-sm"
                        data-toggle-reply="${id}"
                    >
                        Reply
                    </button>

                </div>

            </div>


            ${
                replies.length
                    ? `
                        <div class="replies">
                            ${replies
                                .map(createReply)
                                .join("")}
                        </div>
                    `
                    : ""
            }


            <!-- REPLY COMPOSER -->

            <div
                class="
                    reply-composer
                    ${
                        openReplyFor === id
                            ? "open"
                            : ""
                    }
                "
                id="composer-${id}"
            >

                <textarea
                    id="replyText-${id}"
                    maxlength="300"
                    placeholder="Reply as a senior — be specific, be kind."
                ></textarea>


                <div class="reply-composer-row">

                    <input
                        type="text"
                        id="replySig-${id}"
                        maxlength="50"
                        placeholder="Sign as (optional) e.g. 3rd yr, ECE"
                    />


                    <div
                        style="
                            display:flex;
                            gap:8px;
                        "
                    >

                        <button
                            class="btn btn-ghost btn-sm"
                            data-cancel-reply="${id}"
                        >
                            Cancel
                        </button>


                        <button
                            class="btn btn-grad btn-sm"
                            data-submit-reply="${id}"
                        >
                            Post reply
                        </button>

                    </div>

                </div>

            </div>

        </div>
    `;
}


// ============================================
// CREATE REPLY
// ============================================

function createReply(answer) {

    const text =
        escapeHTML(
            answer.answer || ""
        );


    const date =
        formatDate(
            answer.created_at
        );


    return `
        <div class="reply">

            <div class="reply-who">

                <span class="qavatar small">
                    🎓
                </span>


                <div>

                    <strong>
                        ${
                            answer.anonymous
                                ? "Anonymous Senior"
                                : "Senior"
                        }
                    </strong>


                    <span class="qmeta">
                        ${date}
                    </span>

                </div>

            </div>


            <div class="reply-text">
                ${text}
            </div>

        </div>
    `;
}


// ============================================
// ATTACH EVENTS
// ============================================

function attachQuestionEvents() {


    // ----------------------------------------
    // OPEN / CLOSE REPLY
    // ----------------------------------------

    document
        .querySelectorAll("[data-toggle-reply]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        button.dataset.toggleReply;


                    openReplyFor =
                        openReplyFor === id
                            ? null
                            : id;


                    renderQuestions();


                    if (openReplyFor === id) {

                        const textarea =
                            document.getElementById(
                                `replyText-${id}`
                            );


                        if (textarea) {
                            textarea.focus();
                        }

                    }

                }
            );

        });


    // ----------------------------------------
    // CANCEL
    // ----------------------------------------

    document
        .querySelectorAll("[data-cancel-reply]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    openReplyFor = null;

                    renderQuestions();

                }
            );

        });


    // ----------------------------------------
    // POST REPLY
    // ----------------------------------------

    document
        .querySelectorAll("[data-submit-reply]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => postReply(
                    button.dataset.submitReply,
                    button
                )
            );

        });


    // ----------------------------------------
    // REPORT
    // ----------------------------------------

    document
        .querySelectorAll("[data-flag]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    button.textContent =
                        "🚩 Reported";

                    button.disabled = true;

                }
            );

        });

}


// ============================================
// POST REPLY TO SUPABASE
// ============================================

async function postReply(
    questionId,
    button
) {

    const textarea =
        document.getElementById(
            `replyText-${questionId}`
        );


    if (!textarea) return;


    const answer =
        textarea.value.trim();


    if (answer.length < 2) {

        alert(
            "Please enter a reply."
        );

        textarea.focus();

        return;

    }


    if (answer.length > 300) {

        alert(
            "Reply must be 300 characters or less."
        );

        return;

    }


    button.disabled = true;

    button.textContent =
        "Posting...";


    const {
        data,
        error
    } = await supabaseClient
        .from("answers")
        .insert([
            {
                question_id: questionId,
                answer: answer,
                anonymous: true,
                status: "published",
                created_by: null
            }
        ])
        .select()
        .single();


    if (error) {

        console.error(
            "Reply insert error:",
            error
        );


        alert(
            "Failed to post reply:\n\n" +
            error.message
        );


        button.disabled = false;

        button.textContent =
            "Post reply";

        return;

    }


    // Add immediately to local data

    allAnswers.push(data);


    // Close composer

    openReplyFor = null;


    // Re-render

    renderQuestions();

}


// ============================================
// POST QUESTION
// ============================================

if (questionForm) {

    questionForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const text =
                questionText.value.trim();


            const category =
                questionCategory.value;


            if (text.length < 5) {

                alert(
                    "Please enter at least 5 characters."
                );

                return;

            }


            if (text.length > 400) {

                alert(
                    "Question must be 400 characters or less."
                );

                return;

            }


            questionSubmit.disabled = true;

            questionSubmit.textContent =
                "Posting...";


            const {
                data,
                error
            } = await supabaseClient
                .from("questions")
                .insert([
                    {
                        question: text,
                        category: category,
                        anonymous: true,
                        status: "published",
                        created_by: null
                    }
                ])
                .select()
                .single();


            if (error) {

                console.error(
                    "Question insert error:",
                    error
                );


                alert(
                    "Failed to post question:\n\n" +
                    error.message
                );


                questionSubmit.disabled = false;

                questionSubmit.textContent =
                    "Post anonymously";

                return;

            }


            allQuestions.unshift(data);


            questionText.value = "";

            updateCharacterCount();


            activeCategory = "All";


            createCategoryFilters();

            renderQuestions();


            questionSubmit.textContent =
                "Posted ✓";


            setTimeout(
                () => {

                    questionSubmit.textContent =
                        "Post anonymously";

                },
                1500
            );

        }
    );

}


// ============================================
// SEARCH
// ============================================

if (questionSearch) {

    questionSearch.addEventListener(
        "input",
        renderQuestions
    );

}


// ============================================
// CHARACTER COUNT
// ============================================

function updateCharacterCount() {

    if (
        !questionText ||
        !questionCharCount
    ) {
        return;
    }


    const length =
        questionText.value.length;


    questionCharCount.textContent =
        `${length} / 400`;


    if (questionSubmit) {

        questionSubmit.disabled =
            length < 5;

    }

}


if (questionText) {

    questionText.addEventListener(
        "input",
        updateCharacterCount
    );


    updateCharacterCount();

}


// ============================================
// DATE FORMAT
// ============================================

function formatDate(value) {

    if (!value) {
        return "";
    }


    const date =
        new Date(value);


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// ============================================
// ESCAPE HTML
// ============================================

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ============================================
// START
// ============================================

loadQuestions();