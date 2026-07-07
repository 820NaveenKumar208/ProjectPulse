/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';

import { App } from '../App';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { AppShell } from '../components/AppShell';
import { AdminCheckPage } from '../pages/AdminCheckPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';

// Lazy load public & authenticated pages
const LandingPage = lazy(async () => {
  const module = await import('../pages/LandingPage');
  return { default: module.LandingPage };
});

const DashboardPage = lazy(async () => {
  const module = await import('../pages/DashboardPage');
  return { default: module.DashboardPage };
});

const ProjectsPage = lazy(async () => {
  const module = await import('../pages/ProjectsPage');
  return { default: module.ProjectsPage };
});

const CreateProjectPage = lazy(async () => {
  const module = await import('../pages/CreateProjectPage');
  return { default: module.CreateProjectPage };
});

const ProjectDetailPage = lazy(async () => {
  const module = await import('../pages/ProjectDetailPage');
  return { default: module.ProjectDetailPage };
});

const EditProjectPage = lazy(async () => {
  const module = await import('../pages/EditProjectPage');
  return { default: module.EditProjectPage };
});

const CreateMilestonePage = lazy(async () => {
  const module = await import('../pages/CreateMilestonePage');
  return { default: module.CreateMilestonePage };
});

const MilestoneDetailPage = lazy(async () => {
  const module = await import('../pages/MilestoneDetailPage');
  return { default: module.MilestoneDetailPage };
});

const SharePage = lazy(async () => {
  const module = await import('../pages/SharePage');
  return { default: module.SharePage };
});

const NotificationsPage = lazy(async () => {
  const module = await import('../pages/NotificationsPage');
  return { default: module.NotificationsPage };
});

const ReportsPage = lazy(async () => {
  const module = await import('../pages/ReportsPage');
  return { default: module.ReportsPage };
});

// Newly added visibility platform pages
const ApprovalsPage = lazy(async () => {
  const module = await import('../pages/ApprovalsPage');
  return { default: module.ApprovalsPage };
});

const MilestonesPage = lazy(async () => {
  const module = await import('../pages/MilestonesPage');
  return { default: module.MilestonesPage };
});

const ProfilePage = lazy(async () => {
  const module = await import('../pages/ProfilePage');
  return { default: module.ProfilePage };
});

const SettingsPage = lazy(async () => {
  const module = await import('../pages/SettingsPage');
  return { default: module.SettingsPage };
});

const UsersPage = lazy(async () => {
  const module = await import('../pages/UsersPage');
  return { default: module.UsersPage };
});

const AllReportsPage = lazy(async () => {
  const module = await import('../pages/AllReportsPage');
  return { default: module.AllReportsPage };
});

// A clean loading fallback for router transitions
const LoaderFallback = () => (
  <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-[#0B1120]">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 dark:border-slate-800 border-t-pulse-primary" />
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoaderFallback />}>
            <LandingPage />
          </Suspense>
        ),
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
            element: <AppShell />,
            children: [
              {
                path: 'dashboard',
                element: (
                  <Suspense fallback={<LoaderFallback />}>
                    <DashboardPage />
                  </Suspense>
                ),
              },
              {
                path: 'app',
                element: <Navigate replace to="/dashboard" />,
              },
              {
                path: 'projects',
                element: (
                  <Suspense fallback={<LoaderFallback />}>
                    <ProjectsPage />
                  </Suspense>
                ),
              },
              {
                path: 'projects/new',
                element: (
                  <Suspense fallback={<LoaderFallback />}>
                    <CreateProjectPage />
                  </Suspense>
                ),
              },
              {
                path: 'projects/:projectId',
                element: (
                  <Suspense fallback={<LoaderFallback />}>
                    <ProjectDetailPage />
                  </Suspense>
                ),
              },
              {
                path: 'projects/:projectId/edit',
                element: (
                  <Suspense fallback={<LoaderFallback />}>
                    <EditProjectPage />
                  </Suspense>
                ),
              },
              {
                path: 'projects/:projectId/milestones/new',
                element: (
                  <Suspense fallback={<LoaderFallback />}>
                    <CreateMilestonePage />
                  </Suspense>
                ),
              },
              {
                path: 'projects/:projectId/milestones/:milestoneId',
                element: (
                  <Suspense fallback={<LoaderFallback />}>
                    <MilestoneDetailPage />
                  </Suspense>
                ),
              },
              {
                path: 'notifications',
                element: (
                  <Suspense fallback={<LoaderFallback />}>
                    <NotificationsPage />
                  </Suspense>
                ),
              },
              {
                path: 'app/notifications',
                element: <Navigate replace to="/notifications" />,
              },
              {
                path: 'projects/:projectId/reports',
                element: (
                  <Suspense fallback={<LoaderFallback />}>
                    <ReportsPage />
                  </Suspense>
                ),
              },
              {
                path: 'approvals',
                element: (
                  <Suspense fallback={<LoaderFallback />}>
                    <ApprovalsPage />
                  </Suspense>
                ),
              },
              {
                path: 'milestones',
                element: (
                  <Suspense fallback={<LoaderFallback />}>
                    <MilestonesPage />
                  </Suspense>
                ),
              },
              {
                path: 'profile',
                element: (
                  <Suspense fallback={<LoaderFallback />}>
                    <ProfilePage />
                  </Suspense>
                ),
              },
              {
                path: 'settings',
                element: (
                  <Suspense fallback={<LoaderFallback />}>
                    <SettingsPage />
                  </Suspense>
                ),
              },
              {
                path: 'users',
                element: (
                  <Suspense fallback={<LoaderFallback />}>
                    <UsersPage />
                  </Suspense>
                ),
              },
              {
                path: 'organizations',
                element: (
                  <Suspense fallback={<LoaderFallback />}>
                    <UsersPage />
                  </Suspense>
                ),
              },
              {
                path: 'reports',
                element: (
                  <Suspense fallback={<LoaderFallback />}>
                    <AllReportsPage />
                  </Suspense>
                ),
              },
            ],
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
      {
        // Public share page — no auth required
        path: 'share/:token',
        element: (
          <Suspense fallback={<LoaderFallback />}>
            <SharePage />
          </Suspense>
        ),
      },
    ],
  },
]);
