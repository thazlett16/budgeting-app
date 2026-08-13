import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/settings/accounts')({
  component: SettingsAccountsPage,
});

function SettingsAccountsPage() {
  return <div>Accounts</div>;
}
