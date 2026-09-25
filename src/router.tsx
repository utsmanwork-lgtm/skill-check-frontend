import { createBrowserRouter } from 'react-router-dom';
import { LoginPage } from '@pages/LoginPage';
import { GuruDashboardPage } from '@pages/GuruDashboardPage';
import { AnalyticsPage } from '@pages/AnalyticsPage';
import { AdminPanelPage } from '@pages/AdminPanelPage';
import { UnauthorizedPage } from '@pages/UnauthorizedPage';
import { ProtectedRoute } from '@components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        path: 'dashboard',
        element: <GuruDashboardPage />,
      },
      {
        path: 'analytics',
        element: <AnalyticsPage />,
        handle: { requiredRole: ['guru', 'admin'] },
      },
      {
        path: 'admin',
        element: <AdminPanelPage />,
        handle: { requiredRole: 'admin' },
      },
    ],
  },
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },
  {
    path: '*',
    element: <LoginPage />,
  },
]);
