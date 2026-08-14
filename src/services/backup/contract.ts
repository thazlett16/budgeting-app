import * as v from 'valibot';

import { RestoreSummarySchema } from './schema';

/**
 * Both commands open a native file dialog on the Rust side (save for
 * export, open for import) — the output is `null` when the user cancels
 * the dialog, not an error.
 */
export const backupContract = {
  exportBackup: {
    command: 'export_backup',
    input: v.undefined(),
    output: v.nullable(v.string()),
  },
  importBackup: {
    command: 'import_backup',
    input: v.undefined(),
    output: v.nullable(RestoreSummarySchema),
  },
} as const;
