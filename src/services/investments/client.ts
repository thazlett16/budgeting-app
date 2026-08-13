import type { InferInput } from 'valibot';

import { callTauriCommand } from '../shared/tauriCommand';
import { investmentsContract } from './contract';

export const investmentsClient = {
  listInvestmentEntries: async () => await callTauriCommand(investmentsContract.listInvestmentEntries),
  createInvestmentEntry: async (input: InferInput<typeof investmentsContract.createInvestmentEntry.input>['input']) =>
    await callTauriCommand(investmentsContract.createInvestmentEntry, { input }),
  updateInvestmentEntry: async (
    id: string,
    input: InferInput<typeof investmentsContract.updateInvestmentEntry.input>['input'],
  ) => await callTauriCommand(investmentsContract.updateInvestmentEntry, { id, input }),
  deleteInvestmentEntry: async (id: string) => {
    await callTauriCommand(investmentsContract.deleteInvestmentEntry, { id });
  },
};
