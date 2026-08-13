import * as v from 'valibot';

import { ExpenseEntryInputSchema, ExpenseEntryListSchema, ExpenseEntrySchema } from './schema';

export const expensesContract = {
  listExpenses: {
    command: 'list_expenses',
    input: v.undefined(),
    output: ExpenseEntryListSchema,
  },
  createExpense: {
    command: 'create_expense',
    input: v.object({ input: ExpenseEntryInputSchema }),
    output: ExpenseEntrySchema,
  },
  updateExpense: {
    command: 'update_expense',
    input: v.object({ id: v.pipe(v.string(), v.uuid()), input: ExpenseEntryInputSchema }),
    output: ExpenseEntrySchema,
  },
  deleteExpense: {
    command: 'delete_expense',
    input: v.object({ id: v.pipe(v.string(), v.uuid()) }),
    output: v.undefined(),
  },
} as const;
