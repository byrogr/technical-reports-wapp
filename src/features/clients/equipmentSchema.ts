/**
 * Validación del formulario de equipo.
 *
 * @author Roger Rojas Effio - roger.rojas@rmsolutions.pe
 */
import { z } from 'zod'

import type { components } from '@/api/schema'

export const equipmentSchema = z.object({
  model: z.string().trim().min(1, 'El modelo es obligatorio').max(100, 'Máximo 100 caracteres'),
  serialNumber: z.string().trim().max(255, 'Máximo 255 caracteres'),
})

export type EquipmentFormValues = z.infer<typeof equipmentSchema>

export const equipmentFormDefaults: EquipmentFormValues = {
  model: '',
  serialNumber: '',
}

export function toEquipmentRequest(
  values: EquipmentFormValues,
): components['schemas']['EquipmentRequest'] {
  return {
    model: values.model,
    serialNumber: values.serialNumber === '' ? undefined : values.serialNumber,
  }
}
