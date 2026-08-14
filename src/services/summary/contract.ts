import * as v from 'valibot';

import {
  AccountMonthGainSchema,
  CategoryMonthTotalSchema,
  DashboardInsightsSchema,
  DateRangeSchema,
  MonthNetWorthSchema,
  TypeMonthTotalSchema,
} from './schema';

/**
 * Typed description of every `commands/summary.rs` Tauri command this
 * service calls — see `services/accounts/contract.ts` for the pattern.
 */
export const summaryContract = {
  getInvestmentGains: {
    command: 'get_investment_gains',
    input: v.object({ range: DateRangeSchema }),
    output: v.array(AccountMonthGainSchema),
  },
  getNetWorthByMonth: {
    command: 'get_net_worth_by_month',
    input: v.object({ range: DateRangeSchema }),
    output: v.array(MonthNetWorthSchema),
  },
  getSpendingByCategory: {
    command: 'get_spending_by_category',
    input: v.object({ range: DateRangeSchema }),
    output: v.array(CategoryMonthTotalSchema),
  },
  getIncomeByType: {
    command: 'get_income_by_type',
    input: v.object({ range: DateRangeSchema }),
    output: v.array(TypeMonthTotalSchema),
  },
  getDashboardInsights: {
    command: 'get_dashboard_insights',
    input: v.object({ range: DateRangeSchema }),
    output: DashboardInsightsSchema,
  },
} as const;
