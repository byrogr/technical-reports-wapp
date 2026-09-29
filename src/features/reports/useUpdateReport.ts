/**
 * Edita un informe (no cambia el número ni el autor).
 *
 * @author Roger Rojas Effio - roger.rojas@rmsolutions.pe
 */
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { client } from '@/api/client'
import { ApiProblemError, isProblemDetail } from '@/api/problem'
import type { components } from '@/api/schema'

interface UpdateReportInput {
  id: number
  body: components['schemas']['TechnicalReportRequest']
}

export function useUpdateReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, body }: UpdateReportInput) => {
      const { data, error } = await client.PUT('/api/technical-reports/{id}', {
        params: { path: { id } },
        body,
      })
      if (error) throw new ApiProblemError(isProblemDetail(error) ? error : {})
      return data
    },
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ['reports'] })
      void queryClient.invalidateQueries({ queryKey: ['report', id] })
    },
  })
}
