/**
 * Diálogo de alta/edición de un equipo de un cliente.
 *
 * @author Roger Rojas Effio - roger.rojas@rmsolutions.pe
 */
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { ApiProblemError, getProblemMessage } from '@/api/problem'
import { FieldError } from '@/components/FieldError'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import {
  equipmentFormDefaults,
  equipmentSchema,
  toEquipmentRequest,
  type EquipmentFormValues,
} from './equipmentSchema'
import type { Equipment } from './useEquipment'
import { useCreateEquipment } from './useCreateEquipment'
import { useUpdateEquipment } from './useUpdateEquipment'

interface EquipmentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientId: number
  equipment?: Equipment
}

export function EquipmentFormDialog({
  open,
  onOpenChange,
  clientId,
  equipment: editingEquipment,
}: EquipmentFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingEquipment ? 'Editar equipo' : 'Nuevo equipo'}</DialogTitle>
        </DialogHeader>
        {/* Se monta solo mientras el diálogo está abierto: useForm arranca siempre con
            los valores correctos del equipo, sin necesidad de sincronizar por efecto. */}
        {open && (
          <EquipmentForm
            clientId={clientId}
            editingEquipment={editingEquipment}
            onOpenChange={onOpenChange}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function EquipmentForm({
  clientId,
  editingEquipment,
  onOpenChange,
}: {
  clientId: number
  editingEquipment?: Equipment
  onOpenChange: (open: boolean) => void
}) {
  const isEditing = Boolean(editingEquipment)
  const createEquipment = useCreateEquipment()
  const updateEquipment = useUpdateEquipment()
  const [generalError, setGeneralError] = useState<string | undefined>(undefined)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: editingEquipment
      ? {
          model: editingEquipment.model,
          serialNumber: editingEquipment.serialNumber ?? '',
        }
      : equipmentFormDefaults,
  })

  const onSubmit = async (values: EquipmentFormValues) => {
    setGeneralError(undefined)
    const body = toEquipmentRequest(values)

    try {
      if (isEditing && editingEquipment) {
        await updateEquipment.mutateAsync({ id: editingEquipment.id, clientId, body })
        toast.success(`Equipo "${values.model}" actualizado`)
      } else {
        await createEquipment.mutateAsync({ clientId, body })
        toast.success(`Equipo "${values.model}" creado`)
      }
      onOpenChange(false)
    } catch (err) {
      if (err instanceof ApiProblemError) {
        let hasFieldError = false
        for (const fieldError of err.problem.errors ?? []) {
          if (fieldError.field === 'model' || fieldError.field === 'serialNumber') {
            setError(fieldError.field, { message: fieldError.message })
            hasFieldError = true
          }
        }
        if (!hasFieldError) {
          setGeneralError(getProblemMessage(err.problem))
        }
      } else {
        setGeneralError('No se pudo guardar el equipo')
      }
    }
  }

  const isPending = isSubmitting || createEquipment.isPending || updateEquipment.isPending

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="equipment-model">Modelo</Label>
        <Input
          id="equipment-model"
          aria-invalid={errors.model ? true : undefined}
          {...register('model')}
        />
        <FieldError message={errors.model?.message} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="equipment-serial">N° de serie</Label>
        <Input
          id="equipment-serial"
          aria-invalid={errors.serialNumber ? true : undefined}
          {...register('serialNumber')}
        />
        <FieldError message={errors.serialNumber?.message} />
      </div>

      <FieldError message={generalError} />

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancelar
          </Button>
        </DialogClose>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Guardando…' : 'Guardar'}
        </Button>
      </DialogFooter>
    </form>
  )
}
