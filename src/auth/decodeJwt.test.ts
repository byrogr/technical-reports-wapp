import { describe, expect, it } from 'vitest'

import { getJwtSubject } from './decodeJwt'

function fakeJwt(payload: Record<string, unknown>): string {
  const base64url = (input: string) =>
    btoa(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = base64url(JSON.stringify(payload))
  return `${header}.${body}.signature`
}

describe('getJwtSubject', () => {
  it('lee el claim sub del payload', () => {
    const token = fakeJwt({ sub: 'usuario@scontrol.pe' })
    expect(getJwtSubject(token)).toBe('usuario@scontrol.pe')
  })

  it('devuelve null si el token no tiene payload', () => {
    expect(getJwtSubject('sin-puntos')).toBeNull()
  })

  it('devuelve null si el payload no es JSON válido', () => {
    expect(getJwtSubject('header.@@@.signature')).toBeNull()
  })
})
