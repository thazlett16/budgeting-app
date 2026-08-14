import * as v from 'valibot';

export const ExpenseEntrySchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  date: v.pipe(v.string(), v.isoDate()),
  description: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
  amount: v.pipe(v.number(), v.minValue(0)),
  category_id: v.pipe(v.string(), v.uuid()),
});

export const ExpenseEntryListSchema = v.array(ExpenseEntrySchema);

export const ExpenseEntryInputSchema = v.omit(ExpenseEntrySchema, ['id']);
