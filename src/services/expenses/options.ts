import { mutationOptions, queryOptions } from '@tanstack/react-query';

import type { InferInput } from 'valibot';

import { expensesClient } from './client';
import { ExpenseEntrySchema, ExpenseEntryInputSchema } from './schema';

export const expensesOptions = {
  serviceEntity: () => ['expenses'] as const,

  listExpenses: () => [...expensesOptions.serviceEntity(), 'list'] as const,
  listExpensesQueryOptions: () =>
    queryOptions({
      queryKey: expensesOptions.listExpenses(),
      queryFn: async () => await expensesClient.listExpenses(),
    }),

  createExpenseMutationOptions: mutationOptions({
    mutationFn: async (input: InferInput<typeof ExpenseEntryInputSchema>) => await expensesClient.createExpense(input),
    onSuccess: async (_data, _variables, _onMutateResult, { client }) => {
      await client.invalidateQueries();
    },
  }),

  updateExpenseMutationOptions: mutationOptions({
    mutationFn: async ({ id, ...input }: InferInput<typeof ExpenseEntrySchema>) =>
      await expensesClient.updateExpense(id, input),
    onSuccess: async (_data, _variables, _onMutateResult, { client }) => {
      await client.invalidateQueries();
    },
  }),

  deleteExpenseMutationOptions: mutationOptions({
    mutationFn: async ({ id }: { id: string }) => {
      await expensesClient.deleteExpense(id);
    },
    onSuccess: async (_data, _variables, _onMutateResult, { client }) => {
      await client.invalidateQueries();
    },
  }),
};
