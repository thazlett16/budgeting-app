import * as v from 'valibot';

import { DateRangeSchema } from '#src/services/summary/schema';

/**
 * Each export command opens a native save-file dialog on the Rust side and
 * writes the CSV there directly — the output is the chosen path, or `null`
 * if the user cancelled the dialog (not an error).
 */
export const exportContract = {
  exportInvestmentsCsv: {
    command: 'export_investments_csv',
    input: v.object({ range: v.nullable(DateRangeSchema) }),
    output: v.nullable(v.string()),
  },
  exportExpensesCsv: {
    command: 'export_expenses_csv',
    input: v.object({ range: v.nullable(DateRangeSchema) }),
    output: v.nullable(v.string()),
  },
  exportIncomeCsv: {
    command: 'export_income_csv',
    input: v.object({ range: v.nullable(DateRangeSchema) }),
    output: v.nullable(v.string()),
  },
  exportXlsx: {
    command: 'export_xlsx',
    input: v.object({ range: DateRangeSchema }),
    output: v.nullable(v.string()),
  },
  exportPdfSummary: {
    command: 'export_pdf_summary',
    input: v.object({ range: DateRangeSchema }),
    output: v.nullable(v.string()),
  },
} as const;
