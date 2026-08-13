import { mutationOptions, queryOptions } from '@tanstack/react-query';

import type { LookupItemInput } from '#src/services/lookups/schema';

import { expenseCategoriesClient } from './client';

export const expenseCategoriesOptions = {
  serviceEntity: () => ['expenseCategories'] as const,

  listExpenseCategories: () => [...expenseCategoriesOptions.serviceEntity(), 'list'] as const,
  listExpenseCategoriesQueryOptions: () =>
    queryOptions({
      queryKey: expenseCategoriesOptions.listExpenseCategories(),
      queryFn: async () => await expenseCategoriesClient.listExpenseCategories(),
    }),

  createExpenseCategoryMutationOptions: mutationOptions({
    mutationFn: async (input: LookupItemInput) => await expenseCategoriesClient.createExpenseCategory(input),
    onSuccess: async (_data, _variables, _onMutateResult, { client }) => {
      await client.invalidateQueries({ queryKey: expenseCategoriesOptions.serviceEntity() });
    },
  }),

  updateExpenseCategoryMutationOptions: mutationOptions({
    mutationFn: async ({ id, input }: { id: string; input: LookupItemInput }) =>
      await expenseCategoriesClient.updateExpenseCategory(id, input),
    onSuccess: async (_data, _variables, _onMutateResult, { client }) => {
      await client.invalidateQueries({ queryKey: expenseCategoriesOptions.serviceEntity() });
    },
  }),

  archiveExpenseCategoryMutationOptions: mutationOptions({
    mutationFn: async ({ id }: { id: string }) => {
      await expenseCategoriesClient.archiveExpenseCategory(id);
    },
    onSuccess: async (_data, _variables, _onMutateResult, { client }) => {
      await client.invalidateQueries({ queryKey: expenseCategoriesOptions.serviceEntity() });
    },
  }),
};
