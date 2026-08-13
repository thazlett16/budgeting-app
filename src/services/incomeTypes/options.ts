import { mutationOptions, queryOptions } from '@tanstack/react-query';

import type { LookupItemInput } from '../lookups/schema';
import { incomeTypesClient } from './client';

export const incomeTypesOptions = {
  serviceEntity: () => ['incomeTypes'] as const,

  listIncomeTypes: () => [...incomeTypesOptions.serviceEntity(), 'list'] as const,
  listIncomeTypesQueryOptions: () =>
    queryOptions({
      queryKey: incomeTypesOptions.listIncomeTypes(),
      queryFn: async () => await incomeTypesClient.listIncomeTypes(),
    }),

  createIncomeTypeMutationOptions: mutationOptions({
    mutationFn: async (input: LookupItemInput) => await incomeTypesClient.createIncomeType(input),
    onSuccess: async (_data, _variables, _onMutateResult, { client }) => {
      await client.invalidateQueries({ queryKey: incomeTypesOptions.serviceEntity() });
    },
  }),

  updateIncomeTypeMutationOptions: mutationOptions({
    mutationFn: async ({ id, input }: { id: string; input: LookupItemInput }) =>
      await incomeTypesClient.updateIncomeType(id, input),
    onSuccess: async (_data, _variables, _onMutateResult, { client }) => {
      await client.invalidateQueries({ queryKey: incomeTypesOptions.serviceEntity() });
    },
  }),

  archiveIncomeTypeMutationOptions: mutationOptions({
    mutationFn: async ({ id }: { id: string }) => {
      await incomeTypesClient.archiveIncomeType(id);
    },
    onSuccess: async (_data, _variables, _onMutateResult, { client }) => {
      await client.invalidateQueries({ queryKey: incomeTypesOptions.serviceEntity() });
    },
  }),
};
