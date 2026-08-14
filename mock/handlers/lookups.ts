import type { InferOutput } from 'valibot';

import type { LookupItemSchema } from '#src/services/lookups/schema';

type LookupItem = InferOutput<typeof LookupItemSchema>;

export const MOCK_HOUSING_CATEGORY: LookupItem = {
  id: 'aaaaaaaa-1111-4111-8111-111111111111',
  name: 'Housing',
  archived: false,
  sortOrder: 0,
};

export const MOCK_GROCERIES_CATEGORY: LookupItem = {
  id: 'aaaaaaaa-2222-4222-8222-222222222222',
  name: 'Groceries',
  archived: false,
  sortOrder: 1,
};

export const MOCK_EXPENSE_CATEGORIES: LookupItem[] = [MOCK_HOUSING_CATEGORY, MOCK_GROCERIES_CATEGORY];

export const MOCK_W2_INCOME_TYPE: LookupItem = {
  id: 'bbbbbbbb-1111-4111-8111-111111111111',
  name: 'W2',
  archived: false,
  sortOrder: 0,
};

export const MOCK_DIVIDENDS_INCOME_TYPE: LookupItem = {
  id: 'bbbbbbbb-2222-4222-8222-222222222222',
  name: 'Dividends',
  archived: false,
  sortOrder: 1,
};

export const MOCK_INCOME_TYPES: LookupItem[] = [MOCK_W2_INCOME_TYPE, MOCK_DIVIDENDS_INCOME_TYPE];

// Keyed by the Tauri command names each handler answers for — mirrors the
// `command` fields in `src/services/expenseCategories/contract.ts` and
// `src/services/incomeTypes/contract.ts`.
export const lookupsHandlers = {
  list_expense_categories: () => MOCK_EXPENSE_CATEGORIES,
  list_income_types: () => MOCK_INCOME_TYPES,
};
