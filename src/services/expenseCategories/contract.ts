import * as v from 'valibot';

import { LookupItemInputSchema, LookupItemListSchema, LookupItemSchema } from '../lookups/schema';

export const expenseCategoriesContract = {
  listExpenseCategories: {
    command: 'list_expense_categories',
    input: v.undefined(),
    output: LookupItemListSchema,
  },
  createExpenseCategory: {
    command: 'create_expense_category',
    input: v.object({ input: LookupItemInputSchema }),
    output: LookupItemSchema,
  },
  updateExpenseCategory: {
    command: 'update_expense_category',
    input: v.object({ id: v.pipe(v.string(), v.uuid()), input: LookupItemInputSchema }),
    output: LookupItemSchema,
  },
  archiveExpenseCategory: {
    command: 'archive_expense_category',
    input: v.object({ id: v.pipe(v.string(), v.uuid()) }),
    output: v.undefined(),
  },
} as const;
