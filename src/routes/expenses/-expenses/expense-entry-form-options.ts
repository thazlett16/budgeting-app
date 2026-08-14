import { formOptions } from '@tanstack/react-form';

import * as f from '@thaz/form-util';

import * as v from 'valibot';

export const expenseEntryFormSchema = v.object({
  date: f.string(
    { wrongTypeMessage: 'Date must be text', requiredMessage: 'Date is required' },
    v.isoDate('Enter a valid date'),
  ),
  description: f.string(
    { wrongTypeMessage: 'Description must be text', requiredMessage: 'Description is required' },
    v.minLength(1),
    v.maxLength(200),
  ),
  amount: f.number(
    { wrongTypeMessage: 'Amount must be a number', requiredMessage: 'Amount is required' },
    v.minValue(0),
  ),
  category_id: f.string(
    { wrongTypeMessage: 'Category must be text', requiredMessage: 'Select a category' },
    v.uuid('Select a category'),
  ),
});

export const expenseEntryFormOptions = formOptions.strictSchema({
  defaultValues: {
    date: null,
    description: null,
    amount: null,
    category_id: null,
  },
  validators: [
    {
      run: expenseEntryFormSchema,
      triggers: [
        'blur',
        {
          trigger: 'change',
          when: ({ formApi }) => formApi.state.submissionAttempts > 0,
        },
      ],
    },
  ],
});
