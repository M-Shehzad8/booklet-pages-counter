const MAX_PAGES = 10000;

const form = document.getElementById("calc-form");
const pageInput = document.getElementById("page-count");
const calculateBtn = document.getElementById("calculate-btn");
const inputError = document.getElementById("input-error");

const segmentButtons = document.querySelectorAll(".segment-btn");
const resultsSection = document.getElementById("results-section");
const sheetsHead = document.getElementById("sheets-head");
const pagesBody = document.getElementById("pages-body");

const statSheets = document.getElementById("stat-sheets");
const statPages = document.getElementById("stat-pages");
const statLastSheet = document.getElementById("stat-last-sheet");

const copyRangeBtn = document.getElementById("copy-range-btn");
const copyColumnBtn = document.getElementById("copy-column-btn");
const clearBtn = document.getElementById("clear-btn");
const toastBanner = document.getElementById("toast-banner");
const themeToggle = document.getElementById("theme-toggle");

let pagesPerSheet = 4;
let currentSheets = [];
let toastTimer = null;
let activeCopyBtn = null;
let activeCopyOriginalLabel = "";

// --- Theme Management ---
function initTheme() {
    let saved = null;
    try {
        saved = localStorage.getItem("booklet-theme");
    } catch {
        // Ignore storage errors in restricted contexts
    }
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    const theme = saved || (prefersDark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
}

themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
        localStorage.setItem("booklet-theme", next);
    } catch {
        // Ignore storage errors
    }
});

initTheme();

// --- Pages-per-Sheet Selector ---
segmentButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        segmentButtons.forEach((b) => {
            b.classList.remove("active");
            b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("active");
        btn.setAttribute("aria-pressed", "true");
        pagesPerSheet = Number(btn.dataset.pages);

        if (currentSheets.length > 0) {
            const total = currentSheets[currentSheets.length - 1].end;
            runCalculation(total);
        }
    });
});

// --- Input Validation ---
function setError(message) {
    if (message) {
        inputError.textContent = message;
        inputError.hidden = false;
        pageInput.setAttribute("aria-invalid", "true");
    } else {
        inputError.textContent = "";
        inputError.hidden = true;
        pageInput.removeAttribute("aria-invalid");
    }
}

pageInput.addEventListener("input", () => {
    const trimmed = pageInput.value.trim();
    calculateBtn.disabled = trimmed === "";
    if (!inputError.hidden) {
        setError("");
    }
});

// --- Core Calculation ---
function computeSheets(totalPages, perSheet) {
    const sheets = [];
    let sheetNumber = 1;

    for (let start = 1; start <= totalPages; start += perSheet) {
        const end = Math.min(start + perSheet - 1, totalPages);
        const count = end - start + 1;
        const isFull = count === perSheet;

        let displayLabel;
        if (isFull) {
            displayLabel = `${start}-${end}`;
        } else {
            const pages = [];
            for (let p = start; p <= end; p++) {
                pages.push(p);
            }
            displayLabel = pages.join(", ");
        }

        const printRange = start === end ? `${start}` : `${start}-${end}`;

        sheets.push({
            sheetNumber,
            start,
            end,
            count,
            isFull,
            displayLabel,
            printRange,
        });
        sheetNumber++;
    }

    return sheets;
}

function renderResults(sheets, totalPages, perSheet) {
    // Table header
    sheetsHead.textContent = "";
    const headRow = document.createElement("tr");
    const thSheet = document.createElement("th");
    thSheet.scope = "col";
    thSheet.textContent = `Sheet (${sheets.length})`;
    const thPages = document.createElement("th");
    thPages.scope = "col";
    thPages.textContent = "Pages";
    headRow.append(thSheet, thPages);
    sheetsHead.append(headRow);

    // Table rows
    const fragment = document.createDocumentFragment();
    for (const item of sheets) {
        const row = document.createElement("tr");

        const sheetCell = document.createElement("td");
        sheetCell.className = "sheet-label";
        sheetCell.textContent = `Sheet ${item.sheetNumber}`;

        const pagesCell = document.createElement("td");
        pagesCell.className = "pages-cell";

        const rangeSpan = document.createElement("span");
        rangeSpan.className = "page-range-text";
        rangeSpan.textContent = item.displayLabel;
        pagesCell.append(rangeSpan);

        if (!item.isFull) {
            const badge = document.createElement("span");
            badge.className = "partial-badge";
            badge.textContent = `${item.count} of ${perSheet}`;
            pagesCell.append(badge);
        }

        row.append(sheetCell, pagesCell);
        fragment.append(row);
    }

    pagesBody.textContent = "";
    pagesBody.append(fragment);

    // Summary stats
    const last = sheets[sheets.length - 1];
    statSheets.textContent = String(sheets.length);
    statPages.textContent = String(totalPages);
    statLastSheet.textContent = last.isFull ? "Full" : `${last.count} / ${perSheet} pages`;

    resultsSection.hidden = false;
}

function runCalculation(totalPages) {
    currentSheets = computeSheets(totalPages, pagesPerSheet);
    renderResults(currentSheets, totalPages, pagesPerSheet);
}

form.addEventListener("submit", (event) => {
    event.preventDefault();
    const raw = pageInput.value.trim();
    if (raw === "") return;

    const total = Number(raw);
    if (!Number.isInteger(total) || total < 1) {
        setError("Please enter a whole number of at least 1 page.");
        return;
    }
    if (total > MAX_PAGES) {
        setError(`Please enter ${MAX_PAGES.toLocaleString()} pages or fewer.`);
        return;
    }

    setError("");
    resetCopyFeedback();
    runCalculation(total);

    pageInput.value = "";
    calculateBtn.disabled = true;
    pageInput.focus();
});

// --- Clipboard & Toast Helpers ---
function resetCopyFeedback() {
    if (toastTimer) {
        clearTimeout(toastTimer);
        toastTimer = null;
    }
    if (activeCopyBtn) {
        activeCopyBtn.textContent = activeCopyOriginalLabel;
        activeCopyBtn = null;
        activeCopyOriginalLabel = "";
    }
    toastBanner.hidden = true;
    toastBanner.textContent = "";
}

async function copyWithFeedback(button, text, successMessage) {
    if (!text) return;
    try {
        await navigator.clipboard.writeText(text);
        resetCopyFeedback();

        activeCopyBtn = button;
        activeCopyOriginalLabel = button.textContent;
        button.textContent = "Copied ✓";

        toastBanner.textContent = successMessage;
        toastBanner.hidden = false;

        toastTimer = setTimeout(resetCopyFeedback, 2200);
    } catch {
        toastBanner.textContent = "Clipboard access was blocked by your browser.";
        toastBanner.hidden = false;
    }
}

copyRangeBtn.addEventListener("click", () => {
    const text = currentSheets.map((s) => s.printRange).join(", ");
    copyWithFeedback(copyRangeBtn, text, `Copied print range: ${text}`);
});

copyColumnBtn.addEventListener("click", () => {
    const text = currentSheets.map((s) => s.displayLabel).join("\n");
    copyWithFeedback(copyColumnBtn, text, "Copied pages column to clipboard.");
});

// --- Clear ---
clearBtn.addEventListener("click", () => {
    currentSheets = [];
    pageInput.value = "";
    calculateBtn.disabled = true;
    setError("");
    resetCopyFeedback();
    sheetsHead.textContent = "";
    pagesBody.textContent = "";
    resultsSection.hidden = true;
    pageInput.focus();
});
