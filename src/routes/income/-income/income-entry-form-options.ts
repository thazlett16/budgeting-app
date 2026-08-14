import { formOptions } from '@tanstack/react-form';

import * as f from '@thaz/form-util';

import * as v from 'valibot';

export const incomeEntryFormSchema = v.object({
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
  type_id: f.string(
    { wrongTypeMessage: 'Type must be text', requiredMessage: 'Select an income type' },
    v.uuid('Select an income type'),
  ),
});

export const incomeEntryFormOptions = formOptions.strictSchema({
  defaultValues: {
    date: null,
    description: null,
    amount: null,
    type_id: null,
  },
  validators: [
    {
      run: incomeEntryFormSchema,
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
