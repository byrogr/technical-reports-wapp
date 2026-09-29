/**
 * Badge de estado final de un informe. El color se asigna por el texto del
 * valor (normalizado); cualquier valor fuera de Operativo/Inoperativo/En Obs.
 * usa el estilo gris por defecto.
 *
 * @author Roger Rojas Effio - roger.rojas@rmsolutions.pe
 */
import { cn } from '@/lib/utils'

type StatusVariant = 'operational' | 'inoperative' | 'observation' | 'neutral'

const VARIANT_CLASSES: Record<StatusVariant, string> = {
  operational: 'bg-status-operational text-status-operational-foreground',
  inoperative: 'bg-status-inoperative text-status-inoperative-foreground',
  observation: 'bg-status-observation text-status-observation-foreground',
  neutral: 'bg-status-neutral text-status-neutral-foreground',
}

const DOT_CLASSES: Record<StatusVariant, string> = {
  operational: 'bg-status-operational-dot',
  inoperative: 'bg-status-inoperative-dot',
  observation: 'bg-status-observation-dot',
  neutral: 'bg-status-neutral-dot',
}

function normalize(value: string): string {
  return value.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function getStatusVariant(value: string): StatusVariant {
  const normalized = normalize(value)
  if (normalized === 'operativo') return 'operational'
  if (normalized === 'inoperativo') return 'inoperative'
  if (normalized.startsWith('en obs')) return 'observation'
  return 'neutral'
}

export function StatusBadge({ value }: { value: string }) {
  const variant = getStatusVariant(value)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        VARIANT_CLASSES[variant],
      )}
    >
      <span className={cn('size-1.5 shrink-0 rounded-full', DOT_CLASSES[variant])} />
      {value}
    </span>
  )
}
