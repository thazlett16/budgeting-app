import { mutationOptions, queryOptions } from '@tanstack/react-query';

import type { IncomeEntryInput } from './schema';
import { incomeClient } from './client';

export const incomeOptions = {
  serviceEntity: () => ['income'] as const,

  listIncome: () => [...incomeOptions.serviceEntity(), 'list'] as const,
  listIncomeQueryOptions: () =>
    queryOptions({
      queryKey: incomeOptions.listIncome(),
      queryFn: async () => await incomeClient.listIncome(),
    }),

  createIncomeMutationOptions: mutationOptions({
    mutationFn: async (input: IncomeEntryInput) => await incomeClient.createIncome(input),
    onSuccess: async (_data, _variables, _onMutateResult, { client }) => {
      await client.invalidateQueries({ queryKey: incomeOptions.serviceEntity() });
    },
  }),

  updateIncomeMutationOptions: mutationOptions({
    mutationFn: async ({ id, input }: { id: string; input: IncomeEntryInput }) =>
      await incomeClient.updateIncome(id, input),
    onSuccess: async (_data, _variables, _onMutateResult, { client }) => {
      await client.invalidateQueries({ queryKey: incomeOptions.serviceEntity() });
    },
  }),

  deleteIncomeMutationOptions: mutationOptions({
    mutationFn: async ({ id }: { id: string }) => {
      await incomeClient.deleteIncome(id);
    },
    onSuccess: async (_data, _variables, _onMutateResult, { client }) => {
      await client.invalidateQueries({ queryKey: incomeOptions.serviceEntity() });
    },
  }),
};
