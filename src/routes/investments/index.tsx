import { useForm } from '@tanstack/react-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import { Button } from '#src/components/ui/button';
import * as m from '#src/paraglide/messages';
import { accountsOptions } from '#src/services/accounts/options';
import { investmentsOptions } from '#src/services/investments/options';

import { investmentEntryFormOptions } from './-investments/investment-entry-form-options';

export const Route = createFileRoute('/investments/')({
  component: InvestmentsPage,
});

function formatGain(value: number | null) {
  if (value === null) {
    return '—';
  }

  return value.toLocaleString();
}

function formatGainPercent(value: number | null) {
  if (value === null) {
    return '—';
  }

  return `${(value * 100).toFixed(1)}%`;
}

function InvestmentsPage() {
  const accountsQuery = useQuery(accountsOptions.listAccountsQueryOptions());
  const entriesQuery = useQuery(investmentsOptions.listInvestmentEntriesQueryOptions());
  const createEntry = useMutation(investmentsOptions.createInvestmentEntryMutationOptions);
  const deleteEntry = useMutation(investmentsOptions.deleteInvestmentEntryMutationOptions);

  const accounts = (accountsQuery.data ?? []).filter((account) => !account.archived);
  const accountsById = new Map(accounts.map((account) => [account.id, account]));

  const form = useForm({
    ...investmentEntryFormOptions,
    onSubmit: async ({ schemaOutputs, formApi }) => {
      const [parsed] = schemaOutputs;

      await createEntry.mutateAsync({
        date: parsed.date,
        account_id: parsed.account_id,
        balance: parsed.balance,
        contribution: parsed.contribution,
      });
      formApi.reset();
    },
  });

  const entries = entriesQuery.data ?? [];
  const sortedEntries = entries.toSorted((a, b) => a.date.localeCompare(b.date));

  const priorBalanceByEntryId = new Map<string, number>();
  const latestPerAccount = new Map<string, string>();

  for (const entry of sortedEntries) {
    const priorEntryId = latestPerAccount.get(entry.account_id);

    if (priorEntryId) {
      const priorEntry = entries.find((candidate) => candidate.id === priorEntryId);

      if (priorEntry) {
        priorBalanceByEntryId.set(entry.id, priorEntry.balance);
      }
    }

    latestPerAccount.set(entry.account_id, entry.id);
  }

  const rows = entries.toSorted((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 p-6">
      <div>
        <h1 className="text-lg font-semibold">{m.investments_title()}</h1>
        <p className="text-muted-foreground text-sm">{m.investments_description()}</p>
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
              <span className="text-sm font-medium">{m.investments_date_label()}</span>
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

        <form.Field name="account_id">
          {(field) => (
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">{m.investments_account_label()}</span>
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
                  {m.investments_account_placeholder()}
                </option>
                {accounts.map((account) => (
                  <option
                    key={account.id}
                    value={account.id}
                  >
                    {account.name}
                  </option>
                ))}
              </select>
              {field.errors.length > 0 && (
                <span className="text-danger text-xs">{field.errors.map((error) => error.message).join(', ')}</span>
              )}
            </label>
          )}
        </form.Field>

        <form.Field name="balance">
          {(field) => (
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">{m.investments_balance_label()}</span>
              <input
                type="number"
                step="any"
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

        <form.Field name="contribution">
          {(field) => (
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">{m.investments_contribution_label()}</span>
              <input
                type="number"
                step="any"
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

        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button
              type="submit"
              isDisabled={isSubmitting}
              className="mt-6"
            >
              {m.investments_submit()}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-border border-b text-left">
            <th className="py-2 font-medium">{m.investments_table_date()}</th>
            <th className="py-2 font-medium">{m.investments_table_account()}</th>
            <th className="py-2 text-right font-medium">{m.investments_table_balance()}</th>
            <th className="py-2 text-right font-medium">{m.investments_table_contribution()}</th>
            <th className="py-2 text-right font-medium">{m.investments_table_gain_dollar()}</th>
            <th className="py-2 text-right font-medium">{m.investments_table_gain_percent()}</th>
            <th className="py-2 font-medium">
              <span className="sr-only">{m.investments_table_actions()}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((entry) => {
            const priorBalance = priorBalanceByEntryId.get(entry.id);

            let gainDollar: number | null = null;
            let gainPercent: number | null = null;

            if (priorBalance !== undefined) {
              gainDollar = entry.balance - entry.contribution - priorBalance;

              if (priorBalance !== 0) {
                gainPercent = gainDollar / priorBalance;
              }
            }

            return (
              <tr
                key={entry.id}
                className="border-border border-b last:border-0"
              >
                <td className="py-2">{entry.date}</td>
                <td className="py-2">{accountsById.get(entry.account_id)?.name ?? entry.account_id}</td>
                <td className="py-2 text-right">{entry.balance.toLocaleString()}</td>
                <td className="py-2 text-right">{entry.contribution.toLocaleString()}</td>
                <td className="py-2 text-right">{formatGain(gainDollar)}</td>
                <td className="py-2 text-right">{formatGainPercent(gainPercent)}</td>
                <td className="py-2 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onPress={() => {
                      deleteEntry.mutate({ id: entry.id });
                    }}
                  >
                    {m.investments_delete()}
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
