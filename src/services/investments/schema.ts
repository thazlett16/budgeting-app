import * as v from 'valibot';

export const InvestmentEntrySchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  date: v.pipe(v.string(), v.isoDate()),
  accountId: v.pipe(v.string(), v.uuid()),
  balance: v.number(),
  contribution: v.number(),
});

export type InvestmentEntry = v.InferOutput<typeof InvestmentEntrySchema>;

export const InvestmentEntryListSchema = v.array(InvestmentEntrySchema);

// Gain $ / gain % are never stored — see plans/01-data-model-and-csv-schema.md
// §4 — they're derived client- or server-side from the prior row per account.
export const InvestmentEntryInputSchema = v.omit(InvestmentEntrySchema, ['id']);

export type InvestmentEntryInput = v.InferOutput<typeof InvestmentEntryInputSchema>;
