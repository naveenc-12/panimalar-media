"use strict";

/*
=========================================================
PANIMALAR MEDIA
ADMIN QUESTIONS MANAGEMENT
=========================================================

IMPORTANT:
This file DOES NOT create a Supabase client.

It uses the shared:
    supabaseClient

from:
    ../js/supabase.js
=========================================================
*/


/* =====================================================
   STATE
===================================================== */

let questions = [];
let answers = [];

let currentStatus = "all";
let currentQuestion = null;


/* =====================================================
   DOM ELEMENTS
===================================================== */

const questionsList =
    document.getElementById("questionsList");

const questionSearch =
    document.getElementById("questionSearch");

const totalQuestions =
    document.getElementById("totalQuestions");

const pendingQuestions =
    document.getElementById("pendingQuestions");

const publishedQuestions =
    document.getElementById("publishedQuestions");

const totalReplies =
    document.getElementById("totalReplies");

const questionModal =
    document.getElementById("questionModal");

const modalQuestion =
    document.getElementById("modalQuestion");

const modalCategory =
    document.getElementById("modalCategory");

const modalDate =
    document.getElementById("modalDate");

const modalStatus =
    document.getElementById("modalStatus");

const modalReplies =
    document.getElementById("modalReplies");

const modalReplyCount =
    document.getElementById("modalReplyCount");


/* =====================================================
   INITIALIZE
===================================================== */

function initializeQuestionsPage() {

    setupFilters();
    setupSearch();
    setupModal();
    setupSignOut();

    loadQuestions();
}


/* =====================================================
   START
===================================================== */

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initializeQuestionsPage
    );

} else {

    initializeQuestionsPage();

}


/* =====================================================
   CHECK SUPABASE
===================================================== */

function hasSupabaseClient() {

    if (
        typeof supabaseClient === "undefined" ||
        !supabaseClient
    ) {

        console.error(
            "supabaseClient is not available."
        );

        showError(
            "Supabase client is not available. Check js/supabase.js."
        );

        return false;
    }

    return true;
}


/* =====================================================
   LOAD QUESTIONS
===================================================== */

async function loadQuestions() {

    if (!hasSupabaseClient()) {
        return;
    }

    showLoading();

    try {

        /* ---------------------------------------------
           QUESTIONS
        --------------------------------------------- */

        const {
            data: questionData,
            error: questionError
        } = await supabaseClient
            .from("questions")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


        if (questionError) {

            console.error(
                "Questions loading error:",
                questionError
            );

            showError(
                questionError.message ||
                "Failed to load questions."
            );

            return;
        }


        questions =
            questionData || [];


        /* ---------------------------------------------
           ANSWERS
        --------------------------------------------- */

        const {
            data: answerData,
            error: answerError
        } = await supabaseClient
            .from("answers")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: true
                }
            );


        if (answerError) {

            console.error(
                "Answers loading error:",
                answerError
            );

            answers = [];

        } else {

            answers =
                answerData || [];

        }


        /* ---------------------------------------------
           UPDATE UI
        --------------------------------------------- */

        updateStatistics();
        renderQuestions();

    } catch (error) {

        console.error(
            "Unexpected questions error:",
            error
        );

        showError(
            error?.message ||
            "Something went wrong while loading questions."
        );

    }
}


/* =====================================================
   STATISTICS
===================================================== */

function updateStatistics() {

    const total =
        questions.length;


    const pending =
        questions.filter(
            question =>
                question.status === "pending"
        ).length;


    const published =
        questions.filter(
            question =>
                question.status === "published"
        ).length;


    if (totalQuestions) {

        totalQuestions.textContent =
            total;

    }


    if (pendingQuestions) {

        pendingQuestions.textContent =
            pending;

    }


    if (publishedQuestions) {

        publishedQuestions.textContent =
            published;

    }


    if (totalReplies) {

        totalReplies.textContent =
            answers.length;

    }

}


/* =====================================================
   FILTERS
===================================================== */

function setupFilters() {

    document
        .querySelectorAll(".status-filter")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".status-filter"
                        )
                        .forEach(btn => {

                            btn.classList.remove(
                                "active"
                            );

                        });


                    button.classList.add(
                        "active"
                    );


                    currentStatus =
                        button.dataset.status;


                    renderQuestions();

                }
            );

        });

}


/* =====================================================
   SEARCH
===================================================== */

