import * as v from 'valibot';

import { InvestmentEntryInputSchema, InvestmentEntryListSchema, InvestmentEntrySchema } from './schema';

export const investmentsContract = {
  listInvestmentEntries: {
    command: 'list_investment_entries',
    input: v.undefined(),
    output: InvestmentEntryListSchema,
  },
  createInvestmentEntry: {
    command: 'create_investment_entry',
    input: v.object({ input: InvestmentEntryInputSchema }),
    output: InvestmentEntrySchema,
  },
  updateInvestmentEntry: {
    command: 'update_investment_entry',
    input: v.object({ id: v.pipe(v.string(), v.uuid()), input: InvestmentEntryInputSchema }),
    output: InvestmentEntrySchema,
  },
  deleteInvestmentEntry: {
    command: 'delete_investment_entry',
    input: v.object({ id: v.pipe(v.string(), v.uuid()) }),
    output: v.undefined(),
  },
} as const;
