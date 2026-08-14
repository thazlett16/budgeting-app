import { createFileRoute } from '@tanstack/react-router';

import * as m from '#src/paraglide/messages';

export const Route = createFileRoute('/settings/income-types')({
  component: SettingsIncomeTypesPage,
});

function SettingsIncomeTypesPage() {
  return <div>{m.settings_income_types_title()}</div>;
}
