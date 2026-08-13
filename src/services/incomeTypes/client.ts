import type { InferInput } from 'valibot';

import { callTauriCommand } from '#src/services/shared/tauri-command';

import { incomeTypesContract } from './contract';

export const incomeTypesClient = {
  listIncomeTypes: async () => await callTauriCommand(incomeTypesContract.listIncomeTypes),
  createIncomeType: async (input: InferInput<typeof incomeTypesContract.createIncomeType.input>['input']) =>
    await callTauriCommand(incomeTypesContract.createIncomeType, { input }),
  updateIncomeType: async (id: string, input: InferInput<typeof incomeTypesContract.updateIncomeType.input>['input']) =>
    await callTauriCommand(incomeTypesContract.updateIncomeType, { id, input }),
  archiveIncomeType: async (id: string) => {
    await callTauriCommand(incomeTypesContract.archiveIncomeType, { id });
  },
};
