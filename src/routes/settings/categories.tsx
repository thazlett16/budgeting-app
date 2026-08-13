import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/settings/categories')({
  component: SettingsCategoriesPage,
});

function SettingsCategoriesPage() {
  return <div>Categories</div>;
}
