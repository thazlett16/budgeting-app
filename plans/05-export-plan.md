# Export Plan

All export generation happens in Rust (`commands/export.rs`), per the earlier
decision to keep file I/O in one place. The frontend triggers an export command,
gets back either raw bytes or a file path, and uses Tauri's save-file dialog
(`tauri-plugin-dialog`) to let the user choose where it lands on disk.

## 1. CSV export

The simplest case — this is close to a direct copy of the underlying data files,
but should go through the same typed models rather than literally copying the
raw file, so that:
- Archived accounts/categories can optionally be excluded or included (user
  choice at export time).
- A date-range filter can be applied (export just this year's expenses, e.g.)
  rather than always exporting everything.
- The `account_id` / `category_id` / `type_id` foreign keys are resolved to
  their human-readable names in the exported file — the internal CSVs use IDs
  for stability, but an exported CSV a user opens in a spreadsheet should show
  "Roth IRA", not a UUID.

Implementation: reuse the `csv` crate writer, same as the internal storage
layer, just writing a denormalized view (join in the account/category/type
name) instead of the raw table.

## 2. XLSX export

Goal: produce something structurally similar to the original Excel workbook —
useful both as a familiar artifact for Tim and as a sanity-check that the app's
numbers match what the spreadsheet used to compute.

- Use `rust_xlsxwriter` to build a workbook with Investments / Expenses / Income
  sheets (denormalized, same as the CSV export) plus a Summary sheet.
- The Summary sheet should mirror the tables from the original spreadsheet
  (Monthly Gains by Account, Account Balance/Net Worth, Spending by Category,
  Income by Type, Net Cash Flow, Additional Insights) — but as **computed
  values**, not live formulas. Recomputing that whole formula graph in
  `rust_xlsxwriter` would duplicate all the rollup logic already living in
  `commands/summary.rs`; simpler and less error-prone to compute once in Rust
  and write the results as static numbers. Note this tradeoff in the exported
  file itself (a small note cell, similar to the "Source: ..." convention used
  in the original workbook) so it's clear the export is a point-in-time
  snapshot, not a live spreadsheet.
- Reuse number formats from the original workbook build script where it makes
  sense (`$#,##0` for dollars, `0.0%` for percentages) for visual consistency.

## 3. JSON export (full backup/restore)

- A single JSON file containing every lookup and transaction table, plus
  `meta.json`, effectively a full snapshot of the app-data directory in one
  portable file.
- This doubles as the **restore/import** format — a "Restore from backup"
  action in Settings should accept this same file shape and overwrite (with
  confirmation) the current data directory. This is the most important export
  format to get right early, since it's the only real safety net against data
  loss until any future sync feature exists.
- Version the file with the same `schemaVersion` field from `meta.json` so a
  restore can detect and (eventually) migrate an older backup rather than
  failing silently on a future schema change.

## 4. PDF summary report

- Lowest priority of the four — build last, after the XLSX export exists,
  since it can reuse the same computed-summary-values approach rather than
  recomputing anything new.
- Scope for v1: a single-page (or few-page) report with the same content as
  the app's Dashboard for the currently-selected date range — net worth, total
  gains, spending by category, net cash flow, and the insights block — laid
  out as a simple printable summary, not a full data dump (that's what the
  CSV/XLSX exports are for).
- `printpdf` is fairly low-level (you're placing text/lines by coordinates).
  If the layout work feels like too much for a v1, `genpdf` (built on top of
  `printpdf`) gives simple flowing text/table layout primitives — worth
  evaluating both briefly before committing.

## 5. Import (lookup lists only, for v1)

Per the original request — "upload a list of dropdown options... download the
basic preset ones for each category type" — import is scoped to the three
lookup tables (`accounts.csv`, `expense_categories.csv`, `income_types.csv`)
for v1, not transaction data:

- **Download preset**: a static command that returns the seed CSV content
  for expense categories / income types (the same lists used to seed a fresh
  install) — lets a user restore the defaults after they've customized things.
- **Upload custom list**: parse an uploaded CSV against the `LookupItemSchema`
  (or `AccountSchema`), validate every row before writing anything, and reject
  the whole import with a clear per-row error list if any row fails — never
  partially import a lookup file, since a half-imported dropdown list is worse
  than no import at all.
- Transaction-data import (e.g. bulk-importing historical expenses from a bank
  export) is explicitly out of scope for v1 per the conversation — flag as a
  natural v2 feature once the core app is solid, since it'll need its own
  column-mapping UI to be genuinely useful.
