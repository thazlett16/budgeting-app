import { formOptions } from '@tanstack/react-form';

import * as f from '@thaz/form-util';

import * as v from 'valibot';

/**
 * Shared by the Categories and Income Types settings pages — both are a
 * bare `{ name }` form over `LookupItem`. Deliberately built with
 * `@thaz/form-util` rather than importing `LookupItemSchema` from
 * `src/services/lookups/schema.ts`: form schemas answer "is this raw input
 * valid to submit," the service schema answers "is this a valid Tauri IPC
 * payload" — same shape today, different concerns, must be free to diverge.
 */
export const lookupItemFormSchema = v.object({
  name: f.string(
    { wrongTypeMessage: 'Name must be text', requiredMessage: 'Name is required' },
    v.minLength(1),
    v.maxLength(60),
  ),
});

export const lookupItemFormOptions = formOptions.strictSchema({
  defaultValues: {
    name: null,
  },
  validators: [
    {
      run: lookupItemFormSchema,
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
