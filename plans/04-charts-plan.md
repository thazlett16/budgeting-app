# Charts Plan (`@tanstack/react-charts`)

Each chart below corresponds directly to something on the Excel Summary tab, so
the "what should this show" question is already answered — this doc is about the
data shape each one needs and how it's fed by the backend rollup commands from
`02-backend-plan.md`.

## 1. Portfolio Value & Gains Over Time

**Excel equivalent**: Chart 1 — Net Worth (primary axis) + Total Gains (secondary
axis) line chart.

- **Data source**: `get_net_worth_by_month(range)` + the gains total from
  `get_investment_gains(range)` summed across accounts per month.
- **Shape needed**: two series, one dollar-scaled very differently from the
  other (net worth in the tens of thousands, monthly gains in the hundreds) —
  this needs a **dual-axis** line chart. Confirm during build whether
  `@tanstack/react-charts` supports independent left/right Y axes cleanly at
  the version you're on; if not, the fallback is two stacked charts sharing an
  X axis instead of one chart with two Y axes — visually different from the
  Excel version but functionally equivalent, and worth flagging back to Tim if
  it comes to that rather than silently picking one.
- **X axis**: month (categorical or time scale — time scale is preferable so
  gaps in logged months render as gaps, not squished together).

## 2. Account Value Over Time

**Excel equivalent**: Chart 2 — one line per account (8 lines).

- **Data source**: `get_investment_gains(range)`, pull the running `balance`
  per account per month (not the gain — the raw value).
- **Shape needed**: one series per active (non-archived) account. Since account
  count isn't fixed at 8 anymore (Tim can add/archive accounts freely), this
  chart needs to handle an arbitrary number of series — pick a color scale that
  scales reasonably past ~8-10 lines, and consider a legend toggle to
  hide/show individual accounts once the account list grows, since an
  all-lines-visible chart gets unreadable past a handful of accounts.

## 3. Monthly Spending by Category

**Excel equivalent**: the "Monthly Spending by Category" table (no chart in the
spreadsheet version — Excel just had the numbers). Worth adding a chart here
since it's a natural fit and wasn't hard-constrained by the original request.

- **Data source**: `get_spending_by_category(range)`.
- **Suggested shape**: stacked bar chart, one bar per month, segments per
  category — gives an at-a-glance "where did the money go" view that a flat
  table doesn't. Treat as a nice-to-have addition beyond strict Excel parity;
  confirm with Tim before investing much time if the table alone is enough.

## 4. Net Cash Flow Over Time

**Excel equivalent**: the "Net Cash Flow (Income − Spending)" row — again just
numbers in the spreadsheet.

- **Data source**: derived from `get_income_by_type(range)` totals minus
  `get_spending_by_category(range)` totals per month (or directly from
  `get_dashboard_insights(range)` if that command exposes it pre-computed —
  prefer that, keeps the "what counts as cash flow" logic in one Rust place).
- **Suggested shape**: simple bar chart, positive/negative bars per month
  (green above zero, red below) — makes months where spending exceeded income
  immediately visible, more so than scanning a number in a table.

## 5. General implementation notes

- Keep a single reusable `<TimeSeriesLineChart />` / `<MonthlyBarChart />`
  wrapper in `components/charts/` rather than hand-rolling `@tanstack/react-charts`
  config in every page — the four charts above share enough structure (monthly
  X axis, dollar-formatted Y axis, consistent color palette) that duplicating
  the setup four times would just create four places to fix the same bug.
- Dollar formatting, date formatting, and the color palette should come from
  one shared `lib/chartFormatting.ts` so the charts and the summary
  cards/tables agree visually (e.g. don't let the chart round to whole dollars
  while the table shows cents).
- All four charts should respond to the same `dashboardFilters` Store range —
  don't give each chart its own independent date picker.
