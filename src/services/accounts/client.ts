import { invoke } from '@tauri-apps/api/core';

import type { InferInput, InferOutput, GenericSchema } from 'valibot';
import * as v from 'valibot';

import { accountsContract } from './contract';

async function callCommand<Input extends GenericSchema, Output extends GenericSchema>(
  entry: { command: string; input: Input; output: Output },
  args?: InferInput<Input>,
): Promise<InferOutput<Output>> {
  const result = await invoke(entry.command, args as Record<string, unknown> | undefined);

  return v.parse(entry.output, result);
}

export const accountsClient = {
  listAccounts: () => callCommand(accountsContract.listAccounts),
  createAccount: (input: InferInput<typeof accountsContract.createAccount.input>['input']) =>
    callCommand(accountsContract.createAccount, { input }),
  updateAccount: (
    id: string,
    input: InferInput<typeof accountsContract.updateAccount.input>['input'],
  ) => callCommand(accountsContract.updateAccount, { id, input }),
  archiveAccount: (id: string) => callCommand(accountsContract.archiveAccount, { id }),
};
