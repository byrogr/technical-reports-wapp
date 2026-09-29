/**
 * Lista de opciones de un tipo de catálogo: alta de una opción nueva y filas editables.
 *
 * @author Roger Rojas Effio - roger.rojas@rmsolutions.pe
 */
import { Plus } from 'lucide-react'
import { useState, type FormEvent } from 'react'

import { ApiProblemError, getProblemMessage } from '@/api/problem'
import { EmptyState } from '@/components/EmptyState'
import { FieldError } from '@/components/FieldError'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

import { CatalogRow } from './CatalogRow'
import type { CatalogType } from './catalogTypes'
import { useCatalogs } from './useCatalogs'
import { useCreateCatalog } from './useCreateCatalog'
import { useUpdateCatalog } from './useUpdateCatalog'

export function CatalogList({ type }: { type: CatalogType }) {
  const { data, isPending, isError } = useCatalogs(type)
  const createCatalog = useCreateCatalog(type)
  const updateCatalog = useUpdateCatalog(type)
  const [newValue, setNewValue] = useState('')
  const [createError, setCreateError] = useState<string | undefined>(undefined)

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault()
    const trimmed = newValue.trim()
    if (!trimmed) {
      setCreateError('El valor es obligatorio')
      return
    }

    setCreateError(undefined)
    try {
      await createCatalog.mutateAsync(trimmed)
      setNewValue('')
    } catch (err) {
      setCreateError(
        err instanceof ApiProblemError
          ? getProblemMessage(err.problem)
          : 'No se pudo crear la opción',
      )
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleCreate} className="flex items-start gap-2">
        <div className="flex-1">
          <Input
            value={newValue}
            onChange={(event) => {
              setNewValue(event.target.value)
              setCreateError(undefined)
            }}
            placeholder="Nueva opción"
            maxLength={150}
            aria-invalid={createError ? true : undefined}
          />
          <FieldError message={createError} />
        </div>
        <Button type="submit" disabled={createCatalog.isPending}>
          <Plus />
          Agregar
        </Button>
      </form>

      <div className="rounded-xl border border-border bg-card">
        {isPending ? (
          <div className="flex flex-col gap-3 p-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : isError ? (
          <p className="p-4 text-sm text-destructive">No se pudieron cargar las opciones.</p>
        ) : data.length === 0 ? (
          <EmptyState
            title="Sin opciones"
            description="Agrega la primera opción de este catálogo con el campo de arriba."
          />
        ) : (
          <div className="px-4">
            {data.map((option) => (
              <CatalogRow
                key={option.id}
                option={option}
                onUpdate={(input) => updateCatalog.mutateAsync(input)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
