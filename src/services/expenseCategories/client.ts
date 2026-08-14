import type { InferInput } from 'valibot';

import { callTauriCommand } from '#src/services/shared/tauri-command';

import { expenseCategoriesContract } from './contract';

export const expenseCategoriesClient = {
  listExpenseCategories: async () => await callTauriCommand(expenseCategoriesContract.listExpenseCategories),
  createExpenseCategory: async (
    input: InferInput<typeof expenseCategoriesContract.createExpenseCategory.input>['input'],
  ) => await callTauriCommand(expenseCategoriesContract.createExpenseCategory, { input }),
  updateExpenseCategory: async (
    id: string,
    input: InferInput<typeof expenseCategoriesContract.updateExpenseCategory.input>['input'],
  ) => await callTauriCommand(expenseCategoriesContract.updateExpenseCategory, { id, input }),
  archiveExpenseCategory: async (id: string) => {
    await callTauriCommand(expenseCategoriesContract.archiveExpenseCategory, { id });
  },
  unarchiveExpenseCategory: async (id: string) => {
    await callTauriCommand(expenseCategoriesContract.unarchiveExpenseCategory, { id });
  },
};
