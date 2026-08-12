# Data Model & CSV Schema

## 1. File layout

All files live under Tauri's app-data directory (e.g.
`~/.local/share/com.yourorg.budget-tracker/` on Linux, resolved via
`app_handle.path().app_data_dir()`):

```
data/
  accounts.csv           # lookup: investment/cash accounts
  expense_categories.csv # lookup: expense category dropdown
  income_types.csv       # lookup: income type dropdown
  investments.csv        # transaction log: one row per account balance snapshot
  expenses.csv           # transaction log: one row per expense
  income.csv             # transaction log: one row per income event
  meta.json              # app-level settings (schema version, currency, etc.)
```

Lookup files (`accounts.csv`, `expense_categories.csv`, `income_types.csv`) are the
ones Tim wants to be able to **import/export directly** — e.g. download the preset
list, edit it externally, re-upload it. Transaction files are app-managed; still
exportable (see `05-export-plan.md`) but not meant for the user to hand-edit.

## 2. Two-layer validation

1. **Rust → JSON boundary**: the `csv` crate + `serde` parse each CSV row into a
   Rust struct with real types (dates, floats). If a row fails to deserialize
   (bad date, non-numeric amount), the Rust command returns a structured error
   listing the row number and problem — it does not silently drop or coerce data.
2. **Frontend Valibot boundary**: even though Rust already typed the data, the
   frontend re-validates every payload coming across the Tauri IPC boundary with
   Valibot before it touches app state. This catches schema drift (e.g. an old
   CSV file from a prior app version) and gives you one consistent place to define
   "what a valid row looks like" that both read and write paths share. Form
   submissions are validated with the same schemas before being sent to Rust.

## 3. Lookup tables

### `accounts.csv`

| column | type | notes |
|---|---|---|
| `id` | string (uuid) | stable identifier, never reused |
| `name` | string | display name, editable any time |
| `category` | string enum | `hsa` \| `401k` \| `roth_ira` \| `hysa` \| `checking` \| `other` — used for optional grouping/filtering in the UI (not required, but cheap to add now) |
| `archived` | boolean | soft-delete: hide from new-entry dropdowns, keep historical rows intact |
| `sort_order` | integer | controls dropdown/table ordering |

```ts
import * as v from "valibot";

export const AccountCategory = v.picklist([
  "hsa", "401k", "roth_ira", "hysa", "checking", "other",
]);

export const AccountSchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  name: v.pipe(v.string(), v.minLength(1), v.maxLength(60)),
  category: AccountCategory,
  archived: v.boolean(),
  sortOrder: v.pipe(v.number(), v.integer()),
});

export type Account = v.InferOutput<typeof AccountSchema>;
```

### `expense_categories.csv` / `income_types.csv`

Both share the same shape — a generic lookup:

| column | type | notes |
|---|---|---|
| `id` | string (uuid) | |
| `name` | string | |
| `archived` | boolean | |
| `sort_order` | integer | |

```ts
export const LookupItemSchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  name: v.pipe(v.string(), v.minLength(1), v.maxLength(60)),
  archived: v.boolean(),
  sortOrder: v.pipe(v.number(), v.integer()),
});
export type LookupItem = v.InferOutput<typeof LookupItemSchema>;
```

Preset seed values (ship these as the default CSVs on first launch):

- Expense categories: Housing, Groceries, Dining, Transportation, Utilities,
  Insurance, Healthcare, Entertainment, Subscriptions, Shopping, Debt, Other.
- Income types: W2, Dividends, Bonus, Interest, Other.

## 4. Transaction tables

### `investments.csv`

One row per account balance snapshot. No more separate "starting balance" table —
the earliest row per account is implicitly the starting point.

| column | type | notes |
|---|---|---|
| `id` | string (uuid) | |
| `date` | string (ISO `YYYY-MM-DD`) | conventionally the 1st of the month, but not enforced — see note below |
| `account_id` | string (uuid) | FK into `accounts.csv` |
| `balance` | number | the observed balance that month |
| `contribution` | number | money added (positive) or withdrawn (negative) since the prior snapshot; `0` if none |

```ts
export const InvestmentEntrySchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  date: v.pipe(v.string(), v.isoDate()),
  accountId: v.pipe(v.string(), v.uuid()),
  balance: v.number(),
  contribution: v.number(),
});
export type InvestmentEntry = v.InferOutput<typeof InvestmentEntrySchema>;
```

**Gain $ and Gain % are never stored** — they're derived in the frontend (or a
Rust rollup command, see `02-backend-plan.md`) by finding, per account, the
chronologically previous row and computing:

```
gain$   = balance - priorBalance - contribution
gain%   = gain$ / priorBalance   (undefined/"—" if no prior row, or priorBalance = 0)
```

**Note on cadence**: Excel forced one row per account per calendar month. The app
doesn't need to — a user could log more or less often. For v1, keep the mental
model "one snapshot per account per month" and enforce it lightly in the UI (warn,
don't block, on a duplicate account+month), but don't hard-code monthly-only in the
schema itself.

### `expenses.csv`

| column | type | notes |
|---|---|---|
| `id` | string (uuid) | |
| `date` | string (ISO `YYYY-MM-DD`) | actual transaction date, not month-truncated |
| `description` | string | |
| `amount` | number | always positive; sign is implied by which file it's in |
| `category_id` | string (uuid) | FK into `expense_categories.csv` |

```ts
export const ExpenseEntrySchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  date: v.pipe(v.string(), v.isoDate()),
  description: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
  amount: v.pipe(v.number(), v.minValue(0)),
  categoryId: v.pipe(v.string(), v.uuid()),
});
export type ExpenseEntry = v.InferOutput<typeof ExpenseEntrySchema>;
```

### `income.csv`

Identical shape to `expenses.csv`, with `type_id` instead of `category_id`:

```ts
export const IncomeEntrySchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  date: v.pipe(v.string(), v.isoDate()),
  description: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
  amount: v.pipe(v.number(), v.minValue(0)),
  typeId: v.pipe(v.string(), v.uuid()),
});
export type IncomeEntry = v.InferOutput<typeof IncomeEntrySchema>;
```

## 5. `meta.json` (not CSV — small enough for plain JSON)

```json
{
  "schemaVersion": 1,
  "currency": "USD",
  "createdAt": "2026-08-10T00:00:00Z"
}
```

`schemaVersion` exists from day one so a future CSV column change has somewhere to
hang a migration off of, even though there's only one version right now.

## 6. Why CSV (and not SQLite)

Worth stating explicitly since it's a deliberate constraint from the brief, not an
oversight: SQLite would make querying/rollups trivial via SQL, at the cost of the
data no longer being a plain-text file a user (or another tool) can open directly.
Since the brief specifically calls for CSV files as the storage format — and wants
import/export of the lookup lists to be a first-class feature — CSV is the right
call here. The tradeoff is that rollups (gain calculations, monthly aggregates)
have to be computed in application code rather than SQL; see `02-backend-plan.md`
for where that logic lives.
