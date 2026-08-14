import { mutationOptions, queryOptions } from '@tanstack/react-query';

import type { InferInput } from 'valibot';

import { incomeClient } from './client';
import { IncomeEntrySchema, IncomeEntryInputSchema } from './schema';

export const incomeOptions = {
  serviceEntity: () => ['income'] as const,

  listIncome: () => [...incomeOptions.serviceEntity(), 'list'] as const,
  listIncomeQueryOptions: () =>
    queryOptions({
      queryKey: incomeOptions.listIncome(),
      queryFn: async () => await incomeClient.listIncome(),
    }),

  createIncomeMutationOptions: mutationOptions({
    mutationFn: async (input: InferInput<typeof IncomeEntryInputSchema>) => await incomeClient.createIncome(input),
    onSuccess: async (_data, _variables, _onMutateResult, { client }) => {
      await client.invalidateQueries({ queryKey: incomeOptions.serviceEntity() });
    },
  }),

  updateIncomeMutationOptions: mutationOptions({
    mutationFn: async ({ id, ...input }: InferInput<typeof IncomeEntrySchema>) =>
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
