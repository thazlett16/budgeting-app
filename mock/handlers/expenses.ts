import type { ExpenseEntry } from '#src/services/expenses/schema';

import { MOCK_EXPENSE_CATEGORIES } from './lookups';

export const MOCK_EXPENSES: ExpenseEntry[] = [
  {
    id: 'dddddddd-1111-4111-8111-111111111111',
    date: '2026-08-01',
    description: 'Rent',
    amount: 1800,
    categoryId: MOCK_EXPENSE_CATEGORIES[0].id,
  },
  {
    id: 'dddddddd-2222-4222-8222-222222222222',
    date: '2026-08-03',
    description: 'Groceries',
    amount: 120.5,
    categoryId: MOCK_EXPENSE_CATEGORIES[1].id,
  },
];

export const expensesHandlers = {
  list_expenses: () => MOCK_EXPENSES,
};
