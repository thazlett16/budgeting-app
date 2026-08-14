import { createFileRoute } from '@tanstack/react-router';

import * as m from '#src/paraglide/messages';

export const Route = createFileRoute('/settings/import-export')({
  component: SettingsImportExportPage,
});

function SettingsImportExportPage() {
  return <div>{m.settings_import_export_title()}</div>;
}
