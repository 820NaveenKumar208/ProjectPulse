import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../types/auth';

type ProtectedRouteProps = {
  roles?: UserRole[];
};

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const location = useLocation();
  const { user, isAuthenticated, isHydrating } = useAuth();

  if (isHydrating) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-pulse-background px-6 text-pulse-text">
        <div className="h-10 w-10 rounded-full border-2 border-slate-200 border-t-pulse-primary" />
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate replace to="/login" state={{ from: location }} />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate replace to="/app" />;
  }

  return <Outlet />;
}
