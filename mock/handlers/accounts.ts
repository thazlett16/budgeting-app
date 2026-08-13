import type { Account } from '#src/services/accounts/schema';

export const MOCK_ACCOUNTS: Array<Account> = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'Roth IRA',
    category: 'roth_ira',
    archived: false,
    sortOrder: 0,
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    name: 'Checking',
    category: 'checking',
    archived: false,
    sortOrder: 1,
  },
];

// Keyed by the Tauri command name each handler answers for — mirrors the
// `command` field in `src/services/accounts/contract.ts`.
export const accountsHandlers = {
  list_accounts: () => MOCK_ACCOUNTS,
};
