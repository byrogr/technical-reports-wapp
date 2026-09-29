import { describe, expect, it } from 'vitest'

import { reportFormDefaults, reportSchema } from './reportSchema'

const valid = {
  ...reportFormDefaults,
  equipmentId: 1,
  eventFailureId: 1,
  actionId: 1,
  details: 'Se reemplazó el filtro de aceite',
  startDatetime: '2026-03-02T08:00',
  endDatetime: '2026-03-02T10:00',
  initialStatusId: 1,
  finalStatusId: 2,
  personnelId: 1,
  supervisorId: 1,
}

describe('reportSchema', () => {
  it('acepta un informe con todos los campos obligatorios', () => {
    expect(reportSchema.safeParse(valid).success).toBe(true)
  })

  it('rechaza cuando no se seleccionó un catálogo (id 0)', () => {
    const result = reportSchema.safeParse({ ...valid, actionId: 0 })
    expect(result.success).toBe(false)
  })

  it('rechaza cuando el detalle está vacío', () => {
    const result = reportSchema.safeParse({ ...valid, details: '   ' })
    expect(result.success).toBe(false)
  })

  it('rechaza cuando el término es anterior al inicio', () => {
    const result = reportSchema.safeParse({
      ...valid,
      startDatetime: '2026-03-02T10:00',
      endDatetime: '2026-03-02T08:00',
    })
    expect(result.success).toBe(false)
  })

  it('acepta inicio y término iguales', () => {
    const result = reportSchema.safeParse({
      ...valid,
      startDatetime: '2026-03-02T08:00',
      endDatetime: '2026-03-02T08:00',
    })
    expect(result.success).toBe(true)
  })
})
