import { mutationOptions } from '@tanstack/react-query';

import { importClient } from './client';

export const importOptions = {
  downloadExpenseCategoriesPresetMutationOptions: mutationOptions({
    mutationFn: async () => await importClient.downloadExpenseCategoriesPreset(),
    onSuccess: async (_data, _variables, _onMutateResult, { client }) => {
      await client.invalidateQueries();
    },
  }),

  downloadIncomeTypesPresetMutationOptions: mutationOptions({
    mutationFn: async () => await importClient.downloadIncomeTypesPreset(),
    onSuccess: async (_data, _variables, _onMutateResult, { client }) => {
      await client.invalidateQueries();
    },
  }),

  uploadExpenseCategoriesMutationOptions: mutationOptions({
    mutationFn: async () => await importClient.uploadExpenseCategories(),
    onSuccess: async (_data, _variables, _onMutateResult, { client }) => {
      await client.invalidateQueries();
    },
  }),

  uploadIncomeTypesMutationOptions: mutationOptions({
    mutationFn: async () => await importClient.uploadIncomeTypes(),
    onSuccess: async (_data, _variables, _onMutateResult, { client }) => {
      await client.invalidateQueries();
    },
  }),
};
