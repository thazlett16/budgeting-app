import { mutationOptions, queryOptions } from '@tanstack/react-query';

import type { InferInput } from 'valibot';

import type { LookupItemInputSchema, LookupItemSchema } from '#src/services/lookups/schema';

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
    mutationFn: async (input: InferInput<typeof LookupItemInputSchema>) =>
      await expenseCategoriesClient.createExpenseCategory(input),
    onSuccess: async (_data, _variables, _onMutateResult, { client }) => {
      await client.invalidateQueries();
    },
  }),

  updateExpenseCategoryMutationOptions: mutationOptions({
    mutationFn: async ({ id, ...input }: InferInput<typeof LookupItemSchema>) =>
      await expenseCategoriesClient.updateExpenseCategory(id, input),
    onSuccess: async (_data, _variables, _onMutateResult, { client }) => {
      await client.invalidateQueries();
    },
  }),

  archiveExpenseCategoryMutationOptions: mutationOptions({
    mutationFn: async ({ id }: { id: string }) => {
      await expenseCategoriesClient.archiveExpenseCategory(id);
    },
    onSuccess: async (_data, _variables, _onMutateResult, { client }) => {
      await client.invalidateQueries();
    },
  }),

  unarchiveExpenseCategoryMutationOptions: mutationOptions({
    mutationFn: async ({ id }: { id: string }) => {
      await expenseCategoriesClient.unarchiveExpenseCategory(id);
    },
    onSuccess: async (_data, _variables, _onMutateResult, { client }) => {
      await client.invalidateQueries();
    },
  }),
};
