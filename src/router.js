import { jsx as _jsx } from "react/jsx-runtime";
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
        element: _jsx(LoginPage, {}),
    },
    {
        path: '/',
        element: _jsx(ProtectedRoute, {}),
        children: [
            {
                path: 'dashboard',
                element: _jsx(GuruDashboardPage, {}),
            },
            {
                path: 'analytics',
                element: _jsx(AnalyticsPage, {}),
                handle: { requiredRole: ['guru', 'admin'] },
            },
            {
                path: 'admin',
                element: _jsx(AdminPanelPage, {}),
                handle: { requiredRole: 'admin' },
            },
        ],
    },
    {
        path: '/unauthorized',
        element: _jsx(UnauthorizedPage, {}),
    },
    {
        path: '*',
        element: _jsx(LoginPage, {}),
    },
]);
