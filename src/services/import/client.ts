import { callTauriCommand } from '#src/services/shared/tauri-command';

import { importContract } from './contract';

export const importClient = {
  downloadExpenseCategoriesPreset: async () => await callTauriCommand(importContract.downloadExpenseCategoriesPreset),
  downloadIncomeTypesPreset: async () => await callTauriCommand(importContract.downloadIncomeTypesPreset),
  uploadExpenseCategories: async () => await callTauriCommand(importContract.uploadExpenseCategories),
  uploadIncomeTypes: async () => await callTauriCommand(importContract.uploadIncomeTypes),
};
