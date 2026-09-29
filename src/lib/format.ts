/**
 * Conversión de fechas entre la API (ISO sin zona horaria, hora de Perú) y la UI.
 * Nunca usar Date.toISOString() aquí: desplaza a UTC y corre el reloj 5 horas.
 *
 * @author Roger Rojas Effio - roger.rojas@rmsolutions.pe
 */
import { format } from 'date-fns'

/** "2026-03-02T18:00:00" -> "02/03/2026 18:00" */
export function formatDateTime(isoDatetime: string): string {
  return format(new Date(isoDatetime), 'dd/MM/yyyy HH:mm')
}

/** "2026-03-02T18:00:00" -> "02/03/2026" */
export function formatDate(isoDatetime: string): string {
  return format(new Date(isoDatetime), 'dd/MM/yyyy')
}

/** Valor de un <input type="datetime-local"> ("2026-03-02T18:00") -> API ("2026-03-02T18:00:00") */
export function toApiDatetime(datetimeLocalValue: string): string {
  return `${datetimeLocalValue}:00`
}

/** API ("2026-03-02T18:00:00") -> valor de <input type="datetime-local"> ("2026-03-02T18:00") */
export function toDatetimeLocalValue(isoDatetime: string): string {
  return isoDatetime.slice(0, 16)
}
