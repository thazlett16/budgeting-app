import { createFileRoute } from '@tanstack/react-router';

import * as m from '#src/paraglide/messages';

export const Route = createFileRoute('/settings/categories')({
  component: SettingsCategoriesPage,
});

function SettingsCategoriesPage() {
  return <div>{m.settings_categories_title()}</div>;
}
