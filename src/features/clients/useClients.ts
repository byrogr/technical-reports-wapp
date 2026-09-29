/**
 * Lista de clientes, ordenados por nombre.
 *
 * @author Roger Rojas Effio - roger.rojas@rmsolutions.pe
 */
import { useQuery } from '@tanstack/react-query'

import { client } from '@/api/client'
import type { components } from '@/api/schema'

export type Client = Required<Pick<components['schemas']['ClientResponse'], 'id' | 'name'>> &
  Pick<components['schemas']['ClientResponse'], 'documentType' | 'documentNumber' | 'contactEmail'>

export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await client.GET('/api/clients')
      if (error) throw error
      return data.filter((c): c is Client => c.id != null && c.name != null)
    },
  })
}