function setupSearch() {

    if (!questionSearch) {
        return;
    }


    questionSearch.addEventListener(
        "input",
        renderQuestions
    );

}


/* =====================================================
   RENDER QUESTIONS
===================================================== */

function renderQuestions() {

    if (!questionsList) {
        return;
    }


    const search =
        questionSearch?.value
            ?.trim()
            .toLowerCase() || "";


    const filtered =
        questions.filter(
            question => {

                const statusMatch =
                    currentStatus === "all" ||
                    question.status === currentStatus;


                const questionText =
                    String(
                        question.question || ""
                    ).toLowerCase();


                const category =
                    String(
                        question.category || ""
                    ).toLowerCase();


                const searchMatch =
                    !search ||
                    questionText.includes(search) ||
                    category.includes(search);


                return (
                    statusMatch &&
                    searchMatch
                );

            }
        );


    if (!filtered.length) {

        questionsList.innerHTML = `
            <div class="admin-empty">

                <div class="empty-icon">
                    ?
                </div>

                <h3>
                    No questions found
                </h3>

                <p>
                    There are no questions matching
                    your current filter.
                </p>

            </div>
        `;

        return;
    }


    questionsList.innerHTML =
        filtered
            .map(createQuestionRow)
            .join("");


    attachQuestionActions();

}


/* =====================================================
   CREATE QUESTION ROW
===================================================== */

function createQuestionRow(question) {

    const replyCount =
        answers.filter(
            answer =>
                answer.question_id === question.id
        ).length;


    return `

        <div
            class="admin-question-row"
            data-question-id="${escapeHTML(question.id)}"
        >

            <div class="question-row-main">

                <div class="question-row-icon">
                    ?
                </div>


                <div class="question-row-content">

                    <div class="question-row-top">

                        <span class="badge badge-violet">
                            ${escapeHTML(
                                question.category ||
                                "Other"
                            )}
                        </span>

                        ${getStatusBadge(
                            question.status
                        )}

                    </div>


                    <h3>
                        ${escapeHTML(
                            question.question ||
                            "Untitled question"
                        )}
                    </h3>


                    <div class="question-row-meta">

                        <span>
                            🕶️ Anonymous
                        </span>

                        <span>
                            ${formatDate(
                                question.created_at
                            )}
                        </span>

                        <span>
                            ↳ ${replyCount}
                            ${
                                replyCount === 1
                                    ? "reply"
                                    : "replies"
                            }
                        </span>

                    </div>

                </div>

            </div>


            <div class="question-row-actions">

                <button
                    type="button"
                    class="admin-outline-btn"
                    data-view-question="${escapeHTML(
                        question.id
                    )}"
                >
                    View
                </button>


                ${
                    question.status !== "published"
                        ? `
                            <button
                                type="button"
                                class="admin-small-btn publish"
                                data-publish-question="${escapeHTML(
                                    question.id
                                )}"
                            >
                                Publish
                            </button>
                        `
                        : ""
                }


                ${
                    question.status !== "hidden"
                        ? `
                            <button
                                type="button"
                                class="admin-small-btn"
                                data-hide-question="${escapeHTML(
                                    question.id
                                )}"
                            >
                                Hide
                            </button>
                        `
                        : ""
                }

            </div>

        </div>

    `;

}


/* =====================================================
   STATUS BADGE
===================================================== */

function getStatusBadge(status) {

    const safeStatus =
        String(
            status || "unknown"
        ).toLowerCase();


    const label =
        safeStatus.charAt(0).toUpperCase() +
        safeStatus.slice(1);


    return `
        <span
            class="status-badge status-${escapeHTML(
                safeStatus
            )}"
        >
            ${escapeHTML(label)}
        </span>
    `;

}


/* =====================================================
   QUESTION ACTIONS
===================================================== */

function attachQuestionActions() {


    /* VIEW */

    document
        .querySelectorAll(
            "[data-view-question]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    openQuestion(
                        button.dataset.viewQuestion
                    );

                }
            );

        });


    /* PUBLISH */

    document
        .querySelectorAll(
            "[data-publish-question]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                async () => {

                    await updateQuestionStatus(
                        button.dataset.publishQuestion,
                        "published"
                    );

                }
            );

        });


    /* HIDE */

    document
        .querySelectorAll(
            "[data-hide-question]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                async () => {

                    await updateQuestionStatus(
                        button.dataset.hideQuestion,
                        "hidden"
                    );

                }
            );

        });

}


