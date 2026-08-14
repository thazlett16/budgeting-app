import type { InferInput } from 'valibot';

import { callTauriCommand } from '#src/services/shared/tauri-command';

import { exportContract } from './contract';

type ExportRange = InferInput<typeof exportContract.exportInvestmentsCsv.input>['range'];
type XlsxExportRange = InferInput<typeof exportContract.exportXlsx.input>['range'];

export const exportClient = {
  exportInvestmentsCsv: async (range: ExportRange) =>
    await callTauriCommand(exportContract.exportInvestmentsCsv, { range }),
  exportExpensesCsv: async (range: ExportRange) => await callTauriCommand(exportContract.exportExpensesCsv, { range }),
  exportIncomeCsv: async (range: ExportRange) => await callTauriCommand(exportContract.exportIncomeCsv, { range }),
  exportXlsx: async (range: XlsxExportRange) => await callTauriCommand(exportContract.exportXlsx, { range }),
  exportPdfSummary: async (range: XlsxExportRange) =>
    await callTauriCommand(exportContract.exportPdfSummary, { range }),
};
