/**
 * Edita un cliente.
 *
 * @author Roger Rojas Effio - roger.rojas@rmsolutions.pe
 */
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { client } from '@/api/client'
import { ApiProblemError, isProblemDetail } from '@/api/problem'
import type { components } from '@/api/schema'

interface UpdateClientInput {
  id: number
  body: components['schemas']['ClientRequest']
}

export function useUpdateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, body }: UpdateClientInput) => {
      const { data, error } = await client.PUT('/api/clients/{id}', {
        params: { path: { id } },
        body,
      })
      if (error) throw new ApiProblemError(isProblemDetail(error) ? error : {})
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
  })
}
