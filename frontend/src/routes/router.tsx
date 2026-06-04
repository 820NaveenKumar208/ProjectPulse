import { lazy, Suspense } from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';

import { App } from '../App';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { AdminCheckPage } from '../pages/AdminCheckPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';

const DashboardPage = lazy(async () => {
  const module = await import('../pages/DashboardPage');
  return { default: module.DashboardPage };
});

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate replace to="/app" />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordPage />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'app',
            element: (
              <Suspense
                fallback={
                  <main className="flex min-h-screen items-center justify-center bg-pulse-background">
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-pulse-primary" />
                  </main>
                }
              >
                <DashboardPage />
              </Suspense>
            ),
          },
        ],
      },
      {
        element: <ProtectedRoute roles={['admin']} />,
        children: [
          {
            path: 'admin',
            element: <AdminCheckPage />,
          },
        ],
      },
    ],
  },
]);
