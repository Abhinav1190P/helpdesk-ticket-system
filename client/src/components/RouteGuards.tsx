import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from './Feedback';
import type { Role } from '../lib/types';

/** Only for signed-in users (optionally restricted to certain roles) */
export function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const { user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return <PageLoader label="Checking your session…" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/tickets" replace />;
  return <Outlet />;
}

/** Only for signed-out users (login/register) */
export function GuestRoute() {
  const { user, initializing } = useAuth();
  if (initializing) return <PageLoader />;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/tickets'} replace />;
  return <Outlet />;
}
