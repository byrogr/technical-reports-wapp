/**
 * Fila editable de una opción de catálogo: valor, pill activa/inactiva,
 * switch para activar/desactivar y edición inline del valor.
 *
 * @author Roger Rojas Effio - roger.rojas@rmsolutions.pe
 */
import { Check, Pencil, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { ApiProblemError, getProblemMessage } from '@/api/problem'
import { FieldError } from '@/components/FieldError'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'

import type { CatalogOption } from './catalogTypes'

interface CatalogRowProps {
  option: CatalogOption
  onUpdate: (input: { id: number; value: string; active: boolean }) => Promise<unknown>
}

export function CatalogRow({ option, onUpdate }: CatalogRowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(option.value)
  const [error, setError] = useState<string | undefined>(undefined)
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveValue = async () => {
    const trimmed = value.trim()
    if (!trimmed) {
      setError('El valor es obligatorio')
      return
    }

    setIsSaving(true)
    setError(undefined)
    try {
      await onUpdate({ id: option.id, value: trimmed, active: option.active })
      setIsEditing(false)
    } catch (err) {
      setError(
        err instanceof ApiProblemError ? getProblemMessage(err.problem) : 'No se pudo guardar',
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setValue(option.value)
    setError(undefined)
    setIsEditing(false)
  }

  const handleToggleActive = async (checked: boolean) => {
    try {
      await onUpdate({ id: option.id, value: option.value, active: checked })
    } catch (err) {
      toast.error(
        err instanceof ApiProblemError ? getProblemMessage(err.problem) : 'No se pudo actualizar',
      )
    }
  }

  return (
    <div className="flex items-center gap-3 border-b border-border py-3 last:border-0">
      <div className="flex-1">
        {isEditing ? (
          <div className="flex flex-col gap-1">
            <Input
              value={value}
              onChange={(event) => setValue(event.target.value)}
              maxLength={150}
              autoFocus
              disabled={isSaving}
              aria-invalid={error ? true : undefined}
            />
            <FieldError message={error} />
          </div>
        ) : (
          <span className="text-sm text-foreground">{option.value}</span>
        )}
      </div>

      <Badge variant={option.active ? 'default' : 'secondary'}>
        {option.active ? 'Activa' : 'Inactiva'}
      </Badge>

      <Switch
        checked={option.active}
        onCheckedChange={handleToggleActive}
        aria-label={option.active ? 'Desactivar' : 'Activar'}
      />

      {isEditing ? (
        <div className="flex items-center gap-1">
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={handleSaveValue}
            disabled={isSaving}
            aria-label="Guardar valor"
          >
            <Check />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={handleCancel}
            disabled={isSaving}
            aria-label="Cancelar edición"
          >
            <X />
          </Button>
        </div>
      ) : (
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={() => setIsEditing(true)}
          aria-label="Editar valor"
        >
          <Pencil />
        </Button>
      )}
    </div>
  )
}
