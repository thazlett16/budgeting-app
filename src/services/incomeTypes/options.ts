import { mutationOptions, queryOptions } from '@tanstack/react-query';

import type { InferInput } from 'valibot';

import { LookupItemInputSchema, LookupItemSchema } from '#src/services/lookups/schema';

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
    mutationFn: async (input: InferInput<typeof LookupItemInputSchema>) =>
      await incomeTypesClient.createIncomeType(input),
    onSuccess: async (_data, _variables, _onMutateResult, { client }) => {
      await client.invalidateQueries({ queryKey: incomeTypesOptions.serviceEntity() });
    },
  }),

  updateIncomeTypeMutationOptions: mutationOptions({
    mutationFn: async ({ id, ...input }: InferInput<typeof LookupItemSchema>) =>
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
