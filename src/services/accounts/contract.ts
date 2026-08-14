import * as v from 'valibot';

import { AccountInputSchema, AccountListSchema, AccountSchema } from './schema';

/**
 * Typed description of every `commands/accounts.rs` Tauri command this
 * service calls: the IPC command name plus the input/output Valibot
 * schemas. This is the Tauri-IPC equivalent of an HTTP contract (see
 * `@thaz/network-util`'s `@ts-rest/core` contracts) — no HTTP verbs/paths,
 * just a `command` name `invoke()` dispatches on.
 */
export const accountsContract = {
  listAccounts: {
    command: 'list_accounts',
    input: v.undefined(),
    output: AccountListSchema,
  },
  createAccount: {
    command: 'create_account',
    input: v.object({ input: AccountInputSchema }),
    output: AccountSchema,
  },
  updateAccount: {
    command: 'update_account',
    input: v.object({ id: v.pipe(v.string(), v.uuid()), input: AccountInputSchema }),
    output: AccountSchema,
  },
  archiveAccount: {
    command: 'archive_account',
    input: v.object({ id: v.pipe(v.string(), v.uuid()) }),
    output: v.null(),
  },
  unarchiveAccount: {
    command: 'unarchive_account',
    input: v.object({ id: v.pipe(v.string(), v.uuid()) }),
    output: v.null(),
  },
} as const;
