# Frontend Architecture

## 1. Project setup

- Vite + React + TypeScript, `pnpm create tauri-app` scaffolding as the starting
  point (choose the React/TypeScript/Vite template when prompted).
- Tailwind CSS configured against Vite per Tailwind's standard Vite plugin.
- ESLint + Prettier (or Biome, if Tim wants a single faster tool instead of two) —
  not decided, flag for confirmation; default to ESLint/Prettier since it's the
  safer/more conventional choice if no preference is given.

## 2. Directory layout

```
src/
  routes/                # TanStack Router route tree
    __root.tsx
    index.tsx             # redirects to /dashboard
    dashboard/
      index.tsx
    investments/
      index.tsx            # transaction log table
    expenses/
      index.tsx
    income/
      index.tsx
    settings/
      accounts.tsx           # manage accounts.csv
      categories.tsx           # manage expense_categories.csv
      income-types.tsx          # manage income_types.csv
      import-export.tsx          # CSV/XLSX/JSON/PDF import-export UI
  components/
    ui/                    # thin wrappers around shared React Aria primitives
                            # (pulled from Tim's react-aria-component-library
                            #  where it already has what's needed: text fields,
                            #  selects, buttons; extend here, don't fork there)
    tables/                # TanStack Table column defs + shared table shell
    charts/                 # TanStack Charts wrapper components (see 04-charts-plan.md)
    forms/                    # TanStack Form field components, shared across
                               # the three "add entry" forms
  queries/                 # TanStack Query hooks, one file per domain
    accounts.ts
    lookups.ts
    investments.ts
    expenses.ts
    income.ts
    summary.ts
  stores/                  # TanStack Store instances for local/UI state
    dashboardFilters.ts       # active date range, selected accounts, etc.
    uiState.ts                  # open modals, active row being edited, etc.
  schemas/                  # Valibot schemas — mirrors the data model doc exactly,
                             # this is the single source of truth the backend
                             # types should be checked against by hand when either
                             # side changes
  lib/
    tauri.ts                  # thin wrapper around `invoke()` calls, one function
                               # per backend command, fully typed
    dateRanges.ts               # rolling-12-months / calendar-year / custom range
                                 # helpers shared between dashboard filter UI and
                                 # query params
main.tsx
```

## 3. Where TanStack pieces plug in

- **Router**: file-based or code-based route tree (code-based is easier to keep
  in sync with the `routes/` layout above without extra tooling). Top-level nav:
  Dashboard, Investments, Expenses, Income, Settings.
- **Query**: every `queries/*.ts` file exports hooks like `useAccounts()`,
  `useInvestmentEntries(range)`, `useDashboardInsights(range)` — each wraps a
  single `invoke('command_name', args)` call from `lib/tauri.ts`. Mutations
  (`useCreateExpense()`, etc.) call `queryClient.invalidateQueries()` on success
  for the affected domain so the relevant table/chart refetches automatically.
  This is the standard TanStack Query pattern applied to Tauri commands instead
  of HTTP endpoints — treat `invoke()` calls exactly like `fetch()` calls.
- **Table**: one shared table shell component (sortable headers, pagination or
  virtualization toggle) parameterized by column defs, used for Investments,
  Expenses, and Income logs. Combine with **Virtual** once a log gets long
  (hundreds+ of rows) rather than paginating — better fit for "just keep
  scrolling through my history" than clicking through pages.
- **Form**: one form per "add/edit entry" flow (investment snapshot, expense,
  income), validated with the matching Valibot schema from `schemas/`. Submit
  handler calls the relevant mutation hook.
- **Charts**: see `04-charts-plan.md`.
- **Pacer**: debounce the description/search filter inputs on the transaction
  log tables, and debounce autosave-style interactions if any inline-edit
  pattern gets used (e.g. editing a balance directly in the table).
- **Store**: `dashboardFilters` store holds the active date range + any
  account/category filters; both the summary cards and the charts subscribe to
  it, so changing the range in one place updates everything downstream.
- **Hotkeys**: bind a handful of power-user shortcuts once the core flows work —
  e.g. `n` to open "new expense," `/` to focus the search/filter field. Treat as
  a nice-to-have pass at the end of each domain's build, not a blocker.

## 4. Reusing the React Aria component library

Tim's existing library already has input adornment support (MUI-style
start/end adornments) built on React Aria. For this app:

- **Pull in directly**: TextField, NumberField, Select/ComboBox (for the account/
  category/type dropdowns), Button, Dialog/Modal primitives — anything
  presentation-generic that doesn't know about budgeting concepts.
- **Build fresh in this app**: the transaction table shell, chart wrappers,
  dashboard summary cards, and the account/category management UI in Settings —
  these are domain-specific compositions, not generic primitives, so they belong
  in this app's `components/` tree rather than the shared library. If a pattern
  turns out to be reusable beyond this app, it can graduate into the library
  later — don't force it upfront.

## 5. Dashboard filter UX

Per the earlier decision: default view is rolling trailing-12-months from the
most recent activity, with a filter control to switch to a custom range or a
specific calendar year. Implement `dateRanges.ts` with:

```ts
export function rollingTwelveMonths(mostRecentActivityDate: Date): DateRange;
export function calendarYear(year: number): DateRange;
// custom range is just a raw {start, end} the user picks directly
```

`mostRecentActivityDate` should come from a lightweight backend command (or be
derivable from whatever data's already loaded) rather than assuming "today" —
if Tim is backfilling months at once, "today" and "most recent logged month"
can disagree.

## 6. Build order

1. Scaffold app, wire up Tauri commands stubs, confirm `invoke()` round-trips
   with a trivial "list accounts" call end-to-end before building real UI.
2. Settings pages (accounts, categories, income types) — these unblock every
   dropdown elsewhere, so build them first even though they're not the "main"
   screens.
3. Expenses and Income logs (simpler shape than Investments — good place to
   establish the shared table/form patterns).
4. Investments log (reuses the patterns from step 3, adds the gain/prior-balance
   display logic).
5. Dashboard — summary cards, insights block, then charts last (charts are the
   most visually fiddly part; get the underlying numbers right and visible as
   plain text/table first, then layer charts on top of already-correct data).
6. Import/export UI.
7. Hotkeys pass.
