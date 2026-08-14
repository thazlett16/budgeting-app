import * as v from 'valibot';

export const IncomeEntrySchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  date: v.pipe(v.string(), v.isoDate()),
  description: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
  amount: v.pipe(v.number(), v.minValue(0)),
  type_id: v.pipe(v.string(), v.uuid()),
});

export const IncomeEntryListSchema = v.array(IncomeEntrySchema);

export const IncomeEntryInputSchema = v.omit(IncomeEntrySchema, ['id']);
