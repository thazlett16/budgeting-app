import { createFileRoute } from '@tanstack/react-router';

import * as m from '#src/paraglide/messages';

export const Route = createFileRoute('/income/')({
  component: IncomePage,
});

function IncomePage() {
  return <div>{m.income_title()}</div>;
}
