/**
 * Columna izquierda del maestro-detalle: buscador y lista de clientes.
 *
 * @author Roger Rojas Effio - roger.rojas@rmsolutions.pe
 */
import { Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

import type { Client } from './useClients'

interface ClientListProps {
  clients: Client[]
  selectedId?: number
  onCreateClick: () => void
}

export function ClientList({ clients, selectedId, onCreateClick }: ClientListProps) {
  const [search, setSearch] = useState('')

  const term = search.trim().toLowerCase()
  const filtered = term
    ? clients.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          (c.documentNumber ?? '').toLowerCase().includes(term),
      )
    : clients

  return (
    <div className="flex w-[320px] shrink-0 flex-col gap-3 border-r border-border pr-6">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre o documento"
            className="pl-8"
            aria-label="Buscar clientes"
          />
        </div>
        <Button size="icon" variant="outline" onClick={onCreateClick} aria-label="Nuevo cliente">
          <Plus />
        </Button>
      </div>

      <div className="flex flex-col gap-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <EmptyState
            title="Sin resultados"
            description="No hay clientes que coincidan con la búsqueda."
          />
        ) : (
          filtered.map((c) => (
            <Link
              key={c.id}
              to={`/clients/${c.id}`}
              className={cn(
                'flex flex-col gap-0.5 rounded-lg px-3 py-2 text-sm transition-colors',
                c.id === selectedId
                  ? 'bg-accent font-medium text-primary'
                  : 'text-foreground hover:bg-muted',
              )}
            >
              <span>{c.name}</span>
              {c.documentNumber && (
                <span className="text-xs text-muted-foreground">
                  {c.documentType} {c.documentNumber}
                </span>
              )}
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
