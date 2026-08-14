import * as v from 'valibot';

export const DateRangeSchema = v.object({
  start: v.pipe(v.string(), v.isoDate()),
  end: v.pipe(v.string(), v.isoDate()),
});

export const AccountMonthGainSchema = v.object({
  account_id: v.pipe(v.string(), v.uuid()),
  month: v.string(),
  date: v.pipe(v.string(), v.isoDate()),
  balance: v.number(),
  prior_balance: v.nullable(v.number()),
  contribution: v.number(),
  gain_dollar: v.nullable(v.number()),
  gain_percent: v.nullable(v.number()),
});

export const MonthNetWorthSchema = v.object({
  month: v.string(),
  net_worth: v.number(),
});

export const CategoryMonthTotalSchema = v.object({
  category_id: v.pipe(v.string(), v.uuid()),
  month: v.string(),
  total: v.number(),
});

export const TypeMonthTotalSchema = v.object({
  type_id: v.pipe(v.string(), v.uuid()),
  month: v.string(),
  total: v.number(),
});

export const DashboardInsightsSchema = v.object({
  net_cash_flow: v.number(),
  total_contributions: v.number(),
  savings_rate: v.nullable(v.number()),
  net_worth_change: v.nullable(v.number()),
  emergency_fund_runway_months: v.nullable(v.number()),
  top_spending_category_id: v.nullable(v.pipe(v.string(), v.uuid())),
});
