/**
 * Instancia de openapi-fetch tipada con el contrato de la API. Agrega el token
 * de sesión y `Accept-Language: es`; ante un 401 fuera del login, cierra la
 * sesión y redirige a /login guardando la ruta para volver después.
 *
 * @author Roger Rojas Effio - roger.rojas@rmsolutions.pe
 */
import createClient from 'openapi-fetch'
import { toast } from 'sonner'

import { clearSession, loadSession } from '@/auth/tokenStorage'

import type { paths } from './schema'

export const client = createClient<paths>({
  baseUrl: import.meta.env.VITE_API_URL ?? '',
})

client.use({
  onRequest({ request }) {
    request.headers.set('Accept-Language', 'es')

    const session = loadSession()
    if (session) {
      request.headers.set('Authorization', `Bearer ${session.token}`)
    }

    return request
  },
  onResponse({ request, response }) {
    const isLogin = new URL(request.url).pathname === '/api/auth/login'

    if (response.status === 401 && !isLogin) {
      clearSession()

      if (window.location.pathname !== '/login') {
        const redirectTo = window.location.pathname + window.location.search
        window.location.href = `/login?redirect=${encodeURIComponent(redirectTo)}`
      }
    } else if (response.status >= 500) {
      toast.error('No se pudo conectar con el servidor')
    }

    return response
  },
})
