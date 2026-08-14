import * as v from 'valibot';

import { IncomeEntryInputSchema, IncomeEntryListSchema, IncomeEntrySchema } from './schema';

export const incomeContract = {
  listIncome: {
    command: 'list_income',
    input: v.undefined(),
    output: IncomeEntryListSchema,
  },
  createIncome: {
    command: 'create_income',
    input: v.object({ input: IncomeEntryInputSchema }),
    output: IncomeEntrySchema,
  },
  updateIncome: {
    command: 'update_income',
    input: v.object({ id: v.pipe(v.string(), v.uuid()), input: IncomeEntryInputSchema }),
    output: IncomeEntrySchema,
  },
  deleteIncome: {
    command: 'delete_income',
    input: v.object({ id: v.pipe(v.string(), v.uuid()) }),
    output: v.null(),
  },
} as const;
