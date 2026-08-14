import { formOptions } from '@tanstack/react-form';

import * as f from '@thaz/form-util';

import * as v from 'valibot';

import { accountCategory } from '#src/common/account-categories';
import { nullableInput } from '#src/common/nullable-input';

export const accountFormSchema = v.object({
  name: f.string(
    { wrongTypeMessage: 'Name must be text', requiredMessage: 'Name is required' },
    v.minLength(1),
    v.maxLength(60),
  ),
  category: nullableInput(accountCategory('Invalid Category Type')),
});

export const accountFormOptions = formOptions.strictSchema({
  defaultValues: {
    name: null,
    category: null,
  },
  validators: [
    {
      run: accountFormSchema,
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
