import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/income/')({
  component: IncomePage,
});

function IncomePage() {
  return <div>Income</div>;
}
