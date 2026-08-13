import type { IncomeEntry } from '#src/services/income/schema';

import { MOCK_INCOME_TYPES } from './lookups';

export const MOCK_INCOME: IncomeEntry[] = [
  {
    id: 'eeeeeeee-1111-4111-8111-111111111111',
    date: '2026-08-01',
    description: 'Paycheck',
    amount: 4200,
    typeId: MOCK_INCOME_TYPES[0].id,
  },
];

export const incomeHandlers = {
  list_income: () => MOCK_INCOME,
};
