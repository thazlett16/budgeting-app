import { createFileRoute } from '@tanstack/react-router';

import * as m from '#src/paraglide/messages';

export const Route = createFileRoute('/investments/')({
  component: InvestmentsPage,
});

function InvestmentsPage() {
  return <div>{m.investments_title()}</div>;
}
