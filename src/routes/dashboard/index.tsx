import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import * as m from '#src/paraglide/messages';
import { accountsOptions } from '#src/services/accounts/options';
import { expenseCategoriesOptions } from '#src/services/expenseCategories/options';
import { incomeTypesOptions } from '#src/services/incomeTypes/options';
import { summaryOptions } from '#src/services/summary/options';

import { AccountBalanceChart } from './-dashboard/account-balance-chart';
import { trailingTwelveMonthsRange } from './-dashboard/date-range';
import { IncomeByTypeChart } from './-dashboard/income-by-type-chart';
import { NetWorthChart } from './-dashboard/net-worth-chart';
import { SpendingByCategoryChart } from './-dashboard/spending-by-category-chart';

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
});

function formatCurrency(value: number | null) {
  if (value === null) {
    return m.dashboard_no_data();
  }

  return value.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
}

function formatPercent(value: number | null) {
  if (value === null) {
    return m.dashboard_no_data();
  }

  return `${(value * 100).toFixed(1)}%`;
}

function formatMonths(value: number | null) {
  if (value === null) {
    return m.dashboard_no_data();
  }

  return `${value.toFixed(1)} mo`;
}

interface InsightCardProps {
  label: string;
  value: string;
}

function InsightCard({ label, value }: InsightCardProps) {
  return (
    <div className="border-border flex flex-col gap-1 rounded-md border p-4">
      <span className="text-muted-foreground text-xs font-medium">{label}</span>
      <span className="text-lg font-semibold">{value}</span>
    </div>
  );
}

function DashboardPage() {
  const range = trailingTwelveMonthsRange();

  const accountsQuery = useQuery(accountsOptions.listAccountsQueryOptions());
  const categoriesQuery = useQuery(expenseCategoriesOptions.listExpenseCategoriesQueryOptions());
  const incomeTypesQuery = useQuery(incomeTypesOptions.listIncomeTypesQueryOptions());
  const netWorthQuery = useQuery(summaryOptions.netWorthByMonthQueryOptions(range));
  const investmentGainsQuery = useQuery(summaryOptions.investmentGainsQueryOptions(range));
  const spendingQuery = useQuery(summaryOptions.spendingByCategoryQueryOptions(range));
  const incomeByTypeQuery = useQuery(summaryOptions.incomeByTypeQueryOptions(range));
  const insightsQuery = useQuery(summaryOptions.dashboardInsightsQueryOptions(range));

  const accountsById = new Map((accountsQuery.data ?? []).map((account) => [account.id, account]));
  const categoriesById = new Map((categoriesQuery.data ?? []).map((category) => [category.id, category]));
  const incomeTypesById = new Map((incomeTypesQuery.data ?? []).map((type) => [type.id, type]));

  const netWorthRows = netWorthQuery.data ?? [];

  const accountBalanceRows = (investmentGainsQuery.data ?? []).map((row) => ({
    date: row.date,
    account: accountsById.get(row.account_id)?.name ?? row.account_id,
    balance: row.balance,
  }));

  const spendingTotalsByCategory = new Map<string, number>();

  for (const row of spendingQuery.data ?? []) {
    const existing = spendingTotalsByCategory.get(row.category_id) ?? 0;
    spendingTotalsByCategory.set(row.category_id, existing + row.total);
  }

  const spendingRows = [...spendingTotalsByCategory.entries()]
    .map(([categoryId, total]) => ({
      category: categoriesById.get(categoryId)?.name ?? categoryId,
      total,
    }))
    .toSorted((a, b) => b.total - a.total);

  const incomeTotalsByType = new Map<string, number>();

  for (const row of incomeByTypeQuery.data ?? []) {
    const existing = incomeTotalsByType.get(row.type_id) ?? 0;
    incomeTotalsByType.set(row.type_id, existing + row.total);
  }

  const incomeRows = [...incomeTotalsByType.entries()]
    .map(([typeId, total]) => ({
      type: incomeTypesById.get(typeId)?.name ?? typeId,
      total,
    }))
    .toSorted((a, b) => b.total - a.total);

  const insights = insightsQuery.data;

  let topSpendingCategoryLabel: string = m.dashboard_no_data();

  if (insights?.top_spending_category_id) {
    topSpendingCategoryLabel =
      categoriesById.get(insights.top_spending_category_id)?.name ?? insights.top_spending_category_id;
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 p-6">
      <div>
        <h1 className="text-lg font-semibold">{m.dashboard_title()}</h1>
        <p className="text-muted-foreground text-sm">{m.dashboard_description()}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <InsightCard
          label={m.dashboard_insight_net_cash_flow()}
          value={formatCurrency(insights?.net_cash_flow ?? null)}
        />
        <InsightCard
          label={m.dashboard_insight_total_contributions()}
          value={formatCurrency(insights?.total_contributions ?? null)}
        />
        <InsightCard
          label={m.dashboard_insight_savings_rate()}
          value={formatPercent(insights?.savings_rate ?? null)}
        />
        <InsightCard
          label={m.dashboard_insight_net_worth_change()}
          value={formatCurrency(insights?.net_worth_change ?? null)}
        />
        <InsightCard
          label={m.dashboard_insight_emergency_fund_runway()}
          value={formatMonths(insights?.emergency_fund_runway_months ?? null)}
        />
        <InsightCard
          label={m.dashboard_insight_top_spending_category()}
          value={topSpendingCategoryLabel}
        />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold">{m.dashboard_net_worth_chart_title()}</h2>
        <NetWorthChart rows={netWorthRows} />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold">{m.dashboard_account_balance_chart_title()}</h2>
        <AccountBalanceChart rows={accountBalanceRows} />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold">{m.dashboard_spending_chart_title()}</h2>
        <SpendingByCategoryChart rows={spendingRows} />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold">{m.dashboard_income_chart_title()}</h2>
        <IncomeByTypeChart rows={incomeRows} />
      </div>
    </div>
  );
}
