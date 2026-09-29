/**
 * Clientes y equipos: vista maestro-detalle. La lista vive en la columna
 * izquierda y el cliente seleccionado (ruta /clients/:id) en la derecha.
 *
 * @author Roger Rojas Effio - roger.rojas@rmsolutions.pe
 */
import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { EmptyState } from '@/components/EmptyState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Skeleton } from '@/components/ui/skeleton'

import { ClientDetail } from './ClientDetail'
import { ClientFormDialog } from './ClientFormDialog'
import { ClientList } from './ClientList'
import { useClients } from './useClients'

export function ClientListPage() {
  const { id } = useParams<{ id?: string }>()
  const { data: clients, isPending, isError } = useClients()
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const selectedId = id ? Number(id) : undefined
  const selectedClient = clients?.find((c) => c.id === selectedId)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Clientes y equipos"
        description="Clientes de la empresa y los equipos registrados para cada uno."
      />

      {isPending ? (
        <Skeleton className="h-64 w-full" />
      ) : isError ? (
        <p className="text-sm text-destructive">No se pudieron cargar los clientes.</p>
      ) : (
        <div className="flex gap-6">
          <ClientList
            clients={clients}
            selectedId={selectedId}
            onCreateClick={() => setIsCreateOpen(true)}
          />

          {selectedClient ? (
            <ClientDetail client={selectedClient} />
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <EmptyState
                title="Selecciona un cliente"
                description="Elige un cliente de la lista para ver su información y equipos."
              />
            </div>
          )}
        </div>
      )}

      <ClientFormDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  )
}
