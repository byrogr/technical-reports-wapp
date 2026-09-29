/**
 * Validación del formulario de cliente: documentType/documentNumber van juntos o
 * ninguno; RUC = 11 dígitos, DNI = 8.
 *
 * @author Roger Rojas Effio - roger.rojas@rmsolutions.pe
 */
import { z } from 'zod'

import type { components } from '@/api/schema'

export const clientSchema = z
  .object({
    name: z.string().trim().min(1, 'El nombre es obligatorio').max(200, 'Máximo 200 caracteres'),
    documentType: z.union([z.literal('RUC'), z.literal('DNI'), z.literal('')]),
    documentNumber: z.string().trim(),
    contactEmail: z.union([z.literal(''), z.email('Correo inválido')]),
  })
  .superRefine((data, ctx) => {
    const hasType = data.documentType !== ''
    const hasNumber = data.documentNumber !== ''

    if (hasType !== hasNumber) {
      ctx.addIssue({
        code: 'custom',
        path: ['documentNumber'],
        message: 'Completa tipo y número de documento, o deja ambos vacíos',
      })
      return
    }

    if (hasType && hasNumber) {
      const expectedLength = data.documentType === 'RUC' ? 11 : 8
      if (!/^\d+$/.test(data.documentNumber) || data.documentNumber.length !== expectedLength) {
        ctx.addIssue({
          code: 'custom',
          path: ['documentNumber'],
          message:
            data.documentType === 'RUC'
              ? 'El RUC debe tener 11 dígitos'
              : 'El DNI debe tener 8 dígitos',
        })
      }
    }
  })

export type ClientFormValues = z.infer<typeof clientSchema>

export const clientFormDefaults: ClientFormValues = {
  name: '',
  documentType: '',
  documentNumber: '',
  contactEmail: '',
}

/** Convierte los valores del formulario al body que espera la API (vacíos -> undefined). */
export function toClientRequest(values: ClientFormValues): components['schemas']['ClientRequest'] {
  return {
    name: values.name,
    documentType: values.documentType === '' ? undefined : values.documentType,
    documentNumber: values.documentNumber === '' ? undefined : values.documentNumber,
    contactEmail: values.contactEmail === '' ? undefined : values.contactEmail,
  }
}
