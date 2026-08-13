# Budget & Net Worth Tracker — Desktop/Mobile App Plan

This is the master decisions log for converting the Excel-based Budget & Net Worth
Tracker into a Tauri app. Read this file first — the other files in this folder are
step-by-step build guides that assume the decisions below.

## 1. What this app replaces

The Excel workbook (`Budget_and_Net_Worth_Tracker.xlsx`) has four tabs:

- **Summary** — monthly investment gains by account, account balances/net worth,
  spending by category, income by type, net cash flow, and derived insights
  (savings rate, net worth MoM change, emergency fund runway, top spending category).
  Two charts: portfolio value + gains over time, and per-account value over time.
- **Investments** — one row per account per month: balance, contribution/withdrawal,
  with gain $ / gain % computed against the prior month.
- **Expenses** — flat log: date, description, amount, category.
- **Income** — flat log: date, description, amount, type.

The app should keep this same conceptual model but drop the constraints Excel forced
on us (fixed year-wide column grids, text-based account names as the join key,
manual "copy the last column over" for new years).

## 2. Core architecture decisions

| Decision                 | Choice                                                                                                      | Why                                                                                                                         |
| ------------------------ | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Framework                | Tauri v2                                                                                                    | v1 has no mobile support; v2 targets desktop + iOS/Android from one codebase                                                |
| Frontend                 | React + Vite + TypeScript                                                                                   | Standard, fast dev loop, matches existing skillset                                                                          |
| Package manager          | pnpm                                                                                                        | User preference                                                                                                             |
| Styling                  | Tailwind CSS                                                                                                | Per original request                                                                                                        |
| Component primitives     | React Aria Components, selectively shared with Tim's existing [[react-aria-component-library]]              | Reuse input/dropdown primitives; build app-specific composite components (tables, cards, charts wrappers) fresh in this app |
| State/data layer         | TanStack Query (server-state cache over Tauri commands) + TanStack Store (small bits of local UI/app state) | Matches the full TanStack adoption requested                                                                                |
| Routing                  | TanStack Router                                                                                             | Requested explicitly                                                                                                        |
| Tables                   | TanStack Table (+ TanStack Virtual for long transaction logs)                                               | Requested explicitly                                                                                                        |
| Forms                    | TanStack Form                                                                                               | Requested explicitly                                                                                                        |
| Charts                   | TanStack Charts (`@tanstack/react-charts`)                                                                  | Requested explicitly                                                                                                        |
| Rate limiting/debouncing | TanStack Pacer                                                                                              | For autosave-on-type / search filtering                                                                                     |
| Keyboard shortcuts       | TanStack Hotkeys                                                                                            | For power-user data entry (e.g. quick-add expense)                                                                          |
| Data storage             | CSV files, read/written entirely by the **Rust backend**                                                    | Per decision below                                                                                                          |
| Validation               | Valibot, on the **frontend**, at two boundaries (see Data Model doc)                                        | Per decision below                                                                                                          |
| Data location            | Tauri's app-data directory (`app_data_dir()`), not a user-chosen folder                                     | Single-device only for v1; no sync                                                                                          |
| Export formats           | CSV, XLSX, JSON (full backup), PDF (summary report) — all generated **in Rust**                             | Per decision below                                                                                                          |
| Packaging                | Native Arch build via `cargo tauri build`, standard Vite/pnpm/Node toolchain                                | No Flatpak packaging needed                                                                                                 |
| Dashboard default view   | Rolling trailing-12-months, filterable to any custom range                                                  | Not locked to Excel's calendar-year grid anymore                                                                            |

## 3. Data model shift from Excel → app (important)

In Excel, accounts/categories/types were **plain text** typed directly into cells —
renaming an account meant a Find & Replace across every historical row, or your
SUMIFS stopped matching.

In the app, every lookup list (Accounts, Expense Categories, Income Types) gets a
**stable ID**. Transaction rows reference the ID, not the display name. Renaming an
account in Settings updates the display everywhere instantly, with zero risk of
breaking historical data. This is the single biggest structural improvement over
the spreadsheet — make sure it's not skipped for the sake of "matching Excel exactly."

Similarly, there's no more "Starting Balance" table as a separate concept. The first
recorded balance row for an account **is** its starting point — gain/gain % is simply
not computed (shown as "—") when there's no prior row for that account.

## 4. Open questions / assumptions to confirm with Tim before or during build

These weren't nailed down in the planning conversation — flagged here rather than
guessed silently:

- **State library split**: TanStack Store is used for local/UI state (open modals,
  active filters, form draft state not yet submitted). TanStack Query owns
  everything that round-trips through Tauri commands (it treats the Rust backend
  like a "server"). Confirm this split feels right once building starts.
- **Multiple profiles/workbooks**: not discussed. Current plan assumes a single
  dataset per app install (one app-data directory). If Tim wants to switch between
  multiple "books" (e.g. personal vs. joint), that's a v2 feature — flag before
  building Settings/onboarding.
- **CSV file locking**: single-device, single-process, so no locking strategy is
  planned. If multiple app windows could ever be open at once, revisit.
- **Rust crates**: `csv` + `serde` for parsing, `rust_xlsxwriter` for XLSX export,
  `printpdf` (or `genpdf` as a simpler alternative) for the PDF summary report.
  These aren't confirmed against Tim's actual environment/toolchain — validate crate
  choice during Phase 1 of the backend plan.
- **Testing strategy**: not discussed at all. Suggest Vitest for frontend unit
  tests, Rust's built-in `#[test]` for backend logic (especially CSV parsing and
  gain/rollup calculations, since those are the highest-value things to get right),
  and Playwright or Tauri's WebDriver support for a handful of end-to-end smoke
  tests. Revisit with Tim before Phase 1 if he has a different preference.

## 5. Guide index

1. `01-data-model-and-csv-schema.md` — every CSV file, its columns, its Valibot
   schema, and the ID-based lookup design.
2. `02-backend-plan.md` — Rust/Tauri commands, file layout, step-by-step build order.
3. `03-frontend-architecture.md` — routing, pages, TanStack wiring, component
   boundaries, state ownership.
4. `04-charts-plan.md` — each chart from the Excel Summary tab, translated to
   TanStack Charts, with the query/rollup logic each one needs.
5. `05-export-plan.md` — CSV/XLSX/JSON/PDF export, implementation approach per format.
6. `06-testing-and-packaging.md` — test strategy and `cargo tauri build` packaging
   for Arch Linux, with notes on desktop/mobile target expansion later.

Build these roughly in order — data model first, backend second, frontend third —
though charts and export can be built in parallel with frontend once the backend
commands they depend on exist.
