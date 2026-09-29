/**
 * Lectura del claim `sub` de un JWT sin validar su firma (eso lo hace el backend).
 *
 * @author Roger Rojas Effio - roger.rojas@rmsolutions.pe
 */

export function getJwtSubject(token: string): string | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(base64)
    const claims = JSON.parse(json) as { sub?: string }
    return claims.sub ?? null
  } catch {
    return null
  }
}
