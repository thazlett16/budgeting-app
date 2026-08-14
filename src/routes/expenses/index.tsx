import { useForm } from '@tanstack/react-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import { Button } from '#src/components/ui/button';
import * as m from '#src/paraglide/messages';
import { expenseCategoriesOptions } from '#src/services/expenseCategories/options';
import { expensesOptions } from '#src/services/expenses/options';

import { expenseEntryFormOptions } from './-expenses/expense-entry-form-options';

export const Route = createFileRoute('/expenses/')({
  component: ExpensesPage,
});

function ExpensesPage() {
  const categoriesQuery = useQuery(expenseCategoriesOptions.listExpenseCategoriesQueryOptions());
  const expensesQuery = useQuery(expensesOptions.listExpensesQueryOptions());
  const createExpense = useMutation(expensesOptions.createExpenseMutationOptions);
  const deleteExpense = useMutation(expensesOptions.deleteExpenseMutationOptions);

  const categories = (categoriesQuery.data ?? []).filter((category) => !category.archived);
  const categoriesById = new Map(categories.map((category) => [category.id, category]));

  const form = useForm({
    ...expenseEntryFormOptions,
    onSubmit: async ({ schemaOutputs, formApi }) => {
      const [parsed] = schemaOutputs;

      await createExpense.mutateAsync({
        date: parsed.date,
        description: parsed.description,
        amount: parsed.amount,
        category_id: parsed.category_id,
      });
      formApi.reset();
    },
  });

  const expenses = expensesQuery.data ?? [];
  const rows = expenses.toSorted((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 p-6">
      <div>
        <h1 className="text-lg font-semibold">{m.expenses_title()}</h1>
        <p className="text-muted-foreground text-sm">{m.expenses_description()}</p>
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
              <span className="text-sm font-medium">{m.expenses_date_label()}</span>
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
              <span className="text-sm font-medium">{m.expenses_description_label()}</span>
              <input
                className="border-border rounded-md border px-3 py-2 text-sm"
                value={field.value ?? ''}
                onBlur={field.handleBlur}
                onChange={(event) => {
                  field.handleChange(event.target.value);
                }}
                placeholder={m.expenses_description_placeholder()}
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
              <span className="text-sm font-medium">{m.expenses_amount_label()}</span>
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

        <form.Field name="category_id">
          {(field) => (
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">{m.expenses_category_label()}</span>
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
                  {m.expenses_category_placeholder()}
                </option>
                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
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
              {m.expenses_submit()}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-border border-b text-left">
            <th className="py-2 font-medium">{m.expenses_table_date()}</th>
            <th className="py-2 font-medium">{m.expenses_table_description()}</th>
            <th className="py-2 font-medium">{m.expenses_table_category()}</th>
            <th className="py-2 text-right font-medium">{m.expenses_table_amount()}</th>
            <th className="py-2 font-medium">
              <span className="sr-only">{m.expenses_table_actions()}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((expense) => (
            <tr
              key={expense.id}
              className="border-border border-b last:border-0"
            >
              <td className="py-2">{expense.date}</td>
              <td className="py-2">{expense.description}</td>
              <td className="py-2">{categoriesById.get(expense.category_id)?.name ?? expense.category_id}</td>
              <td className="py-2 text-right">{expense.amount.toLocaleString()}</td>
              <td className="py-2 text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={() => {
                    deleteExpense.mutate({ id: expense.id });
                  }}
                >
                  {m.expenses_delete()}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
