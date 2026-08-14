import * as v from 'valibot';

export const RestoreSummarySchema = v.object({
  accounts: v.number(),
  expense_categories: v.number(),
  income_types: v.number(),
  investments: v.number(),
  expenses: v.number(),
  income: v.number(),
});
