import { mutationOptions, queryOptions } from '@tanstack/react-query';

import type { InvestmentEntryInput } from './schema';
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
    mutationFn: async (input: InvestmentEntryInput) => await investmentsClient.createInvestmentEntry(input),
    onSuccess: async (_data, _variables, _onMutateResult, { client }) => {
      await client.invalidateQueries({ queryKey: investmentsOptions.serviceEntity() });
    },
  }),

  updateInvestmentEntryMutationOptions: mutationOptions({
    mutationFn: async ({ id, input }: { id: string; input: InvestmentEntryInput }) =>
      await investmentsClient.updateInvestmentEntry(id, input),
    onSuccess: async (_data, _variables, _onMutateResult, { client }) => {
      await client.invalidateQueries({ queryKey: investmentsOptions.serviceEntity() });
    },
  }),

  deleteInvestmentEntryMutationOptions: mutationOptions({
    mutationFn: async ({ id }: { id: string }) => {
      await investmentsClient.deleteInvestmentEntry(id);
    },
    onSuccess: async (_data, _variables, _onMutateResult, { client }) => {
      await client.invalidateQueries({ queryKey: investmentsOptions.serviceEntity() });
    },
  }),
};
