import type { InferInput } from 'valibot';

import { callTauriCommand } from '../shared/tauriCommand';
import { expensesContract } from './contract';

export const expensesClient = {
  listExpenses: async () => await callTauriCommand(expensesContract.listExpenses),
  createExpense: async (input: InferInput<typeof expensesContract.createExpense.input>['input']) =>
    await callTauriCommand(expensesContract.createExpense, { input }),
  updateExpense: async (id: string, input: InferInput<typeof expensesContract.updateExpense.input>['input']) =>
    await callTauriCommand(expensesContract.updateExpense, { id, input }),
  deleteExpense: async (id: string) => {
    await callTauriCommand(expensesContract.deleteExpense, { id });
  },
};