/* =====================================================
   UPDATE QUESTION STATUS
===================================================== */

async function updateQuestionStatus(
    id,
    status
) {

    if (!hasSupabaseClient()) {
        return false;
    }


    try {

        const {
            error
        } = await supabaseClient
            .from("questions")
            .update({

                status: status,

                updated_at:
                    new Date().toISOString()

            })
            .eq(
                "id",
                id
            );


        if (error) {

            console.error(
                "Question status update error:",
                error
            );

            alert(
                "Failed to update question:\n\n" +
                error.message
            );

            return false;
        }


        const question =
            questions.find(
                q => q.id === id
            );


        if (question) {

            question.status =
                status;

        }


        updateStatistics();
        renderQuestions();


        if (
            currentQuestion &&
            currentQuestion.id === id
        ) {

            currentQuestion.status =
                status;


            updateModalStatus(
                status
            );

        }


        return true;

    } catch (error) {

        console.error(
            "Question status error:",
            error
        );

        alert(
            "Failed to update question:\n\n" +
            (
                error?.message ||
                "Unknown error"
            )
        );

        return false;

    }

}


/* =====================================================
   OPEN QUESTION
===================================================== */

function openQuestion(id) {

    const question =
        questions.find(
            q => q.id === id
        );


    if (!question) {
        return;
    }


    currentQuestion =
        question;


    const questionAnswers =
        answers.filter(
            answer =>
                answer.question_id === id
        );


    if (modalQuestion) {

        modalQuestion.textContent =
            question.question || "";

    }


    if (modalCategory) {

        modalCategory.textContent =
            question.category ||
            "Other";

    }


    if (modalDate) {

        modalDate.textContent =
            formatDate(
                question.created_at
            );

    }


    updateModalStatus(
        question.status
    );


    if (modalReplyCount) {

        modalReplyCount.textContent =
            `${questionAnswers.length} ${
                questionAnswers.length === 1
                    ? "reply"
                    : "replies"
            }`;

    }


    renderModalReplies(
        questionAnswers
    );


    if (questionModal) {

        questionModal.hidden =
            false;

        document.body.style.overflow =
            "hidden";

    }

}


/* =====================================================
   UPDATE MODAL STATUS
===================================================== */

function updateModalStatus(status) {

    if (!modalStatus) {
        return;
    }


    const safeStatus =
        String(
            status || "unknown"
        ).toLowerCase();


    modalStatus.textContent =
        safeStatus.charAt(0).toUpperCase() +
        safeStatus.slice(1);


    modalStatus.className =
        `status-badge status-${escapeHTML(
            safeStatus
        )}`;

}


/* =====================================================
   RENDER REPLIES
===================================================== */

function renderModalReplies(
    questionAnswers
) {

    if (!modalReplies) {
        return;
    }


    if (!questionAnswers.length) {

        modalReplies.innerHTML = `
            <div class="modal-empty">
                No replies yet.
            </div>
        `;

        return;
    }


    modalReplies.innerHTML =
        questionAnswers
            .map(
                answer => `

                    <div
                        class="admin-reply-row"
                        data-answer-id="${escapeHTML(
                            answer.id
                        )}"
                    >

                        <div class="admin-reply-content">

                            <div class="admin-reply-meta">

                                <strong>
                                    ${
                                        answer.anonymous
                                            ? "Anonymous Senior"
                                            : "Senior"
                                    }
                                </strong>

                                <span>
                                    ${formatDate(
                                        answer.created_at
                                    )}
                                </span>

                                ${getStatusBadge(
                                    answer.status
                                )}

                            </div>


                            <p>
                                ${escapeHTML(
                                    answer.answer ||
                                    ""
                                )}
                            </p>

                        </div>


                        <div class="admin-reply-actions">

                            ${
                                answer.status !==
                                "published"
                                    ? `
                                        <button
                                            type="button"
                                            class="admin-small-btn publish"
                                            data-publish-answer="${escapeHTML(
                                                answer.id
                                            )}"
                                        >
                                            Publish
                                        </button>
                                    `
                                    : ""
                            }


                            ${
                                answer.status !==
                                "hidden"
                                    ? `
                                        <button
                                            type="button"
                                            class="admin-small-btn"
                                            data-hide-answer="${escapeHTML(
                                                answer.id
                                            )}"
                                        >
                                            Hide
                                        </button>
                                    `
                                    : ""
                            }


                            <button
                                type="button"
                                class="admin-small-btn danger"
                                data-delete-answer="${escapeHTML(
                                    answer.id
                                )}"
                            >
                                Delete
                            </button>

                        </div>

                    </div>

                `
            )
            .join("");


    attachAnswerActions();

}


