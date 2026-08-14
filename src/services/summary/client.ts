import type { InferInput } from 'valibot';

import { callTauriCommand } from '#src/services/shared/tauri-command';

import { summaryContract } from './contract';

type DateRange = InferInput<typeof summaryContract.getInvestmentGains.input>['range'];

export const summaryClient = {
  getInvestmentGains: async (range: DateRange) => await callTauriCommand(summaryContract.getInvestmentGains, { range }),
  getNetWorthByMonth: async (range: DateRange) => await callTauriCommand(summaryContract.getNetWorthByMonth, { range }),
  getSpendingByCategory: async (range: DateRange) =>
    await callTauriCommand(summaryContract.getSpendingByCategory, { range }),
  getIncomeByType: async (range: DateRange) => await callTauriCommand(summaryContract.getIncomeByType, { range }),
  getDashboardInsights: async (range: DateRange) =>
    await callTauriCommand(summaryContract.getDashboardInsights, { range }),
};
