import { Link } from '@tanstack/react-router';

import * as m from '#src/paraglide/messages';

const primaryLinks = [
  { to: '/dashboard', label: m.nav_dashboard },
  { to: '/investments', label: m.nav_investments },
  { to: '/expenses', label: m.nav_expenses },
  { to: '/income', label: m.nav_income },
] as const;

const settingsLinks = [
  { to: '/settings/accounts', label: m.nav_settings_accounts },
  { to: '/settings/categories', label: m.nav_settings_categories },
  { to: '/settings/income-types', label: m.nav_settings_income_types },
  { to: '/settings/import-export', label: m.nav_settings_import_export },
] as const;

const linkClassName = 'rounded-md px-3 py-1.5 text-sm data-[status=active]:bg-muted data-[status=active]:font-medium';

export function AppNav() {
  return (
    <nav className="border-border flex flex-wrap items-center justify-between gap-4 border-b px-6 py-3">
      <div className="flex items-center gap-1">
        {primaryLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={linkClassName}
          >
            {link.label()}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-1">
        {settingsLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={linkClassName}
          >
            {link.label()}
          </Link>
        ))}
      </div>
    </nav>
  );
}
