import { useState } from 'react';

import { useMutation } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import type { InferOutput } from 'valibot';

import { trailingTwelveMonthsRange } from '#src/common/trailing-twelve-months-range';
import { Button } from '#src/components/ui/button';
import * as m from '#src/paraglide/messages';
import { backupOptions } from '#src/services/backup/options';
import { RestoreSummarySchema } from '#src/services/backup/schema';
import { exportOptions } from '#src/services/export/options';

export const Route = createFileRoute('/settings/import-export')({
  component: SettingsImportExportPage,
});

function exportStatusMessage(path: string | null) {
  if (path === null) {
    return m.settings_import_export_export_cancelled();
  }

  return m.settings_import_export_export_saved({ path });
}

function restoreStatusMessage(summary: InferOutput<typeof RestoreSummarySchema> | null) {
  if (summary === null) {
    return m.settings_import_export_export_cancelled();
  }

  const total =
    summary.accounts +
    summary.expense_categories +
    summary.income_types +
    summary.investments +
    summary.expenses +
    summary.income;

  return m.settings_import_export_restore_success({ count: total });
}

function SettingsImportExportPage() {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const exportInvestments = useMutation({
    ...exportOptions.exportInvestmentsCsvMutationOptions,
    onSuccess: (path) => {
      setStatusMessage(exportStatusMessage(path));
    },
  });

  const exportExpenses = useMutation({
    ...exportOptions.exportExpensesCsvMutationOptions,
    onSuccess: (path) => {
      setStatusMessage(exportStatusMessage(path));
    },
  });

  const exportIncome = useMutation({
    ...exportOptions.exportIncomeCsvMutationOptions,
    onSuccess: (path) => {
      setStatusMessage(exportStatusMessage(path));
    },
  });

  const exportXlsx = useMutation({
    ...exportOptions.exportXlsxMutationOptions,
    onSuccess: (path) => {
      setStatusMessage(exportStatusMessage(path));
    },
  });

  const exportBackup = useMutation({
    ...backupOptions.exportBackupMutationOptions,
    onSuccess: (path) => {
      setStatusMessage(exportStatusMessage(path));
    },
  });

  const importBackup = useMutation({
    ...backupOptions.importBackupMutationOptions,
    onSuccess: (summary) => {
      setStatusMessage(restoreStatusMessage(summary));
    },
  });

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 p-6">
      <div>
        <h1 className="text-lg font-semibold">{m.settings_import_export_title()}</h1>
        <p className="text-muted-foreground text-sm">{m.settings_import_export_description()}</p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">{m.settings_import_export_export_section_title()}</h2>

        <div className="flex flex-wrap gap-3">
          <Button
            isDisabled={exportInvestments.isPending}
            onPress={() => {
              exportInvestments.mutate(null);
            }}
          >
            {m.settings_import_export_export_investments()}
          </Button>

          <Button
            isDisabled={exportExpenses.isPending}
            onPress={() => {
              exportExpenses.mutate(null);
            }}
          >
            {m.settings_import_export_export_expenses()}
          </Button>

          <Button
            isDisabled={exportIncome.isPending}
            onPress={() => {
              exportIncome.mutate(null);
            }}
          >
            {m.settings_import_export_export_income()}
          </Button>

          <Button
            isDisabled={exportXlsx.isPending}
            onPress={() => {
              exportXlsx.mutate(trailingTwelveMonthsRange());
            }}
          >
            {m.settings_import_export_export_xlsx()}
          </Button>
        </div>

        {statusMessage !== null && <p className="text-muted-foreground text-sm">{statusMessage}</p>}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">{m.settings_import_export_backup_section_title()}</h2>
        <p className="text-muted-foreground text-sm">{m.settings_import_export_backup_description()}</p>

        <div className="flex flex-wrap gap-3">
          <Button
            isDisabled={exportBackup.isPending}
            onPress={() => {
              exportBackup.mutate();
            }}
          >
            {m.settings_import_export_backup_export()}
          </Button>

          <Button
            variant="danger"
            isDisabled={importBackup.isPending}
            onPress={() => {
              if (!window.confirm(m.settings_import_export_backup_restore_confirm())) {
                return;
              }

              importBackup.mutate();
            }}
          >
            {m.settings_import_export_backup_restore()}
          </Button>
        </div>
      </div>
    </div>
  );
}
