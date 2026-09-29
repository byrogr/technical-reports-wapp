/**
 * Obtiene un informe por id.
 *
 * @author Roger Rojas Effio - roger.rojas@rmsolutions.pe
 */
import { useQuery } from '@tanstack/react-query'

import { client } from '@/api/client'
import { ApiProblemError, isProblemDetail } from '@/api/problem'
import type { components } from '@/api/schema'

export type Report = components['schemas']['TechnicalReportResponse']

export function useReport(id: number) {
  return useQuery({
    queryKey: ['report', id],
    queryFn: async () => {
      const { data, error, response } = await client.GET('/api/technical-reports/{id}', {
        params: { path: { id } },
      })
      // El openapi.yaml del backend solo documenta la respuesta 200 para este
      // endpoint, así que openapi-fetch no puede tipar `error`; se lee el
      // status ANTES del `if` para no depender de ese narrowing.
      const status = response.status
      if (error) {
        if (status === 404) throw new ApiProblemError({ status: 404 })
        throw new ApiProblemError(isProblemDetail(error) ? error : {})
      }
      return data
    },
  })
}

export function isReportNotFound(error: unknown): boolean {
  return error instanceof ApiProblemError && error.problem.status === 404
}
