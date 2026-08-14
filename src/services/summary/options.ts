import { queryOptions } from '@tanstack/react-query';

import type { InferInput } from 'valibot';

import type { summaryContract } from './contract';
import { summaryClient } from './client';

type DateRange = InferInput<typeof summaryContract.getInvestmentGains.input>['range'];

export const summaryOptions = {
  serviceEntity: () => ['summary'] as const,

  investmentGains: (range: DateRange) => [...summaryOptions.serviceEntity(), 'investment-gains', range] as const,
  investmentGainsQueryOptions: (range: DateRange) =>
    queryOptions({
      queryKey: summaryOptions.investmentGains(range),
      queryFn: async () => await summaryClient.getInvestmentGains(range),
    }),

  netWorthByMonth: (range: DateRange) => [...summaryOptions.serviceEntity(), 'net-worth-by-month', range] as const,
  netWorthByMonthQueryOptions: (range: DateRange) =>
    queryOptions({
      queryKey: summaryOptions.netWorthByMonth(range),
      queryFn: async () => await summaryClient.getNetWorthByMonth(range),
    }),

  spendingByCategory: (range: DateRange) => [...summaryOptions.serviceEntity(), 'spending-by-category', range] as const,
  spendingByCategoryQueryOptions: (range: DateRange) =>
    queryOptions({
      queryKey: summaryOptions.spendingByCategory(range),
      queryFn: async () => await summaryClient.getSpendingByCategory(range),
    }),

  incomeByType: (range: DateRange) => [...summaryOptions.serviceEntity(), 'income-by-type', range] as const,
  incomeByTypeQueryOptions: (range: DateRange) =>
    queryOptions({
      queryKey: summaryOptions.incomeByType(range),
      queryFn: async () => await summaryClient.getIncomeByType(range),
    }),

  dashboardInsights: (range: DateRange) => [...summaryOptions.serviceEntity(), 'dashboard-insights', range] as const,
  dashboardInsightsQueryOptions: (range: DateRange) =>
    queryOptions({
      queryKey: summaryOptions.dashboardInsights(range),
      queryFn: async () => await summaryClient.getDashboardInsights(range),
    }),
};
