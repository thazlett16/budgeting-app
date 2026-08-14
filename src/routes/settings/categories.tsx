import { useState } from 'react';

import { useForm } from '@tanstack/react-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import { Button } from '#src/components/ui/button';
import * as m from '#src/paraglide/messages';
import { expenseCategoriesOptions } from '#src/services/expenseCategories/options';

import { lookupItemFormOptions } from './-lookup-items/lookup-item-form-options';

export const Route = createFileRoute('/settings/categories')({
  component: SettingsCategoriesPage,
});

function SettingsCategoriesPage() {
  const categoriesQuery = useQuery(expenseCategoriesOptions.listExpenseCategoriesQueryOptions());
  const createCategory = useMutation(expenseCategoriesOptions.createExpenseCategoryMutationOptions);
  const archiveCategory = useMutation(expenseCategoriesOptions.archiveExpenseCategoryMutationOptions);
  const [showArchived, setShowArchived] = useState(false);

  const form = useForm({
    ...lookupItemFormOptions,
    onSubmit: async ({ schemaOutputs, formApi }) => {
      const [parsed] = schemaOutputs;

      await createCategory.mutateAsync({
        name: parsed.name,
        archived: false,
        sort_order: categoriesQuery.data?.length ?? 0,
      });
      formApi.reset();
    },
  });

  const categories = categoriesQuery.data ?? [];
  let visibleCategories = categories;

  if (!showArchived) {
    visibleCategories = categories.filter((category) => !category.archived);
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 p-6">
      <div>
        <h1 className="text-lg font-semibold">{m.settings_categories_title()}</h1>
        <p className="text-muted-foreground text-sm">{m.settings_categories_description()}</p>
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
              <span className="text-sm font-medium">{m.settings_categories_name_label()}</span>
              <input
                className="border-border rounded-md border px-3 py-2 text-sm"
                value={field.value ?? ''}
                onBlur={field.handleBlur}
                onChange={(event) => {
                  field.handleChange(event.target.value);
                }}
                placeholder={m.settings_categories_name_placeholder()}
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
              {m.settings_categories_submit()}
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
          {m.settings_categories_show_archived()}
        </label>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-border border-b text-left">
              <th className="py-2 font-medium">{m.settings_categories_table_name()}</th>
              <th className="py-2 font-medium">
                <span className="sr-only">{m.settings_categories_table_actions()}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleCategories.map((category) => (
              <tr
                key={category.id}
                className="border-border border-b last:border-0"
              >
                <td className="py-2">{category.name}</td>
                <td className="py-2 text-right">
                  {!category.archived && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onPress={() => {
                        archiveCategory.mutate({ id: category.id });
                      }}
                    >
                      {m.settings_categories_archive()}
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
