import { createBrowserRouter, type RouteObject } from 'react-router';
import { AppLayout } from '@/app/layouts/app-layout';
import { allNavItems } from '@/app/navigation';
import { NotFoundPage } from '@/app/pages/not-found-page';
import { PlaceholderPage } from '@/app/pages/placeholder-page';
import { DashboardPage } from '@/features/dashboard/pages/dashboard-page';

/** Per-route metadata, read by the header breadcrumb and the document title. */
export interface RouteHandle {
  title: string;
}

// Every sidebar entry gets a route now so navigation works end to end. Each
// placeholder is replaced by the real feature page when its module is built.
const moduleRoutes: RouteObject[] = allNavItems
  .filter((item) => item.path !== '/')
  .map((item) => ({
    path: item.path.slice(1),
    element: <PlaceholderPage title={item.title} description={item.description} icon={item.icon} />,
    handle: { title: item.title } satisfies RouteHandle,
  }));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
        handle: { title: 'Dashboard' } satisfies RouteHandle,
      },
      ...moduleRoutes,
      {
        path: '*',
        element: <NotFoundPage />,
        handle: { title: 'Not found' } satisfies RouteHandle,
      },
    ],
  },
]);
