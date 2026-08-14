import type { InferOutput } from 'valibot';

import type { ExpenseEntrySchema } from '#src/services/expenses/schema';

import { MOCK_GROCERIES_CATEGORY, MOCK_HOUSING_CATEGORY } from './lookups';

type ExpenseEntry = InferOutput<typeof ExpenseEntrySchema>;

export const MOCK_EXPENSES: ExpenseEntry[] = [
  {
    id: 'dddddddd-1111-4111-8111-111111111111',
    date: '2026-08-01',
    description: 'Rent',
    amount: 1800,
    category_id: MOCK_HOUSING_CATEGORY.id,
  },
  {
    id: 'dddddddd-2222-4222-8222-222222222222',
    date: '2026-08-03',
    description: 'Groceries',
    amount: 120.5,
    category_id: MOCK_GROCERIES_CATEGORY.id,
  },
];

export const expensesHandlers = {
  list_expenses: () => MOCK_EXPENSES,
};
