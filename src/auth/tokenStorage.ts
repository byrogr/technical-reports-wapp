/**
 * Persistencia de la sesión (token JWT y expiración) en localStorage.
 *
 * @author Roger Rojas Effio - roger.rojas@rmsolutions.pe
 */

const TOKEN_KEY = 'technical-reports:token'
const EXPIRES_AT_KEY = 'technical-reports:expiresAt'

export interface Session {
  token: string
  expiresAt: number
}

export function saveSession(accessToken: string, expiresIn: number): Session {
  const expiresAt = Date.now() + expiresIn * 1000
  localStorage.setItem(TOKEN_KEY, accessToken)
  localStorage.setItem(EXPIRES_AT_KEY, String(expiresAt))
  return { token: accessToken, expiresAt }
}

/** Devuelve la sesión vigente, o null si no hay token o ya expiró. */
export function loadSession(): Session | null {
  const token = localStorage.getItem(TOKEN_KEY)
  const expiresAt = Number(localStorage.getItem(EXPIRES_AT_KEY))

  if (!token || !expiresAt || Number.isNaN(expiresAt)) {
    return null
  }

  if (Date.now() >= expiresAt) {
    clearSession()
    return null
  }

  return { token, expiresAt }
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(EXPIRES_AT_KEY)
}
