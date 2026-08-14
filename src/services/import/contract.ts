import * as v from 'valibot';

/**
 * Download commands open a native save dialog, upload commands open a
 * native pick dialog — the output is `null` when the user cancels, not an
 * error. Upload replaces the entire lookup list and returns the row count
 * written, or rejects the whole file (no partial writes) if any row fails
 * validation.
 */
export const importContract = {
  downloadExpenseCategoriesPreset: {
    command: 'download_expense_categories_preset',
    input: v.undefined(),
    output: v.nullable(v.string()),
  },
  downloadIncomeTypesPreset: {
    command: 'download_income_types_preset',
    input: v.undefined(),
    output: v.nullable(v.string()),
  },
  uploadExpenseCategories: {
    command: 'upload_expense_categories',
    input: v.undefined(),
    output: v.nullable(v.number()),
  },
  uploadIncomeTypes: {
    command: 'upload_income_types',
    input: v.undefined(),
    output: v.nullable(v.number()),
  },
} as const;
