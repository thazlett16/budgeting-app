import { formOptions } from '@tanstack/react-form';

import * as f from '@thaz/form-util';

import * as v from 'valibot';

export const investmentEntryFormSchema = v.object({
  date: f.string(
    { wrongTypeMessage: 'Date must be text', requiredMessage: 'Date is required' },
    v.isoDate('Enter a valid date'),
  ),
  account_id: f.string(
    { wrongTypeMessage: 'Account ID must be text', requiredMessage: 'Account ID is required' },
    v.uuid('Select an account'),
  ),
  balance: f.number({ wrongTypeMessage: 'Balance must be a number', requiredMessage: 'Balance is required' }),
  contribution: f.number({
    wrongTypeMessage: 'Contribution must be a number',
    requiredMessage: 'Contribution is required',
  }),
});

export const investmentEntryFormOptions = formOptions.strictSchema({
  defaultValues: {
    date: null,
    account_id: null,
    balance: null,
    contribution: null,
  },
  validators: [
    {
      run: investmentEntryFormSchema,
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
