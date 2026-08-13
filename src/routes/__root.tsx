import { TanStackDevtools } from '@tanstack/react-devtools';
import { formDevtoolsPlugin } from '@tanstack/react-form-devtools';
import { PacerDevtoolsPanel } from '@tanstack/react-pacer-devtools';
import type { QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools';
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';

interface RouterContext {
  queryClient: QueryClient;
}

const queryDevtoolsPlugin = {
  name: 'TanStack Query',
  render: <ReactQueryDevtoolsPanel />,
};

const routerDevtoolsPlugin = {
  name: 'TanStack Router',
  render: <TanStackRouterDevtoolsPanel />,
};

const pacerDevtoolsPlugin = {
  name: 'TanStack Pacer',
  render: <PacerDevtoolsPanel />,
};

// TanStack Table has no global devtools panel — it's wired per-table-instance
// (`<ReactTableDevtoolsPanel table={table} />` from `@tanstack/react-table-devtools`)
// once real tables exist in `src/components/tables/`. TanStack Store has no
// dedicated devtools package at all; inspect it via React DevTools for now.

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <Outlet />
      <TanStackDevtools
        config={{
          panelLocation: 'bottom',
          position: 'bottom-right',
        }}
        plugins={[formDevtoolsPlugin(), routerDevtoolsPlugin, queryDevtoolsPlugin, pacerDevtoolsPlugin]}
      />
    </>
  );
}
