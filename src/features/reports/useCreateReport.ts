/**
 * Crea un informe (el backend asigna el número correlativo).
 *
 * @author Roger Rojas Effio - roger.rojas@rmsolutions.pe
 */
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { client } from '@/api/client'
import { ApiProblemError, isProblemDetail } from '@/api/problem'
import type { components } from '@/api/schema'

export function useCreateReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: components['schemas']['TechnicalReportRequest']) => {
      const { data, error } = await client.POST('/api/technical-reports', { body })
      if (error) throw new ApiProblemError(isProblemDetail(error) ? error : {})
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}