/* =====================================================
   ANSWER ACTIONS
===================================================== */

function attachAnswerActions() {


    /* PUBLISH */

    document
        .querySelectorAll(
            "[data-publish-answer]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                async () => {

                    await updateAnswerStatus(
                        button.dataset.publishAnswer,
                        "published"
                    );

                }
            );

        });


    /* HIDE */

    document
        .querySelectorAll(
            "[data-hide-answer]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                async () => {

                    await updateAnswerStatus(
                        button.dataset.hideAnswer,
                        "hidden"
                    );

                }
            );

        });


    /* DELETE */

    document
        .querySelectorAll(
            "[data-delete-answer]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                async () => {

                    const confirmed =
                        confirm(
                            "Delete this reply permanently?"
                        );


                    if (!confirmed) {
                        return;
                    }


                    await deleteAnswer(
                        button.dataset.deleteAnswer
                    );

                }
            );

        });

}


/* =====================================================
   UPDATE ANSWER STATUS
===================================================== */

async function updateAnswerStatus(
    id,
    status
) {

    if (!hasSupabaseClient()) {
        return false;
    }


    try {

        const {
            error
        } = await supabaseClient
            .from("answers")
            .update({

                status: status,

                updated_at:
                    new Date().toISOString()

            })
            .eq(
                "id",
                id
            );


        if (error) {

            console.error(
                "Answer status error:",
                error
            );

            alert(
                "Failed to update reply:\n\n" +
                error.message
            );

            return false;
        }


        const answer =
            answers.find(
                a => a.id === id
            );


        if (answer) {

            answer.status =
                status;

        }


        updateStatistics();


        if (currentQuestion) {

            const questionAnswers =
                answers.filter(
                    a =>
                        a.question_id ===
                        currentQuestion.id
                );


            renderModalReplies(
                questionAnswers
            );


            if (modalReplyCount) {

                modalReplyCount.textContent =
                    `${questionAnswers.length} ${
                        questionAnswers.length === 1
                            ? "reply"
                            : "replies"
                    }`;

            }

        }


        renderQuestions();

        return true;

    } catch (error) {

        console.error(
            "Answer status error:",
            error
        );

        alert(
            "Failed to update reply:\n\n" +
            (
                error?.message ||
                "Unknown error"
            )
        );

        return false;

    }

}


/* =====================================================
   DELETE ANSWER
===================================================== */

async function deleteAnswer(id) {

    if (!hasSupabaseClient()) {
        return false;
    }


    try {

        const {
            error
        } = await supabaseClient
            .from("answers")
            .delete()
            .eq(
                "id",
                id
            );


        if (error) {

            console.error(
                "Delete answer error:",
                error
            );

            alert(
                "Failed to delete reply:\n\n" +
                error.message
            );

            return false;
        }


        answers =
            answers.filter(
                answer =>
                    answer.id !== id
            );


        updateStatistics();


        if (currentQuestion) {

            const questionAnswers =
                answers.filter(
                    answer =>
                        answer.question_id ===
                        currentQuestion.id
                );


            renderModalReplies(
                questionAnswers
            );


            if (modalReplyCount) {

                modalReplyCount.textContent =
                    `${questionAnswers.length} ${
                        questionAnswers.length === 1
                            ? "reply"
                            : "replies"
                    }`;

            }

        }


        renderQuestions();

        return true;

    } catch (error) {

        console.error(
            "Delete answer error:",
            error
        );

        alert(
            "Failed to delete reply:\n\n" +
            (
                error?.message ||
                "Unknown error"
            )
        );

        return false;

    }

}


/* =====================================================
   MODAL SETUP
===================================================== */

