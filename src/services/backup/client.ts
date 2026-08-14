import { callTauriCommand } from '#src/services/shared/tauri-command';

import { backupContract } from './contract';

export const backupClient = {
  exportBackup: async () => await callTauriCommand(backupContract.exportBackup),
  importBackup: async () => await callTauriCommand(backupContract.importBackup),
};
