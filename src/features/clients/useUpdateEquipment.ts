/**
 * Edita un equipo.
 *
 * @author Roger Rojas Effio - roger.rojas@rmsolutions.pe
 */
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { client } from '@/api/client'
import { ApiProblemError, isProblemDetail } from '@/api/problem'
import type { components } from '@/api/schema'

interface UpdateEquipmentInput {
  id: number
  clientId: number
  body: components['schemas']['EquipmentRequest']
}

export function useUpdateEquipment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, body }: UpdateEquipmentInput) => {
      const { data, error } = await client.PUT('/api/equipment/{id}', {
        params: { path: { id } },
        body,
      })
      if (error) throw new ApiProblemError(isProblemDetail(error) ? error : {})
      return data
    },
    onSuccess: (_data, { clientId }) => {
      void queryClient.invalidateQueries({ queryKey: ['equipment', clientId] })
    },
  })
}
