import type { InvestmentEntry } from '#src/services/investments/schema';

import { MOCK_ROTH_IRA_ACCOUNT } from './accounts';

export const MOCK_INVESTMENT_ENTRIES: InvestmentEntry[] = [
  {
    id: 'cccccccc-1111-4111-8111-111111111111',
    date: '2026-07-01',
    accountId: MOCK_ROTH_IRA_ACCOUNT.id,
    balance: 15_000,
    contribution: 500,
  },
  {
    id: 'cccccccc-2222-4222-8222-222222222222',
    date: '2026-08-01',
    accountId: MOCK_ROTH_IRA_ACCOUNT.id,
    balance: 15_750,
    contribution: 500,
  },
];

export const investmentsHandlers = {
  list_investment_entries: () => MOCK_INVESTMENT_ENTRIES,
};
