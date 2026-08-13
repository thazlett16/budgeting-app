import { mutationOptions, queryOptions } from '@tanstack/react-query';

import type { AccountInput } from './schema';
import { accountsClient } from './client';

export const accountsOptions = {
  serviceEntity: () => ['accounts'] as const,

  listAccounts: () => [...accountsOptions.serviceEntity(), 'list'] as const,
  listAccountsQueryOptions: () =>
    queryOptions({
      queryKey: accountsOptions.listAccounts(),
      queryFn: async () => await accountsClient.listAccounts(),
    }),

  createAccountMutationOptions: mutationOptions({
    mutationFn: async (input: AccountInput) => await accountsClient.createAccount(input),
    onSuccess: async (_data, _variables, _onMutateResult, { client }) => {
      await client.invalidateQueries({ queryKey: accountsOptions.serviceEntity() });
    },
  }),

  updateAccountMutationOptions: mutationOptions({
    mutationFn: async ({ id, input }: { id: string; input: AccountInput }) =>
      await accountsClient.updateAccount(id, input),
    onSuccess: async (_data, _variables, _onMutateResult, { client }) => {
      await client.invalidateQueries({ queryKey: accountsOptions.serviceEntity() });
    },
  }),

  archiveAccountMutationOptions: mutationOptions({
    mutationFn: async ({ id }: { id: string }) => {
      await accountsClient.archiveAccount(id);
    },
    onSuccess: async (_data, _variables, _onMutateResult, { client }) => {
      await client.invalidateQueries({ queryKey: accountsOptions.serviceEntity() });
    },
  }),
};
