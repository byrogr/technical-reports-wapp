/**
 * Proveedor de sesión: token JWT, email del usuario (claim `sub`), login() y logout().
 *
 * @author Roger Rojas Effio - roger.rojas@rmsolutions.pe
 */
import { useCallback, useMemo, useState, type ReactNode } from 'react'

import { client } from '@/api/client'
import { getProblemMessage, isProblemDetail } from '@/api/problem'

import { AuthContext, type AuthContextValue } from './AuthContext'
import { getJwtSubject } from './decodeJwt'
import { clearSession, loadSession, saveSession } from './tokenStorage'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => loadSession()?.token ?? null)

  const login = useCallback(async (email: string, password: string) => {
    const { data, error, response } = await client.POST('/api/auth/login', {
      body: { email, password },
    })

    if (error || !data?.accessToken || data.expiresIn == null) {
      if (response.status === 401) {
        throw new Error('Correo o contraseña incorrectos')
      }
      const problem = isProblemDetail(error) ? error : undefined
      throw new Error(getProblemMessage(problem))
    }

    saveSession(data.accessToken, data.expiresIn)
    setToken(data.accessToken)
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setToken(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: token !== null,
      userEmail: token ? getJwtSubject(token) : null,
      login,
      logout,
    }),
    [token, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
