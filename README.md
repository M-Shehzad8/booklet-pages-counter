# Booklet Pages Counter

A lightweight, responsive web utility that splits a document's total page count into print-ready sheet ranges for booklet and multi-page-per-sheet printing.

## Features

- **Sheet-by-Sheet Breakdown**: Enter a total page count (`1`–`10,000`) to generate each sheet's page range.
- **Pages-per-Sheet Presets**: Switch between `2`, `4 (Booklet)` (default), and `8` pages per sheet, with instant recalculation.
- **Summary Stats**: Displays total sheets required, total pages, and whether the final sheet is full or partial.
- **One-Click Copy Actions**:
  - **Copy Print Range**: Copies comma-separated ranges (e.g. `1-4, 5-8, 9-10`) ready to paste into browser, Adobe Acrobat, or OS print dialogs.
  - **Copy Column**: Copies the page ranges vertically (one per line) for notes or spreadsheets.
- **Light & Dark Mode**: Toggleable theme with `localStorage` persistence and `prefers-color-scheme` detection.
- **Zero Dependencies**: Built with vanilla HTML, CSS, and JavaScript—works directly via `file://` or any static web server.

## Getting Started

1. Clone or download this folder.
2. Double-click [`index.html`](index.html) to open it in your browser, or serve the folder with any static server (e.g. `npx serve .` or `python -m http.server`).

## Usage

1. Enter the total number of pages in the **Total Pages** field.
2. Select how many pages fit on each sheet (`2`, `4 (Booklet)`, or `8`).
3. Click **Calculate** (or press `Enter`).
4. Use **Copy Print Range** to copy the formatted range for your printer's Custom Pages input, or **Copy Column** for a vertical list.

## Project Structure

- [`index.html`](index.html) — Semantic HTML5 markup and SVG logo
- [`styles.css`](styles.css) — Responsive layout, Indigo/Slate design tokens, and light/dark themes
- [`script.js`](script.js) — Sheet calculation logic, input validation, clipboard helpers, and theme toggle
- [`REVIEW.md`](REVIEW.md) — Code review and feedback on the original beginner version
