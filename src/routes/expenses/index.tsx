import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/expenses/')({
  component: ExpensesPage,
});

function ExpensesPage() {
  return <div>{'Expenses'}</div>;
}
