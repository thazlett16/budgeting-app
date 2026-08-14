import { createFileRoute } from '@tanstack/react-router';

import * as m from '#src/paraglide/messages';

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
});

function DashboardPage() {
  return <div>{m.dashboard_title()}</div>;
}
