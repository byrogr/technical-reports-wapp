/**
 * Definición de rutas de la SPA.
 *
 * @author Roger Rojas Effio - roger.rojas@rmsolutions.pe
 */
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'

import { LoginPage } from '@/auth/LoginPage'
import { RequireAuth } from '@/auth/RequireAuth'
import { AppShell } from '@/components/layout/AppShell'
import { CatalogsPage } from '@/features/catalogs/CatalogsPage'
import { ClientListPage } from '@/features/clients/ClientListPage'
import { ReportDetailPage } from '@/features/reports/ReportDetailPage'
import { ReportFormPage } from '@/features/reports/ReportFormPage'
import { ReportListPage } from '@/features/reports/ReportListPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: (
          <AppShell>
            <Outlet />
          </AppShell>
        ),
        children: [
          { path: '/', element: <Navigate to="/reports" replace /> },
          { path: '/reports', element: <ReportListPage /> },
          { path: '/reports/new', element: <ReportFormPage /> },
          { path: '/reports/:id', element: <ReportDetailPage /> },
          { path: '/reports/:id/edit', element: <ReportFormPage /> },
          { path: '/clients/:id?', element: <ClientListPage /> },
          { path: '/catalogs', element: <CatalogsPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
])
