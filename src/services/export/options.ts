import { mutationOptions } from '@tanstack/react-query';

import type { InferInput } from 'valibot';

import { exportClient } from './client';
import { exportContract } from './contract';

type ExportRange = InferInput<typeof exportContract.exportInvestmentsCsv.input>['range'];
type XlsxExportRange = InferInput<typeof exportContract.exportXlsx.input>['range'];

export const exportOptions = {
  exportInvestmentsCsvMutationOptions: mutationOptions({
    mutationFn: async (range: ExportRange) => await exportClient.exportInvestmentsCsv(range),
    onSuccess: async (_data, _variables, _onMutateResult, { client }) => {
      await client.invalidateQueries();
    },
  }),

  exportExpensesCsvMutationOptions: mutationOptions({
    mutationFn: async (range: ExportRange) => await exportClient.exportExpensesCsv(range),
    onSuccess: async (_data, _variables, _onMutateResult, { client }) => {
      await client.invalidateQueries();
    },
  }),

  exportIncomeCsvMutationOptions: mutationOptions({
    mutationFn: async (range: ExportRange) => await exportClient.exportIncomeCsv(range),
    onSuccess: async (_data, _variables, _onMutateResult, { client }) => {
      await client.invalidateQueries();
    },
  }),

  exportXlsxMutationOptions: mutationOptions({
    mutationFn: async (range: XlsxExportRange) => await exportClient.exportXlsx(range),
    onSuccess: async (_data, _variables, _onMutateResult, { client }) => {
      await client.invalidateQueries();
    },
  }),

  exportPdfSummaryMutationOptions: mutationOptions({
    mutationFn: async (range: XlsxExportRange) => await exportClient.exportPdfSummary(range),
    onSuccess: async (_data, _variables, _onMutateResult, { client }) => {
      await client.invalidateQueries();
    },
  }),
};
