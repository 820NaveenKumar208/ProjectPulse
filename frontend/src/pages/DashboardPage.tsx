import { useAuth } from '../hooks/useAuth';
import { AdminDashboard } from './dashboards/AdminDashboard';
import { ManagerDashboard } from './dashboards/ManagerDashboard';
import { ClientDashboard } from './dashboards/ClientDashboard';
import { AlertTriangle } from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center text-center">
        <AlertTriangle className="h-10 w-10 text-amber-500" />
        <h3 className="mt-4 text-sm font-semibold text-slate-900">Not Authenticated</h3>
        <p className="mt-1 text-xs text-slate-500">Please sign in to access the dashboard.</p>
      </div>
    );
  }

  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'manager':
      return <ManagerDashboard />;
    case 'client':
      return <ClientDashboard />;
    default:
      return (
        <div className="flex h-[50vh] flex-col items-center justify-center text-center">
          <AlertTriangle className="h-10 w-10 text-rose-500" />
          <h3 className="mt-4 text-sm font-semibold text-slate-900">Unknown Role</h3>
          <p className="mt-1 text-xs text-slate-500">Your account does not have a valid role assigned.</p>
        </div>
      );
  }
}
