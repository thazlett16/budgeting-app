import type { InferInput } from 'valibot';

import { callTauriCommand } from '../shared/tauriCommand';
import { accountsContract } from './contract';

export const accountsClient = {
  listAccounts: async () => await callTauriCommand(accountsContract.listAccounts),
  createAccount: async (input: InferInput<typeof accountsContract.createAccount.input>['input']) =>
    await callTauriCommand(accountsContract.createAccount, { input }),
  updateAccount: async (id: string, input: InferInput<typeof accountsContract.updateAccount.input>['input']) =>
    await callTauriCommand(accountsContract.updateAccount, { id, input }),
  archiveAccount: async (id: string) => {
    await callTauriCommand(accountsContract.archiveAccount, { id });
  },
};
