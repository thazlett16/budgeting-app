import { mutationOptions, queryOptions } from '@tanstack/react-query';

import type { AccountInput } from './schema';
import { accountsClient } from './client';

export const accountsOptions = {
  serviceEntity: () => ['accounts'] as const,

  listAccounts: () => [...accountsOptions.serviceEntity(), 'list'] as const,
  listAccountsQueryOptions: () =>
    queryOptions({
      queryKey: accountsOptions.listAccounts(),
      queryFn: () => accountsClient.listAccounts(),
    }),

  createAccountMutationOptions: mutationOptions({
    mutationFn: (input: AccountInput) => accountsClient.createAccount(input),
    onSuccess: async (_data, _variables, _onMutateResult, { client }) => {
      await client.invalidateQueries({ queryKey: accountsOptions.serviceEntity() });
    },
  }),

  updateAccountMutationOptions: mutationOptions({
    mutationFn: ({ id, input }: { id: string; input: AccountInput }) =>
      accountsClient.updateAccount(id, input),
    onSuccess: async (_data, _variables, _onMutateResult, { client }) => {
      await client.invalidateQueries({ queryKey: accountsOptions.serviceEntity() });
    },
  }),

  archiveAccountMutationOptions: mutationOptions({
    mutationFn: ({ id }: { id: string }) => accountsClient.archiveAccount(id),
    onSuccess: async (_data, _variables, _onMutateResult, { client }) => {
      await client.invalidateQueries({ queryKey: accountsOptions.serviceEntity() });
    },
  }),
};
