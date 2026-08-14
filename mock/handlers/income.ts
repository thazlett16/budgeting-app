import type { InferOutput } from 'valibot';

import type { IncomeEntrySchema } from '#src/services/income/schema';

import { MOCK_W2_INCOME_TYPE } from './lookups';

type IncomeEntry = InferOutput<typeof IncomeEntrySchema>;

export const MOCK_INCOME: IncomeEntry[] = [
  {
    id: 'eeeeeeee-1111-4111-8111-111111111111',
    date: '2026-08-01',
    description: 'Paycheck',
    amount: 4200,
    type_id: MOCK_W2_INCOME_TYPE.id,
  },
];

export const incomeHandlers = {
  list_income: () => MOCK_INCOME,
};
