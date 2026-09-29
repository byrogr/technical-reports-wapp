import { describe, expect, it } from 'vitest'

import { clientSchema } from './clientSchema'

const base = {
  name: 'Minera Los Andes',
  documentType: '' as const,
  documentNumber: '',
  contactEmail: '',
}

describe('clientSchema', () => {
  it('acepta un cliente sin documento ni correo', () => {
    expect(clientSchema.safeParse(base).success).toBe(true)
  })

  it('acepta un RUC de 11 dígitos', () => {
    const result = clientSchema.safeParse({
      ...base,
      documentType: 'RUC',
      documentNumber: '20123456789',
    })
    expect(result.success).toBe(true)
  })

  it('acepta un DNI de 8 dígitos', () => {
    const result = clientSchema.safeParse({
      ...base,
      documentType: 'DNI',
      documentNumber: '12345678',
    })
    expect(result.success).toBe(true)
  })

  it('rechaza un RUC que no tiene 11 dígitos', () => {
    const result = clientSchema.safeParse({ ...base, documentType: 'RUC', documentNumber: '123' })
    expect(result.success).toBe(false)
  })

  it('rechaza un DNI que no tiene 8 dígitos', () => {
    const result = clientSchema.safeParse({ ...base, documentType: 'DNI', documentNumber: '123' })
    expect(result.success).toBe(false)
  })

  it('rechaza tipo de documento sin número', () => {
    const result = clientSchema.safeParse({ ...base, documentType: 'RUC', documentNumber: '' })
    expect(result.success).toBe(false)
  })

  it('rechaza número de documento sin tipo', () => {
    const result = clientSchema.safeParse({ ...base, documentType: '', documentNumber: '12345678' })
    expect(result.success).toBe(false)
  })

  it('rechaza un correo de contacto inválido', () => {
    const result = clientSchema.safeParse({ ...base, contactEmail: 'no-es-un-correo' })
    expect(result.success).toBe(false)
  })

  it('acepta un correo de contacto válido', () => {
    const result = clientSchema.safeParse({ ...base, contactEmail: 'contacto@cliente.pe' })
    expect(result.success).toBe(true)
  })

  it('rechaza un nombre vacío', () => {
    const result = clientSchema.safeParse({ ...base, name: '  ' })
    expect(result.success).toBe(false)
  })
})
