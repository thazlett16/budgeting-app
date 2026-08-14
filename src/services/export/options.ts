import { mutationOptions } from '@tanstack/react-query';

import type { InferInput } from 'valibot';

import { exportClient } from './client';
import { exportContract } from './contract';

type ExportRange = InferInput<typeof exportContract.exportInvestmentsCsv.input>['range'];
type XlsxExportRange = InferInput<typeof exportContract.exportXlsx.input>['range'];

export const exportOptions = {
  exportInvestmentsCsvMutationOptions: mutationOptions({
    mutationFn: async (range: ExportRange) => await exportClient.exportInvestmentsCsv(range),
  }),

  exportExpensesCsvMutationOptions: mutationOptions({
    mutationFn: async (range: ExportRange) => await exportClient.exportExpensesCsv(range),
  }),

  exportIncomeCsvMutationOptions: mutationOptions({
    mutationFn: async (range: ExportRange) => await exportClient.exportIncomeCsv(range),
  }),

  exportXlsxMutationOptions: mutationOptions({
    mutationFn: async (range: XlsxExportRange) => await exportClient.exportXlsx(range),
  }),
};
