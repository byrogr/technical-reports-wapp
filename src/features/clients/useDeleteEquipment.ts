/**
 * Elimina un equipo (409 si tiene informes).
 *
 * @author Roger Rojas Effio - roger.rojas@rmsolutions.pe
 */
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { client } from '@/api/client'
import { ApiProblemError, isProblemDetail } from '@/api/problem'

interface DeleteEquipmentInput {
  id: number
  clientId: number
}

export function useDeleteEquipment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id }: DeleteEquipmentInput) => {
      const { error } = await client.DELETE('/api/equipment/{id}', {
        params: { path: { id } },
      })
      if (error) throw new ApiProblemError(isProblemDetail(error) ? error : {})
    },
    onSuccess: (_data, { clientId }) => {
      void queryClient.invalidateQueries({ queryKey: ['equipment', clientId] })
    },
  })
}
