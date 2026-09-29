/**
 * Lista de equipos de un cliente. Si clientId es undefined, no consulta nada
 * (se usa así en el filtro de informes, deshabilitado hasta elegir cliente).
 *
 * @author Roger Rojas Effio - roger.rojas@rmsolutions.pe
 */
import { useQuery } from '@tanstack/react-query'

import { client } from '@/api/client'
import type { components } from '@/api/schema'

export type Equipment = Required<
  Pick<components['schemas']['EquipmentResponse'], 'id' | 'model' | 'clientId'>
> &
  Pick<components['schemas']['EquipmentResponse'], 'serialNumber' | 'clientName'>

export function useEquipment(clientId: number | undefined) {
  return useQuery({
    queryKey: ['equipment', clientId ?? null],
    queryFn: async () => {
      if (clientId == null) return []
      const { data, error } = await client.GET('/api/clients/{clientId}/equipment', {
        params: { path: { clientId } },
      })
      if (error) throw error
      return data.filter(
        (e): e is Equipment => e.id != null && e.model != null && e.clientId != null,
      )
    },
    enabled: clientId != null,
  })
}
