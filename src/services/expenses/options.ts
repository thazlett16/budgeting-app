import { mutationOptions, queryOptions } from '@tanstack/react-query';

import type { ExpenseEntryInput } from './schema';
import { expensesClient } from './client';

export const expensesOptions = {
  serviceEntity: () => ['expenses'] as const,

  listExpenses: () => [...expensesOptions.serviceEntity(), 'list'] as const,
  listExpensesQueryOptions: () =>
    queryOptions({
      queryKey: expensesOptions.listExpenses(),
      queryFn: async () => await expensesClient.listExpenses(),
    }),

  createExpenseMutationOptions: mutationOptions({
    mutationFn: async (input: ExpenseEntryInput) => await expensesClient.createExpense(input),
    onSuccess: async (_data, _variables, _onMutateResult, { client }) => {
      await client.invalidateQueries({ queryKey: expensesOptions.serviceEntity() });
    },
  }),

  updateExpenseMutationOptions: mutationOptions({
    mutationFn: async ({ id, input }: { id: string; input: ExpenseEntryInput }) =>
      await expensesClient.updateExpense(id, input),
    onSuccess: async (_data, _variables, _onMutateResult, { client }) => {
      await client.invalidateQueries({ queryKey: expensesOptions.serviceEntity() });
    },
  }),

  deleteExpenseMutationOptions: mutationOptions({
    mutationFn: async ({ id }: { id: string }) => {
      await expensesClient.deleteExpense(id);
    },
    onSuccess: async (_data, _variables, _onMutateResult, { client }) => {
      await client.invalidateQueries({ queryKey: expensesOptions.serviceEntity() });
    },
  }),
};
