/**
 * Guarda de rutas privadas: redirige a /login (guardando la ruta) si no hay sesión.
 *
 * @author Roger Rojas Effio - roger.rojas@rmsolutions.pe
 */
import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuth } from './useAuth'

export function RequireAuth() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?redirect=${redirect}`} replace />
  }

  return <Outlet />
}
