import { useForm } from '@tanstack/react-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import { Button } from '#src/components/ui/button';
import * as m from '#src/paraglide/messages';
import { incomeOptions } from '#src/services/income/options';
import { incomeTypesOptions } from '#src/services/incomeTypes/options';

import { incomeEntryFormOptions } from './-income/income-entry-form-options';

export const Route = createFileRoute('/income/')({
  component: IncomePage,
});

function IncomePage() {
  const typesQuery = useQuery(incomeTypesOptions.listIncomeTypesQueryOptions());
  const incomeQuery = useQuery(incomeOptions.listIncomeQueryOptions());
  const createIncome = useMutation(incomeOptions.createIncomeMutationOptions);
  const deleteIncome = useMutation(incomeOptions.deleteIncomeMutationOptions);

  const types = (typesQuery.data ?? []).filter((type) => !type.archived);
  const typesById = new Map(types.map((type) => [type.id, type]));

  const form = useForm({
    ...incomeEntryFormOptions,
    onSubmit: async ({ schemaOutputs, formApi }) => {
      const [parsed] = schemaOutputs;

      await createIncome.mutateAsync({
        date: parsed.date,
        description: parsed.description,
        amount: parsed.amount,
        type_id: parsed.type_id,
      });
      formApi.reset();
    },
  });

  const incomeEntries = incomeQuery.data ?? [];
  const rows = incomeEntries.toSorted((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 p-6">
      <div>
        <h1 className="text-lg font-semibold">{m.income_title()}</h1>
        <p className="text-muted-foreground text-sm">{m.income_description()}</p>
      </div>

      <form
        className="flex flex-wrap items-start gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        <form.Field name="date">
          {(field) => (
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">{m.income_date_label()}</span>
              <input
                type="date"
                className="border-border rounded-md border px-3 py-2 text-sm"
                value={field.value ?? ''}
                onBlur={field.handleBlur}
                onChange={(event) => {
                  field.handleChange(event.target.value);
                }}
              />
              {field.errors.length > 0 && (
                <span className="text-danger text-xs">{field.errors.map((error) => error.message).join(', ')}</span>
              )}
            </label>
          )}
        </form.Field>

        <form.Field name="description">
          {(field) => (
            <label className="flex flex-1 flex-col gap-1">
              <span className="text-sm font-medium">{m.income_description_label()}</span>
              <input
                className="border-border rounded-md border px-3 py-2 text-sm"
                value={field.value ?? ''}
                onBlur={field.handleBlur}
                onChange={(event) => {
                  field.handleChange(event.target.value);
                }}
                placeholder={m.income_description_placeholder()}
              />
              {field.errors.length > 0 && (
                <span className="text-danger text-xs">{field.errors.map((error) => error.message).join(', ')}</span>
              )}
            </label>
          )}
        </form.Field>

        <form.Field name="amount">
          {(field) => (
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">{m.income_amount_label()}</span>
              <input
                type="number"
                step="any"
                min={0}
                className="border-border w-32 rounded-md border px-3 py-2 text-sm"
                value={field.value ?? ''}
                onBlur={field.handleBlur}
                onChange={(event) => {
                  field.handleChange(event.target.valueAsNumber);
                }}
              />
              {field.errors.length > 0 && (
                <span className="text-danger text-xs">{field.errors.map((error) => error.message).join(', ')}</span>
              )}
            </label>
          )}
        </form.Field>

        <form.Field name="type_id">
          {(field) => (
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">{m.income_type_label()}</span>
              <select
                className="border-border rounded-md border px-3 py-2 text-sm"
                value={field.value ?? undefined}
                onBlur={field.handleBlur}
                onChange={(event) => {
                  field.handleChange(event.target.value);
                }}
              >
                <option
                  value=""
                  disabled={true}
                >
                  {m.income_type_placeholder()}
                </option>
                {types.map((type) => (
                  <option
                    key={type.id}
                    value={type.id}
                  >
                    {type.name}
                  </option>
                ))}
              </select>
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
              className="mt-6"
            >
              {m.income_submit()}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-border border-b text-left">
            <th className="py-2 font-medium">{m.income_table_date()}</th>
            <th className="py-2 font-medium">{m.income_table_description()}</th>
            <th className="py-2 font-medium">{m.income_table_type()}</th>
            <th className="py-2 text-right font-medium">{m.income_table_amount()}</th>
            <th className="py-2 font-medium">
              <span className="sr-only">{m.income_table_actions()}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((entry) => (
            <tr
              key={entry.id}
              className="border-border border-b last:border-0"
            >
              <td className="py-2">{entry.date}</td>
              <td className="py-2">{entry.description}</td>
              <td className="py-2">{typesById.get(entry.type_id)?.name ?? entry.type_id}</td>
              <td className="py-2 text-right">{entry.amount.toLocaleString()}</td>
              <td className="py-2 text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={() => {
                    deleteIncome.mutate({ id: entry.id });
                  }}
                >
                  {m.income_delete()}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
