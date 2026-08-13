import * as v from 'valibot';

export const AccountCategorySchema = v.picklist(['hsa', '401k', 'roth_ira', 'hysa', 'checking', 'other']);

export const AccountSchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  name: v.pipe(v.string(), v.minLength(1), v.maxLength(60)),
  category: AccountCategorySchema,
  archived: v.boolean(),
  sortOrder: v.pipe(v.number(), v.integer()),
});

export type Account = v.InferOutput<typeof AccountSchema>;

export const AccountListSchema = v.array(AccountSchema);

// Shape sent to `create_account` — the backend generates `id`.
export const AccountInputSchema = v.omit(AccountSchema, ['id']);

export type AccountInput = v.InferOutput<typeof AccountInputSchema>;
