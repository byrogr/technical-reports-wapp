/**
 * Columna derecha del maestro-detalle: datos del cliente y sus equipos.
 *
 * @author Roger Rojas Effio - roger.rojas@rmsolutions.pe
 */
import { FileText, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { ApiProblemError, getProblemMessage } from '@/api/problem'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { ClientFormDialog } from './ClientFormDialog'
import { EquipmentFormDialog } from './EquipmentFormDialog'
import type { Client } from './useClients'
import { useDeleteClient } from './useDeleteClient'
import { useDeleteEquipment } from './useDeleteEquipment'
import { useEquipment, type Equipment } from './useEquipment'

export function ClientDetail({ client }: { client: Client }) {
  const { data: equipment, isPending, isError } = useEquipment(client.id)
  const deleteClient = useDeleteClient()
  const deleteEquipment = useDeleteEquipment()
  const navigate = useNavigate()

  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false)
  const [isDeleteClientOpen, setIsDeleteClientOpen] = useState(false)
  const [equipmentDialogState, setEquipmentDialogState] = useState<{
    open: boolean
    equipment?: Equipment
  }>({ open: false })
  const [deletingEquipment, setDeletingEquipment] = useState<Equipment | undefined>(undefined)

  const handleDeleteClient = async () => {
    try {
      await deleteClient.mutateAsync(client.id)
      toast.success(`Cliente "${client.name}" eliminado`)
      setIsDeleteClientOpen(false)
      navigate('/clients', { replace: true })
    } catch (err) {
      toast.error(
        err instanceof ApiProblemError
          ? getProblemMessage(err.problem)
          : 'No se pudo eliminar el cliente',
      )
    }
  }

  const handleDeleteEquipment = async () => {
    if (!deletingEquipment) return
    try {
      await deleteEquipment.mutateAsync({ id: deletingEquipment.id, clientId: client.id })
      toast.success(`Equipo "${deletingEquipment.model}" eliminado`)
      setDeletingEquipment(undefined)
    } catch (err) {
      toast.error(
        err instanceof ApiProblemError
          ? getProblemMessage(err.problem)
          : 'No se pudo eliminar el equipo',
      )
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">{client.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {client.documentType && client.documentNumber
              ? `${client.documentType} ${client.documentNumber}`
              : 'Sin documento registrado'}
            {' · '}
            {client.contactEmail || 'Sin correo registrado'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsClientDialogOpen(true)}>
            <Pencil />
            Editar
          </Button>
          <Button variant="destructive" onClick={() => setIsDeleteClientOpen(true)}>
            <Trash2 />
            Eliminar
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Equipos</h3>
          <Button size="sm" onClick={() => setEquipmentDialogState({ open: true })}>
            <Plus />
            Agregar equipo
          </Button>
        </div>

        {isPending ? (
          <Skeleton className="h-32 w-full" />
        ) : isError ? (
          <p className="text-sm text-destructive">No se pudieron cargar los equipos.</p>
        ) : equipment.length === 0 ? (
          <EmptyState
            title="Sin equipos registrados"
            description="Agrega el primer equipo de este cliente."
          />
        ) : (
          <div className="rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Modelo</TableHead>
                  <TableHead>N° de serie</TableHead>
                  <TableHead className="w-0">
                    <span className="sr-only">Acciones</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {equipment.map((eq) => (
                  <TableRow key={eq.id}>
                    <TableCell className="font-medium text-foreground">{eq.model}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {eq.serialNumber || '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button size="icon-sm" variant="ghost" asChild aria-label="Ver informes">
                          <Link to={`/reports?clientId=${client.id}&equipmentId=${eq.id}`}>
                            <FileText />
                          </Link>
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => setEquipmentDialogState({ open: true, equipment: eq })}
                          aria-label="Editar equipo"
                        >
                          <Pencil />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => setDeletingEquipment(eq)}
                          aria-label="Eliminar equipo"
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <ClientFormDialog
        open={isClientDialogOpen}
        onOpenChange={setIsClientDialogOpen}
        client={client}
      />

      <EquipmentFormDialog
        open={equipmentDialogState.open}
        onOpenChange={(open) => setEquipmentDialogState((state) => ({ ...state, open }))}
        clientId={client.id}
        equipment={equipmentDialogState.equipment}
      />

      <ConfirmDialog
        open={isDeleteClientOpen}
        onOpenChange={setIsDeleteClientOpen}
        title="Eliminar cliente"
        description={`¿Eliminar a "${client.name}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDeleteClient}
        isLoading={deleteClient.isPending}
      />

      <ConfirmDialog
        open={Boolean(deletingEquipment)}
        onOpenChange={(open) => {
          if (!open) setDeletingEquipment(undefined)
        }}
        title="Eliminar equipo"
        description={`¿Eliminar el equipo "${deletingEquipment?.model}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDeleteEquipment}
        isLoading={deleteEquipment.isPending}
      />
    </div>
  )
}
