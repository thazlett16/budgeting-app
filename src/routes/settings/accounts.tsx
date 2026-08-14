import { useState } from 'react';

import { useForm } from '@tanstack/react-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import * as v from 'valibot';

import { ACCOUNT_CATEGORY_OPTIONS, accountCategory } from '#src/common/account-categories';
import { Button } from '#src/components/ui/button';
import * as m from '#src/paraglide/messages';
import { accountsOptions } from '#src/services/accounts/options';

import { accountFormOptions } from './-accounts/account-form-options';

export const Route = createFileRoute('/settings/accounts')({
  component: SettingsAccountsPage,
});

function SettingsAccountsPage() {
  const accountsQuery = useQuery(accountsOptions.listAccountsQueryOptions());
  const createAccount = useMutation(accountsOptions.createAccountMutationOptions);
  const archiveAccount = useMutation(accountsOptions.archiveAccountMutationOptions);
  const [showArchived, setShowArchived] = useState(false);

  const form = useForm({
    ...accountFormOptions,
    onSubmit: async ({ schemaOutputs, formApi }) => {
      const [parsed] = schemaOutputs;

      await createAccount.mutateAsync({
        name: parsed.name,
        category: parsed.category,
        archived: false,
        sortOrder: accountsQuery.data?.length ?? 0,
      });
      formApi.reset();
    },
  });

  const accounts = accountsQuery.data ?? [];
  let visibleAccounts = accounts;

  if (!showArchived) {
    visibleAccounts = accounts.filter((account) => !account.archived);
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 p-6">
      <div>
        <h1 className="text-lg font-semibold">{m.settings_accounts_title()}</h1>
        <p className="text-muted-foreground text-sm">{m.settings_accounts_description()}</p>
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
              <span className="text-sm font-medium">{m.settings_accounts_name_label()}</span>
              <input
                className="border-border rounded-md border px-3 py-2 text-sm"
                value={field.value ?? ''}
                onBlur={field.handleBlur}
                onChange={(event) => {
                  field.handleChange(event.target.value);
                }}
                placeholder={m.settings_accounts_name_placeholder()}
              />
              {field.errors.length > 0 && (
                <span className="text-danger text-xs">{field.errors.map((error) => error.message).join(', ')}</span>
              )}
            </label>
          )}
        </form.Field>

        <form.Field name="category">
          {(field) => (
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">{m.settings_accounts_category_label()}</span>
              <select
                className="border-border rounded-md border px-3 py-2 text-sm"
                value={field.value ?? undefined}
                onBlur={field.handleBlur}
                onChange={(event) => {
                  field.handleChange(v.parse(accountCategory(), event.target.value));
                }}
              >
                {ACCOUNT_CATEGORY_OPTIONS.map((category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                ))}
              </select>
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
              {m.settings_accounts_submit()}
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
          {m.settings_accounts_show_archived()}
        </label>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-border border-b text-left">
              <th className="py-2 font-medium">{m.settings_accounts_table_name()}</th>
              <th className="py-2 font-medium">{m.settings_accounts_table_category()}</th>
              <th className="py-2 font-medium">
                <span className="sr-only">{m.settings_accounts_table_actions()}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleAccounts.map((account) => (
              <tr
                key={account.id}
                className="border-border border-b last:border-0"
              >
                <td className="py-2">{account.name}</td>
                <td className="text-muted-foreground py-2">{account.category}</td>
                <td className="py-2 text-right">
                  {!account.archived && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onPress={() => {
                        archiveAccount.mutate({ id: account.id });
                      }}
                    >
                      {m.settings_accounts_archive()}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
