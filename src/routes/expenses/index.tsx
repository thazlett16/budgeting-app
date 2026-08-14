import { createFileRoute } from '@tanstack/react-router';

import * as m from '#src/paraglide/messages';

export const Route = createFileRoute('/expenses/')({
  component: ExpensesPage,
});

function ExpensesPage() {
  return <div>{m.expenses_title()}</div>;
}
