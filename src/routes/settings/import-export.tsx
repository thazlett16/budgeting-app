import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/settings/import-export')({
  component: SettingsImportExportPage,
});

function SettingsImportExportPage() {
  return <div>Import / Export</div>;
}
