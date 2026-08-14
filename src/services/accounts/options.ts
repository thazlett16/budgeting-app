import { mutationOptions, queryOptions } from '@tanstack/react-query';

import type { InferInput } from 'valibot';

import { accountsClient } from './client';
import { AccountSchema, AccountInputSchema } from './schema';

export const accountsOptions = {
  serviceEntity: () => ['accounts'] as const,

  listAccounts: () => [...accountsOptions.serviceEntity(), 'list'] as const,
  listAccountsQueryOptions: () =>
    queryOptions({
      queryKey: accountsOptions.listAccounts(),
      queryFn: async () => await accountsClient.listAccounts(),
    }),

  createAccountMutationOptions: mutationOptions({
    mutationFn: async (input: InferInput<typeof AccountInputSchema>) => await accountsClient.createAccount(input),
    onSuccess: async (_data, _variables, _onMutateResult, { client }) => {
      await client.invalidateQueries();
    },
  }),

  updateAccountMutationOptions: mutationOptions({
    mutationFn: async ({ id, ...input }: InferInput<typeof AccountSchema>) =>
      await accountsClient.updateAccount(id, input),
    onSuccess: async (_data, _variables, _onMutateResult, { client }) => {
      await client.invalidateQueries();
    },
  }),

  archiveAccountMutationOptions: mutationOptions({
    mutationFn: async ({ id }: { id: string }) => {
      await accountsClient.archiveAccount(id);
    },
    onSuccess: async (_data, _variables, _onMutateResult, { client }) => {
      await client.invalidateQueries();
    },
  }),

  unarchiveAccountMutationOptions: mutationOptions({
    mutationFn: async ({ id }: { id: string }) => {
      await accountsClient.unarchiveAccount(id);
    },
    onSuccess: async (_data, _variables, _onMutateResult, { client }) => {
      await client.invalidateQueries();
    },
  }),
};
