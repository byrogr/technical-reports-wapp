import { describe, expect, it } from 'vitest'

import { getProblemMessage, isProblemDetail } from './problem'

describe('isProblemDetail', () => {
  it('reconoce un objeto con status como ProblemDetail', () => {
    expect(isProblemDetail({ status: 400, detail: 'Solicitud inválida' })).toBe(true)
  })

  it('rechaza valores que no son ProblemDetail', () => {
    expect(isProblemDetail(null)).toBe(false)
    expect(isProblemDetail(undefined)).toBe(false)
    expect(isProblemDetail('error')).toBe(false)
    expect(isProblemDetail({ message: 'sin status' })).toBe(false)
  })
})

describe('getProblemMessage', () => {
  it('devuelve el detail cuando está presente', () => {
    expect(getProblemMessage({ status: 409, detail: 'El cliente tiene equipos' })).toBe(
      'El cliente tiene equipos',
    )
  })

  it('devuelve un mensaje genérico cuando no hay problem ni detail', () => {
    expect(getProblemMessage(undefined)).toBe('No se pudo conectar con el servidor')
    expect(getProblemMessage({ status: 500 })).toBe('No se pudo conectar con el servidor')
  })
})
