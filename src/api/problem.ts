/**
 * Tipo de error de la API (RFC 9457) y helpers para leerlo.
 *
 * @author Roger Rojas Effio - roger.rojas@rmsolutions.pe
 */

export interface ProblemFieldError {
  field: string
  message: string
}

export interface ProblemDetail {
  type?: string
  title?: string
  status?: number
  detail?: string
  instance?: string
  errors?: ProblemFieldError[]
}

export function isProblemDetail(value: unknown): value is ProblemDetail {
  return typeof value === 'object' && value !== null && 'status' in value
}

/** Mensaje legible para mostrar en un toast o aviso general. */
export function getProblemMessage(problem: ProblemDetail | undefined): string {
  return problem?.detail ?? 'No se pudo conectar con el servidor'
}
