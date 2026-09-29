/**
 * Lista de opciones de catálogo para un tipo (incluye activas e inactivas).
 *
 * @author Roger Rojas Effio - roger.rojas@rmsolutions.pe
 */
import { useQuery } from '@tanstack/react-query'

import { client } from '@/api/client'

import type { CatalogOption, CatalogType } from './catalogTypes'

export function useCatalogs(type: CatalogType) {
  return useQuery({
    queryKey: ['catalogs', type],
    queryFn: async () => {
      const { data, error } = await client.GET('/api/catalogs', {
        params: { query: { type } },
      })
      if (error) throw error
      return data.filter(
        (option): option is CatalogOption =>
          option.id != null && option.value != null && option.active != null && option.type != null,
      )
    },
    staleTime: 5 * 60 * 1000,
  })
}
