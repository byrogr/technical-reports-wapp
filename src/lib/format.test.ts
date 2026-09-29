import { describe, expect, it } from 'vitest'

import { formatDate, formatDateTime, toApiDatetime, toDatetimeLocalValue } from './format'

describe('formatDateTime', () => {
  it('formatea una fecha-hora ISO sin zona horaria como dd/MM/yyyy HH:mm', () => {
    expect(formatDateTime('2026-03-02T18:05:00')).toBe('02/03/2026 18:05')
  })
})

describe('formatDate', () => {
  it('formatea una fecha-hora ISO sin zona horaria como dd/MM/yyyy', () => {
    expect(formatDate('2026-03-02T18:05:00')).toBe('02/03/2026')
  })
})

describe('toApiDatetime', () => {
  it('agrega los segundos al valor de un input datetime-local', () => {
    expect(toApiDatetime('2026-03-02T18:00')).toBe('2026-03-02T18:00:00')
  })
})

describe('toDatetimeLocalValue', () => {
  it('recorta los segundos de una fecha-hora de la API', () => {
    expect(toDatetimeLocalValue('2026-03-02T18:00:00')).toBe('2026-03-02T18:00')
  })

  it('es la inversa de toApiDatetime', () => {
    const inputValue = '2026-03-02T18:00'
    expect(toDatetimeLocalValue(toApiDatetime(inputValue))).toBe(inputValue)
  })
})
