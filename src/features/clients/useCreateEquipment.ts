/**
 * Crea un equipo para un cliente.
 *
 * @author Roger Rojas Effio - roger.rojas@rmsolutions.pe
 */
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { client } from '@/api/client'
import { ApiProblemError, isProblemDetail } from '@/api/problem'
import type { components } from '@/api/schema'

interface CreateEquipmentInput {
  clientId: number
  body: components['schemas']['EquipmentRequest']
}

export function useCreateEquipment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ clientId, body }: CreateEquipmentInput) => {
      const { data, error } = await client.POST('/api/clients/{clientId}/equipment', {
        params: { path: { clientId } },
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
