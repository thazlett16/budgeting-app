import { mutationOptions } from '@tanstack/react-query';

import { backupClient } from './client';

export const backupOptions = {
  exportBackupMutationOptions: mutationOptions({
    mutationFn: async () => await backupClient.exportBackup(),
    onSuccess: async (_data, _variables, _onMutateResult, { client }) => {
      await client.invalidateQueries();
    },
  }),

  importBackupMutationOptions: mutationOptions({
    mutationFn: async () => await backupClient.importBackup(),
    onSuccess: async (_data, _variables, _onMutateResult, { client }) => {
      await client.invalidateQueries();
    },
  }),
};
