import type { InferInput } from 'valibot';

import { callTauriCommand } from '../shared/tauriCommand';
import { incomeContract } from './contract';

export const incomeClient = {
  listIncome: async () => await callTauriCommand(incomeContract.listIncome),
  createIncome: async (input: InferInput<typeof incomeContract.createIncome.input>['input']) =>
    await callTauriCommand(incomeContract.createIncome, { input }),
  updateIncome: async (id: string, input: InferInput<typeof incomeContract.updateIncome.input>['input']) =>
    await callTauriCommand(incomeContract.updateIncome, { id, input }),
  deleteIncome: async (id: string) => {
    await callTauriCommand(incomeContract.deleteIncome, { id });
  },
};
