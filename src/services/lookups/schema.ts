import * as v from 'valibot';

/**
 * Shared shape backing both `expense_categories.csv` and `income_types.csv`
 * (see `plans/01-data-model-and-csv-schema.md` §3) — the `expenseCategories`
 * and `incomeTypes` services each build their own `contract`/`client` on
 * top of this so they still call distinct, domain-named Tauri commands.
 */
export const LookupItemSchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  name: v.pipe(v.string(), v.minLength(1), v.maxLength(60)),
  archived: v.boolean(),
  sort_order: v.pipe(v.number(), v.integer()),
});

export const LookupItemListSchema = v.array(LookupItemSchema);

export const LookupItemInputSchema = v.omit(LookupItemSchema, ['id']);
