/**
 * Crea una opción de catálogo.
 *
 * @author Roger Rojas Effio - roger.rojas@rmsolutions.pe
 */
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { client } from '@/api/client'
import { ApiProblemError, isProblemDetail } from '@/api/problem'

import type { CatalogType } from './catalogTypes'

export function useCreateCatalog(type: CatalogType) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (value: string) => {
      const { data, error } = await client.POST('/api/catalogs', {
        body: { type, value },
      })
      if (error) throw new ApiProblemError(isProblemDetail(error) ? error : {})
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['catalogs', type] })
    },
  })
}
