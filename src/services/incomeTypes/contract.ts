import * as v from 'valibot';

import { LookupItemInputSchema, LookupItemListSchema, LookupItemSchema } from '#src/services/lookups/schema';

export const incomeTypesContract = {
  listIncomeTypes: {
    command: 'list_income_types',
    input: v.undefined(),
    output: LookupItemListSchema,
  },
  createIncomeType: {
    command: 'create_income_type',
    input: v.object({ input: LookupItemInputSchema }),
    output: LookupItemSchema,
  },
  updateIncomeType: {
    command: 'update_income_type',
    input: v.object({ id: v.pipe(v.string(), v.uuid()), input: LookupItemInputSchema }),
    output: LookupItemSchema,
  },
  archiveIncomeType: {
    command: 'archive_income_type',
    input: v.object({ id: v.pipe(v.string(), v.uuid()) }),
    output: v.undefined(),
  },
} as const;
