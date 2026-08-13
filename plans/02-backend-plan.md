# Backend Plan (Rust / Tauri v2)

All file I/O, CSV parsing, rollups, and export generation live in the Rust backend.
The frontend never touches the filesystem directly — everything goes through
Tauri commands.

## 1. Crate list (validate versions when building — don't pin blindly)

- `serde` / `serde_json` — struct (de)serialization
- `csv` — CSV read/write
- `uuid` (v4) — generating stable IDs
- `chrono` — date handling
- `rust_xlsxwriter` — XLSX export
- `printpdf` (or `genpdf` if `printpdf`'s API proves too low-level for a simple
  summary report) — PDF export
- `tauri-plugin-fs` — only if the frontend ever needs direct file dialogs (e.g.
  "choose where to save the exported file"); all _data_ CSVs stay backend-only

## 2. Module layout

```
src-tauri/
  src/
    main.rs
    commands/
      mod.rs
      accounts.rs       # CRUD for accounts.csv
      lookups.rs         # CRUD for expense_categories.csv / income_types.csv
      investments.rs     # CRUD for investments.csv + gain rollups
      expenses.rs         # CRUD for expenses.csv
      income.rs            # CRUD for income.csv
      summary.rs            # cross-file rollups for the dashboard
      export.rs               # CSV/XLSX/JSON/PDF generation
    models/
      mod.rs
      account.rs
      lookup_item.rs
      investment_entry.rs
      expense_entry.rs
      income_entry.rs
    storage/
      mod.rs
      csv_store.rs        # generic typed CSV read/write helper
      paths.rs               # app_data_dir resolution, file path constants
    error.rs               # shared error type, serializes cleanly to the frontend
```

## 3. Build order

### Phase 1 — storage foundation

1. Set up `paths.rs`: resolve the app-data directory, define constants for each
   CSV filename, ensure the directory (and default/seed CSVs) exist on first launch.
2. Build `csv_store.rs`: a generic `read_all<T: DeserializeOwned>(path) -> Result<Vec<T>, AppError>`
   and `write_all<T: Serialize>(path, &[T]) -> Result<(), AppError>`. Keep it dumb —
   whole-file read/rewrite is fine at this data scale (personal finance data for one
   person is small; don't build incremental/streaming writes unless it's ever
   actually needed).
3. Define `AppError` (in `error.rs`) with variants for: file not found, parse
   error (with row number + reason), validation error, IO error. Implement
   `serde::Serialize` on it so Tauri can hand it to the frontend as structured JSON,
   not just a string.
4. Write the models (`models/*.rs`) matching the CSV schema doc exactly, with
   `#[derive(Serialize, Deserialize)]`.
5. Seed data: on first launch (no `accounts.csv` present), write the preset
   expense-category and income-type CSVs from the data model doc. Leave
   `accounts.csv` empty — accounts are personal, no sensible default to seed.

### Phase 2 — CRUD commands

For each of accounts / expense_categories / income_types / investments / expenses
/ income, implement:

- `list_x() -> Vec<X>`
- `create_x(input: XInput) -> X` (generates `id`, appends, rewrites file)
- `update_x(id: String, input: XInput) -> X`
- `delete_x(id: String) -> ()` — for lookup tables this should be **archive**, not
  hard-delete, since transaction rows may reference the id (see data model doc);
  for transaction tables (investments/expenses/income) it's a real delete.

Register all of these in `main.rs`'s `tauri::generate_handler![]` list.

### Phase 3 — rollup/summary commands

This is the part that replaces the Excel formulas. Build these as dedicated
commands rather than making the frontend re-derive everything from raw lists —
keeps the "what does a gain mean" logic in one place.

- `get_investment_gains(range: DateRange) -> Vec<AccountMonthGain>` — for each
  account, for each month in range, compute balance/prior balance/contribution/
  gain$/gain%. This is the direct Rust equivalent of the Investments tab's
  Gain columns plus the Summary tab's "Monthly Gains by Account" table.
- `get_net_worth_by_month(range: DateRange) -> Vec<MonthNetWorth>` — sum of all
  account balances per month.
- `get_spending_by_category(range: DateRange) -> Vec<CategoryMonthTotal>`
- `get_income_by_type(range: DateRange) -> Vec<TypeMonthTotal>`
- `get_dashboard_insights(range: DateRange) -> DashboardInsights` — bundles net
  cash flow, total contributions, savings rate, net worth MoM change, emergency
  fund runway, and top spending category per month, mirroring the "Additional
  Insights" block on the Excel Summary tab. Keep each metric's formula as a
  well-named private function (`fn savings_rate(...)`, `fn emergency_fund_runway(...)`)
  so the assumptions documented in the Excel version (e.g. the savings-rate
  proxy for pre-tax contributions) are easy to find and adjust later — port the
  same caveat comments from the spreadsheet into doc comments here.

`DateRange` should just be `{ start: NaiveDate, end: NaiveDate }` — this is what
lets the frontend implement "rolling trailing 12 months" vs "custom range" vs
"calendar year" without the backend caring which UI mode produced the range.

### Phase 4 — export commands

See `05-export-plan.md` for detail; stub these last since they depend on the
rollup logic from Phase 3 for the PDF summary report specifically.

## 4. Testing priorities (Rust side)

Given there's no existing test strategy decided (see open questions in the
overview doc), prioritize `#[test]`s for:

1. CSV round-trip (write then read gives back identical structs).
2. Gain calculation edge cases: first-ever entry for an account (no prior row →
   gain should be `None`, not `0`), a month with `contribution` but no balance
   change, a withdrawal (negative contribution).
3. Date-range filtering at boundaries (entry exactly on `range.start` /
   `range.end` inclusive/exclusive — decide and document the convention once,
   then test it).
4. Malformed CSV row handling — confirm the error surfaces with a row number
   rather than crashing or silently skipping.
