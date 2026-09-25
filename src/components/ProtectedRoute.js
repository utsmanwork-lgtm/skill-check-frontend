import { jsx as _jsx } from "react/jsx-runtime";
import { useAuth } from '@contexts/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
export function ProtectedRoute({ requiredRole }) {
    const { user, loading } = useAuth();
    if (loading) {
        return _jsx("div", { className: "flex items-center justify-center min-h-screen", children: "Loading..." });
    }
    if (!user) {
        return _jsx(Navigate, { to: "/login", replace: true });
    }
    if (requiredRole) {
        const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        if (!roles.includes(user.role)) {
            return _jsx(Navigate, { to: "/unauthorized", replace: true });
        }
    }
    return _jsx(Outlet, {});
}
