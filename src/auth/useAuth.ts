/**
 * Hook para consumir el contexto de sesión.
 *
 * @author Roger Rojas Effio - roger.rojas@rmsolutions.pe
 */
import { useContext } from 'react'

import { AuthContext, type AuthContextValue } from './AuthContext'

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}
