/**
 * Lista de informes, más recientes primero, con filtros opcionales.
 *
 * @author Roger Rojas Effio - roger.rojas@rmsolutions.pe
 */
import { useQuery } from '@tanstack/react-query'

import { client } from '@/api/client'
import type { components } from '@/api/schema'

export type ReportListItem = Required<
  Pick<
    components['schemas']['TechnicalReportResponse'],
    | 'id'
    | 'reportNumber'
    | 'clientName'
    | 'equipmentModel'
    | 'action'
    | 'finalStatus'
    | 'endDatetime'
  >
> &
  Pick<components['schemas']['TechnicalReportResponse'], 'equipmentSerialNumber'>

export interface ReportFilters {
  clientId?: number
  equipmentId?: number
  from?: string
  to?: string
}

export function useReports(filters: ReportFilters) {
  return useQuery({
    queryKey: ['reports', filters],
    queryFn: async () => {
      const { data, error } = await client.GET('/api/technical-reports', {
        params: { query: filters },
      })
      if (error) throw error
      return data.filter(
        (r): r is ReportListItem =>
          r.id != null &&
          r.reportNumber != null &&
          r.clientName != null &&
          r.equipmentModel != null &&
          r.action != null &&
          r.finalStatus != null &&
          r.endDatetime != null,
      )
    },
  })
}
