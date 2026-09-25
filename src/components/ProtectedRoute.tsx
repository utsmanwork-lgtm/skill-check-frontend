import { useAuth } from '@contexts/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import type { UserRole } from '@types';

interface ProtectedRouteProps {
  requiredRole?: UserRole | UserRole[];
}

export function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(user.role)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
}
