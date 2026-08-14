import * as v from 'valibot';

import { accountCategory } from '#src/common/account-categories';

export const AccountSchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  name: v.pipe(v.string(), v.minLength(1), v.maxLength(60)),
  category: accountCategory(),
  archived: v.boolean(),
  sort_order: v.pipe(v.number(), v.integer()),
});

export const AccountListSchema = v.array(AccountSchema);

export const AccountInputSchema = v.omit(AccountSchema, ['id']);
