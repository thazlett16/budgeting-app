import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/investments/')({
  component: InvestmentsPage,
});

function InvestmentsPage() {
  return <div>Investments</div>;
}
