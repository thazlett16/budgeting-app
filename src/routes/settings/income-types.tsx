import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/settings/income-types')({
  component: SettingsIncomeTypesPage,
});

function SettingsIncomeTypesPage() {
  return <div>{'Income Types'}</div>;
}
