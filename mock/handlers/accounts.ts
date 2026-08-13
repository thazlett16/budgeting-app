import type { Account } from '#src/services/accounts/schema';

export const MOCK_ROTH_IRA_ACCOUNT: Account = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'Roth IRA',
  category: 'roth_ira',
  archived: false,
  sortOrder: 0,
};

export const MOCK_CHECKING_ACCOUNT: Account = {
  id: '22222222-2222-4222-8222-222222222222',
  name: 'Checking',
  category: 'checking',
  archived: false,
  sortOrder: 1,
};

export const MOCK_ACCOUNTS: Account[] = [MOCK_ROTH_IRA_ACCOUNT, MOCK_CHECKING_ACCOUNT];

// Keyed by the Tauri command name each handler answers for — mirrors the
// `command` field in `src/services/accounts/contract.ts`.
export const accountsHandlers = {
  list_accounts: () => MOCK_ACCOUNTS,
};
