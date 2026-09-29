/**
 * Diálogo de alta/edición de un cliente.
 *
 * @author Roger Rojas Effio - roger.rojas@rmsolutions.pe
 */
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import {
  clientFormDefaults,
  clientSchema,
  toClientRequest,
  type ClientFormValues,
} from './clientSchema'
import type { Client } from './useClients'
import { useCreateClient } from './useCreateClient'
import { useUpdateClient } from './useUpdateClient'

interface ClientFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client?: Client
}

export function ClientFormDialog({
  open,
  onOpenChange,
  client: editingClient,
}: ClientFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingClient ? 'Editar cliente' : 'Nuevo cliente'}</DialogTitle>
        </DialogHeader>
        {/* Se monta solo mientras el diálogo está abierto: useForm arranca siempre con
            los valores correctos del cliente, sin necesidad de sincronizar por efecto. */}
        {open && <ClientForm editingClient={editingClient} onOpenChange={onOpenChange} />}
      </DialogContent>
    </Dialog>
  )
}

function ClientForm({
  editingClient,
  onOpenChange,
}: {
  editingClient?: Client
  onOpenChange: (open: boolean) => void
}) {
  const isEditing = Boolean(editingClient)
  const createClient = useCreateClient()
  const updateClient = useUpdateClient()
  const [generalError, setGeneralError] = useState<string | undefined>(undefined)

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: editingClient
      ? {
          name: editingClient.name ?? '',
          documentType: editingClient.documentType ?? '',
          documentNumber: editingClient.documentNumber ?? '',
          contactEmail: editingClient.contactEmail ?? '',
        }
      : clientFormDefaults,
  })

  const onSubmit = async (values: ClientFormValues) => {
    setGeneralError(undefined)
    const body = toClientRequest(values)

    try {
      if (isEditing && editingClient) {
        await updateClient.mutateAsync({ id: editingClient.id, body })
        toast.success(`Cliente "${values.name}" actualizado`)
      } else {
        await createClient.mutateAsync(body)
        toast.success(`Cliente "${values.name}" creado`)
      }
      onOpenChange(false)
    } catch (err) {
      if (err instanceof ApiProblemError) {
        let hasFieldError = false
        for (const fieldError of err.problem.errors ?? []) {
          if (
            fieldError.field === 'name' ||
            fieldError.field === 'documentType' ||
            fieldError.field === 'documentNumber' ||
            fieldError.field === 'contactEmail'
          ) {
            setError(fieldError.field, { message: fieldError.message })
            hasFieldError = true
          }
        }
        if (!hasFieldError) {
          setGeneralError(getProblemMessage(err.problem))
        }
      } else {
        setGeneralError('No se pudo guardar el cliente')
      }
    }
  }

  const isPending = isSubmitting || createClient.isPending || updateClient.isPending

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="client-name">Nombre</Label>
        <Input
          id="client-name"
          aria-invalid={errors.name ? true : undefined}
          {...register('name')}
        />
        <FieldError message={errors.name?.message} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="client-document-type">Tipo de documento</Label>
          <Controller
            control={control}
            name="documentType"
            render={({ field }) => (
              <Select
                value={field.value === '' ? 'NONE' : field.value}
                onValueChange={(value) => field.onChange(value === 'NONE' ? '' : value)}
              >
                <SelectTrigger id="client-document-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">Ninguno</SelectItem>
                  <SelectItem value="RUC">RUC</SelectItem>
                  <SelectItem value="DNI">DNI</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="client-document-number">N° de documento</Label>
          <Input
            id="client-document-number"
            aria-invalid={errors.documentNumber ? true : undefined}
            {...register('documentNumber')}
          />
        </div>
      </div>
      <FieldError message={errors.documentNumber?.message} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="client-email">Correo de contacto</Label>
        <Input
          id="client-email"
          type="email"
          aria-invalid={errors.contactEmail ? true : undefined}
          {...register('contactEmail')}
        />
        <FieldError message={errors.contactEmail?.message} />
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