function setupModal() {

    const closeModal =
        document.getElementById(
            "closeModal"
        );


    if (closeModal) {

        closeModal.addEventListener(
            "click",
            closeQuestionModal
        );

    }


    const overlay =
        document.querySelector(
            ".admin-modal-overlay"
        );


    if (overlay) {

        overlay.addEventListener(
            "click",
            closeQuestionModal
        );

    }


    /* PUBLISH QUESTION */

    document
        .getElementById(
            "publishQuestionBtn"
        )
        ?.addEventListener(
            "click",
            async () => {

                if (!currentQuestion) {
                    return;
                }


                await updateQuestionStatus(
                    currentQuestion.id,
                    "published"
                );

            }
        );


    /* HIDE QUESTION */

    document
        .getElementById(
            "hideQuestionBtn"
        )
        ?.addEventListener(
            "click",
            async () => {

                if (!currentQuestion) {
                    return;
                }


                await updateQuestionStatus(
                    currentQuestion.id,
                    "hidden"
                );

            }
        );


    /* CLOSE QUESTION */

    document
        .getElementById(
            "closeQuestionBtn"
        )
        ?.addEventListener(
            "click",
            async () => {

                if (!currentQuestion) {
                    return;
                }


                await updateQuestionStatus(
                    currentQuestion.id,
                    "closed"
                );

            }
        );


    /* DELETE QUESTION */

    document
        .getElementById(
            "deleteQuestionBtn"
        )
        ?.addEventListener(
            "click",
            deleteCurrentQuestion
        );


    /* ESC KEY */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                questionModal &&
                !questionModal.hidden
            ) {

                closeQuestionModal();

            }

        }
    );

}


/* =====================================================
   CLOSE MODAL
===================================================== */

function closeQuestionModal() {

    if (questionModal) {

        questionModal.hidden =
            true;

    }


    currentQuestion =
        null;


    document.body.style.overflow =
        "";

}


/* =====================================================
   DELETE QUESTION
===================================================== */

async function deleteCurrentQuestion() {

    if (!currentQuestion) {
        return;
    }


    const confirmed =
        confirm(
            "Delete this question permanently?\n\n" +
            "All replies belonging to this question " +
            "will also be deleted."
        );


    if (!confirmed) {
        return;
    }


    if (!hasSupabaseClient()) {
        return;
    }


    try {

        const questionId =
            currentQuestion.id;


        const {
            error
        } = await supabaseClient
            .from("questions")
            .delete()
            .eq(
                "id",
                questionId
            );


        if (error) {

            console.error(
                "Delete question error:",
                error
            );

            alert(
                "Failed to delete question:\n\n" +
                error.message
            );

            return;
        }


        questions =
            questions.filter(
                question =>
                    question.id !==
                    questionId
            );


        answers =
            answers.filter(
                answer =>
                    answer.question_id !==
                    questionId
            );


        closeQuestionModal();

        updateStatistics();
        renderQuestions();

    } catch (error) {

        console.error(
            "Delete question error:",
            error
        );

        alert(
            "Failed to delete question:\n\n" +
            (
                error?.message ||
                "Unknown error"
            )
        );

    }

}


/* =====================================================
   SIGN OUT
===================================================== */

function setupSignOut() {

    const button =
        document.getElementById(
            "signOutBtn"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        async () => {

            if (!hasSupabaseClient()) {
                return;
            }


            try {

                const {
                    error
                } =
                    await supabaseClient
                        .auth
                        .signOut();


                if (error) {

                    console.error(
                        "Sign out error:",
                        error
                    );

                    alert(
                        "Failed to sign out."
                    );

                    return;
                }


                window.location.href =
                    "index.html";

            } catch (error) {

                console.error(
                    "Sign out error:",
                    error
                );

            }

        }
    );

}


/* =====================================================
   LOADING
===================================================== */

function showLoading() {

    if (!questionsList) {
        return;
    }


    questionsList.innerHTML = `

        <div class="admin-loading">

            <div class="loading-spinner"></div>

            <p>
                Loading questions...
            </p>

        </div>

    `;

}


/* =====================================================
   ERROR
===================================================== */

function showError(message) {

    if (!questionsList) {
        return;
    }


    questionsList.innerHTML = `

        <div class="admin-empty">

            <div class="empty-icon">
                !
            </div>

            <h3>
                Failed to load questions
            </h3>

            <p>
                ${escapeHTML(
                    message ||
                    "Something went wrong."
                )}
            </p>

            <button
                type="button"
                class="admin-outline-btn"
                id="retryQuestionsBtn"
            >
                Try Again
            </button>

        </div>

    `;


    document
        .getElementById(
            "retryQuestionsBtn"
        )
        ?.addEventListener(
            "click",
            loadQuestions
        );

}


/* =====================================================
   DATE FORMAT
===================================================== */

function formatDate(value) {

    if (!value) {
        return "";
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(value) {

    return String(
        value ?? ""
    )
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