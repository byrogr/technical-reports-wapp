/**
 * Edita el valor o el estado (activo/inactivo) de una opción de catálogo.
 *
 * @author Roger Rojas Effio - roger.rojas@rmsolutions.pe
 */
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { client } from '@/api/client'
import { ApiProblemError, isProblemDetail } from '@/api/problem'

import type { CatalogType } from './catalogTypes'

interface UpdateCatalogInput {
  id: number
  value: string
  active: boolean
}

export function useUpdateCatalog(type: CatalogType) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, value, active }: UpdateCatalogInput) => {
      const { data, error } = await client.PUT('/api/catalogs/{id}', {
        params: { path: { id } },
        body: { value, active },
      })
      if (error) throw new ApiProblemError(isProblemDetail(error) ? error : {})
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['catalogs', type] })
    },
  })
}
