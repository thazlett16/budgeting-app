import { mutationOptions, queryOptions } from '@tanstack/react-query';

import type { InferInput } from 'valibot';

import type { InvestmentEntryInputSchema, InvestmentEntrySchema } from './schema';
import { investmentsClient } from './client';

export const investmentsOptions = {
  serviceEntity: () => ['investments'] as const,

  listInvestmentEntries: () => [...investmentsOptions.serviceEntity(), 'list'] as const,
  listInvestmentEntriesQueryOptions: () =>
    queryOptions({
      queryKey: investmentsOptions.listInvestmentEntries(),
      queryFn: async () => await investmentsClient.listInvestmentEntries(),
    }),

  createInvestmentEntryMutationOptions: mutationOptions({
    mutationFn: async (input: InferInput<typeof InvestmentEntryInputSchema>) =>
      await investmentsClient.createInvestmentEntry(input),
    onSuccess: async (_data, _variables, _onMutateResult, { client }) => {
      await client.invalidateQueries();
    },
  }),

  updateInvestmentEntryMutationOptions: mutationOptions({
    mutationFn: async ({ id, ...input }: InferInput<typeof InvestmentEntrySchema>) =>
      await investmentsClient.updateInvestmentEntry(id, input),
    onSuccess: async (_data, _variables, _onMutateResult, { client }) => {
      await client.invalidateQueries();
    },
  }),

  deleteInvestmentEntryMutationOptions: mutationOptions({
    mutationFn: async ({ id }: { id: string }) => {
      await investmentsClient.deleteInvestmentEntry(id);
    },
    onSuccess: async (_data, _variables, _onMutateResult, { client }) => {
      await client.invalidateQueries();
    },
  }),
};
