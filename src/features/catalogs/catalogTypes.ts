/**
 * Tipos de catálogo y sus etiquetas para las pestañas de la pantalla de Catálogos.
 *
 * @author Roger Rojas Effio - roger.rojas@rmsolutions.pe
 */
import type { components } from '@/api/schema'

export type CatalogOption = Required<components['schemas']['CatalogResponse']>
export type CatalogType = CatalogOption['type']

export const catalogTabs: { type: CatalogType; label: string }[] = [
  { type: 'ACTION', label: 'Acción' },
  { type: 'STATUS', label: 'Estado' },
  { type: 'EVENT_FAILURE', label: 'Evento / falla' },
  { type: 'PERSONNEL', label: 'Personal' },
  { type: 'SUPERVISOR', label: 'Responsable' },
]
