import * as v from 'valibot';

export const InvestmentEntrySchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  date: v.pipe(v.string(), v.isoDate()),
  account_id: v.pipe(v.string(), v.uuid()),
  balance: v.number(),
  contribution: v.number(),
});

export const InvestmentEntryListSchema = v.array(InvestmentEntrySchema);

export const InvestmentEntryInputSchema = v.omit(InvestmentEntrySchema, ['id']);
