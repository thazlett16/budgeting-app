import { useState } from 'react';

import { useForm } from '@tanstack/react-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import { Button } from '#src/components/ui/button';
import * as m from '#src/paraglide/messages';
import { incomeTypesOptions } from '#src/services/incomeTypes/options';

import { lookupItemFormOptions } from './-lookup-items/lookup-item-form-options';
import { ArchiveToggleButton } from './-shared/archive-toggle-button';

export const Route = createFileRoute('/settings/income-types')({
  component: SettingsIncomeTypesPage,
});

function SettingsIncomeTypesPage() {
  const incomeTypesQuery = useQuery(incomeTypesOptions.listIncomeTypesQueryOptions());
  const createIncomeType = useMutation(incomeTypesOptions.createIncomeTypeMutationOptions);
  const archiveIncomeType = useMutation(incomeTypesOptions.archiveIncomeTypeMutationOptions);
  const unarchiveIncomeType = useMutation(incomeTypesOptions.unarchiveIncomeTypeMutationOptions);
  const [showArchived, setShowArchived] = useState(false);

  const form = useForm({
    ...lookupItemFormOptions,
    onSubmit: async ({ schemaOutputs, formApi }) => {
      const [parsed] = schemaOutputs;

      await createIncomeType.mutateAsync({
        name: parsed.name,
        archived: false,
        sort_order: incomeTypesQuery.data?.length ?? 0,
      });
      formApi.reset();
    },
  });

  const incomeTypes = incomeTypesQuery.data ?? [];
  let visibleIncomeTypes = incomeTypes;

  if (!showArchived) {
    visibleIncomeTypes = incomeTypes.filter((incomeType) => !incomeType.archived);
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 p-6">
      <div>
        <h1 className="text-lg font-semibold">{m.settings_income_types_title()}</h1>
        <p className="text-muted-foreground text-sm">{m.settings_income_types_description()}</p>
      </div>

      <form
        className="flex items-start gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        <form.Field name="name">
          {(field) => (
            <label className="flex flex-1 flex-col gap-1">
              <span className="text-sm font-medium">{m.settings_income_types_name_label()}</span>
              <input
                className="border-border rounded-md border px-3 py-2 text-sm"
                value={field.value ?? ''}
                onBlur={field.handleBlur}
                onChange={(event) => {
                  field.handleChange(event.target.value);
                }}
                placeholder={m.settings_income_types_name_placeholder()}
              />
              {field.errors.length > 0 && (
                <span className="text-danger text-xs">{field.errors.map((error) => error.message).join(', ')}</span>
              )}
            </label>
          )}
        </form.Field>

        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button
              type="submit"
              isDisabled={isSubmitting}
            >
              {m.settings_income_types_submit()}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(event) => {
              setShowArchived(event.target.checked);
            }}
          />
          {m.settings_income_types_show_archived()}
        </label>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-border border-b text-left">
              <th className="py-2 font-medium">{m.settings_income_types_table_name()}</th>
              <th className="py-2 font-medium">
                <span className="sr-only">{m.settings_income_types_table_actions()}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleIncomeTypes.map((incomeType) => (
              <tr
                key={incomeType.id}
                className="border-border border-b last:border-0"
              >
                <td className="py-2">{incomeType.name}</td>
                <td className="py-2 text-right">
                  <ArchiveToggleButton
                    archived={incomeType.archived}
                    archiveLabel={m.settings_income_types_archive()}
                    unarchiveLabel={m.settings_income_types_unarchive()}
                    onArchive={() => {
                      archiveIncomeType.mutate({ id: incomeType.id });
                    }}
                    onUnarchive={() => {
                      unarchiveIncomeType.mutate({ id: incomeType.id });
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
