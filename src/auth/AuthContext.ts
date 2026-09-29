/**
 * Contexto de sesión compartido entre AuthProvider y useAuth.
 *
 * @author Roger Rojas Effio - roger.rojas@rmsolutions.pe
 */
import { createContext } from 'react'

export interface AuthContextValue {
  isAuthenticated: boolean
  userEmail: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
