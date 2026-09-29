/**
 * Validación del formulario de informe. El cliente no forma parte del body:
 * en la UI solo filtra la lista de equipos (ver ReportForm).
 *
 * @author Roger Rojas Effio - roger.rojas@rmsolutions.pe
 */
import { z } from 'zod'

import type { components } from '@/api/schema'
import { toApiDatetime } from '@/lib/format'

function positiveId(message: string) {
  return z.number().min(1, message)
}

export const reportSchema = z
  .object({
    equipmentId: positiveId('Selecciona un equipo'),
    affectedComponent: z.string().trim().max(255, 'Máximo 255 caracteres'),
    eventFailureId: positiveId('Selecciona un evento/falla'),
    actionId: positiveId('Selecciona una acción'),
    details: z.string().trim().min(1, 'El detalle es obligatorio'),
    startDatetime: z.string().min(1, 'La fecha de inicio es obligatoria'),
    endDatetime: z.string().min(1, 'La fecha de término es obligatoria'),
    initialStatusId: positiveId('Selecciona el estado inicial'),
    finalStatusId: positiveId('Selecciona el estado final'),
    personnelId: positiveId('Selecciona el personal técnico'),
    supervisorId: positiveId('Selecciona el responsable'),
  })
  .refine((data) => data.startDatetime <= data.endDatetime, {
    message: 'La fecha de término debe ser posterior o igual al inicio',
    path: ['endDatetime'],
  })

export type ReportFormValues = z.infer<typeof reportSchema>

export const reportFormDefaults: ReportFormValues = {
  equipmentId: 0,
  affectedComponent: '',
  eventFailureId: 0,
  actionId: 0,
  details: '',
  startDatetime: '',
  endDatetime: '',
  initialStatusId: 0,
  finalStatusId: 0,
  personnelId: 0,
  supervisorId: 0,
}

export function toReportRequest(
  values: ReportFormValues,
): components['schemas']['TechnicalReportRequest'] {
  return {
    equipmentId: values.equipmentId,
    affectedComponent: values.affectedComponent === '' ? undefined : values.affectedComponent,
    eventFailureId: values.eventFailureId,
    actionId: values.actionId,
    details: values.details,
    startDatetime: toApiDatetime(values.startDatetime),
    endDatetime: toApiDatetime(values.endDatetime),
    initialStatusId: values.initialStatusId,
    finalStatusId: values.finalStatusId,
    personnelId: values.personnelId,
    supervisorId: values.supervisorId,
  }
}
