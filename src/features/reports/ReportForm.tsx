/**
 * Formulario de creación y edición de un informe técnico.
 *
 * @author Roger Rojas Effio - roger.rojas@rmsolutions.pe
 */
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { ApiProblemError, getProblemMessage } from '@/api/problem'
import { FieldError } from '@/components/FieldError'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useClients } from '@/features/clients/useClients'
import { useEquipment } from '@/features/clients/useEquipment'
import { toDatetimeLocalValue } from '@/lib/format'

import { CatalogSelect } from './CatalogSelect'
import {
  reportFormDefaults,
  reportSchema,
  toReportRequest,
  type ReportFormValues,
} from './reportSchema'
import { useCreateReport } from './useCreateReport'
import type { Report } from './useReport'
import { useUpdateReport } from './useUpdateReport'

const REPORT_FIELDS = [
  'equipmentId',
  'affectedComponent',
  'eventFailureId',
  'actionId',
  'details',
  'startDatetime',
  'endDatetime',
  'initialStatusId',
  'finalStatusId',
  'personnelId',
  'supervisorId',
] as const

function isReportField(field: string): field is (typeof REPORT_FIELDS)[number] {
  return (REPORT_FIELDS as readonly string[]).includes(field)
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl bg-card p-5 shadow-sm ring-1 ring-black/5">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </div>
  )
}

export function ReportForm({ report }: { report?: Report }) {
  const isEditing = Boolean(report)
  const navigate = useNavigate()
  const createReport = useCreateReport()
  const updateReport = useUpdateReport()
  const [generalError, setGeneralError] = useState<string | undefined>(undefined)
  const [selectedClientId, setSelectedClientId] = useState<number | undefined>(
    report?.clientId ?? undefined,
  )

  const { data: clients } = useClients()
  const { data: equipmentOptions } = useEquipment(selectedClientId)

  const {
    register,
    control,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: report
      ? {
          equipmentId: report.equipmentId ?? 0,
          affectedComponent: report.affectedComponent ?? '',
          eventFailureId: report.eventFailure?.id ?? 0,
          actionId: report.action?.id ?? 0,
          details: report.details ?? '',
          startDatetime: report.startDatetime ? toDatetimeLocalValue(report.startDatetime) : '',
          endDatetime: report.endDatetime ? toDatetimeLocalValue(report.endDatetime) : '',
          initialStatusId: report.initialStatus?.id ?? 0,
          finalStatusId: report.finalStatus?.id ?? 0,
          personnelId: report.personnel?.id ?? 0,
          supervisorId: report.supervisor?.id ?? 0,
        }
      : reportFormDefaults,
  })

  const watchedEquipmentId = watch('equipmentId')
  const selectedEquipment = (equipmentOptions ?? []).find((eq) => eq.id === watchedEquipmentId)
  const isSameEquipmentAsReport = report?.equipmentId === watchedEquipmentId
  const equipmentModel =
    selectedEquipment?.model ?? (isSameEquipmentAsReport ? report?.equipmentModel : undefined)
  const equipmentSerialNumber =
    selectedEquipment?.serialNumber ??
    (isSameEquipmentAsReport ? report?.equipmentSerialNumber : undefined)

  const handleClientChange = (value: string) => {
    setSelectedClientId(value === 'UNSELECTED' ? undefined : Number(value))
    setValue('equipmentId', 0)
  }

  const goBack = () => navigate(report ? `/reports/${report.id}` : '/reports')

  const onSubmit = async (values: ReportFormValues) => {
    setGeneralError(undefined)
    const body = toReportRequest(values)

    try {
      if (isEditing && report?.id != null) {
        await updateReport.mutateAsync({ id: report.id, body })
        toast.success(`Informe ${report.reportNumber} actualizado`)
        navigate(`/reports/${report.id}`)
      } else {
        const created = await createReport.mutateAsync(body)
        toast.success(`Informe ${created.reportNumber ?? ''} creado`)
        navigate(`/reports/${created.id}`)
      }
    } catch (err) {
      if (err instanceof ApiProblemError) {
        let hasFieldError = false
        for (const fieldError of err.problem.errors ?? []) {
          if (isReportField(fieldError.field)) {
            setError(fieldError.field, { message: fieldError.message })
            hasFieldError = true
          }
        }
        if (!hasFieldError) {
          setGeneralError(getProblemMessage(err.problem))
        }
      } else {
        setGeneralError('No se pudo guardar el informe')
      }
    }
  }

  const isPending = isSubmitting || createReport.isPending || updateReport.isPending

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)} noValidate>
      {report && (
        <p className="text-sm text-muted-foreground">
          Informe N° <span className="font-mono text-foreground">{report.reportNumber}</span>
        </p>
      )}

      <Section title="Equipo">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="report-client">Cliente</Label>
            <Select
              value={selectedClientId ? String(selectedClientId) : 'UNSELECTED'}
              onValueChange={handleClientChange}
            >
              <SelectTrigger id="report-client" className="w-full">
                <SelectValue placeholder="Selecciona un cliente" />
              </SelectTrigger>
              <SelectContent>
                {(clients ?? []).map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="report-equipment">Equipo</Label>
            <Controller
              control={control}
              name="equipmentId"
              render={({ field }) => (
                <Select
                  value={field.value ? String(field.value) : 'UNSELECTED'}
                  onValueChange={(value) => field.onChange(Number(value))}
                  disabled={!selectedClientId}
                >
                  <SelectTrigger id="report-equipment" className="w-full">
                    <SelectValue
                      placeholder={
                        selectedClientId ? 'Selecciona un equipo' : 'Elige un cliente primero'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {(equipmentOptions ?? []).map((eq) => (
                      <SelectItem key={eq.id} value={String(eq.id)}>
                        {eq.model}
                        {eq.serialNumber ? ` · ${eq.serialNumber}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError message={errors.equipmentId?.message} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="report-equipment-model">Modelo</Label>
            <Input id="report-equipment-model" value={equipmentModel ?? ''} readOnly disabled />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="report-equipment-serial">N° de serie</Label>
            <Input
              id="report-equipment-serial"
              value={equipmentSerialNumber ?? ''}
              readOnly
              disabled
            />
          </div>
        </div>
      </Section>

      <Section title="Intervención">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="report-event-failure">Evento / falla</Label>
            <Controller
              control={control}
              name="eventFailureId"
              render={({ field }) => (
                <CatalogSelect
                  id="report-event-failure"
                  type="EVENT_FAILURE"
                  value={field.value}
                  onChange={field.onChange}
                  currentOption={
                    report?.eventFailure?.id != null && report.eventFailure.value != null
                      ? {
                          id: report.eventFailure.id,
                          value: report.eventFailure.value,
                          active: report.eventFailure.active ?? true,
                        }
                      : undefined
                  }
                />
              )}
            />
            <FieldError message={errors.eventFailureId?.message} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="report-action">Acción</Label>
            <Controller
              control={control}
              name="actionId"
              render={({ field }) => (
                <CatalogSelect
                  id="report-action"
                  type="ACTION"
                  value={field.value}
                  onChange={field.onChange}
                  currentOption={
                    report?.action?.id != null && report.action.value != null
                      ? {
                          id: report.action.id,
                          value: report.action.value,
                          active: report.action.active ?? true,
                        }
                      : undefined
                  }
                />
              )}
            />
            <FieldError message={errors.actionId?.message} />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="report-affected-component">Componente afectado</Label>
          <Input
            id="report-affected-component"
            maxLength={255}
            aria-invalid={errors.affectedComponent ? true : undefined}
            {...register('affectedComponent')}
          />
          <FieldError message={errors.affectedComponent?.message} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="report-details">Detalle</Label>
          <Textarea
            id="report-details"
            rows={4}
            aria-invalid={errors.details ? true : undefined}
            {...register('details')}
          />
          <FieldError message={errors.details?.message} />
        </div>
      </Section>

      <div className="grid grid-cols-2 gap-6">
        <Section title="Periodo">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="report-start">Inicio</Label>
              <Input
                id="report-start"
                type="datetime-local"
                aria-invalid={errors.startDatetime ? true : undefined}
                {...register('startDatetime')}
              />
              <FieldError message={errors.startDatetime?.message} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="report-end">Término</Label>
              <Input
                id="report-end"
                type="datetime-local"
                aria-invalid={errors.endDatetime ? true : undefined}
                {...register('endDatetime')}
              />
              <FieldError message={errors.endDatetime?.message} />
            </div>
          </div>
        </Section>

        <Section title="Estado del equipo">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="report-initial-status">Estado inicial</Label>
              <Controller
                control={control}
                name="initialStatusId"
                render={({ field }) => (
                  <CatalogSelect
                    id="report-initial-status"
                    type="STATUS"
                    value={field.value}
                    onChange={field.onChange}
                    currentOption={
                      report?.initialStatus?.id != null && report.initialStatus.value != null
                        ? {
                            id: report.initialStatus.id,
                            value: report.initialStatus.value,
                            active: report.initialStatus.active ?? true,
                          }
                        : undefined
                    }
                  />
                )}
              />
              <FieldError message={errors.initialStatusId?.message} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="report-final-status">Estado final</Label>
              <Controller
                control={control}
                name="finalStatusId"
                render={({ field }) => (
                  <CatalogSelect
                    id="report-final-status"
                    type="STATUS"
                    value={field.value}
                    onChange={field.onChange}
                    currentOption={
                      report?.finalStatus?.id != null && report.finalStatus.value != null
                        ? {
                            id: report.finalStatus.id,
                            value: report.finalStatus.value,
                            active: report.finalStatus.active ?? true,
                          }
                        : undefined
                    }
                  />
                )}
              />
              <FieldError message={errors.finalStatusId?.message} />
            </div>
          </div>
        </Section>
      </div>

      <Section title="Firmas">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="report-personnel">Personal técnico</Label>
            <Controller
              control={control}
              name="personnelId"
              render={({ field }) => (
                <CatalogSelect
                  id="report-personnel"
                  type="PERSONNEL"
                  value={field.value}
                  onChange={field.onChange}
                  currentOption={
                    report?.personnel?.id != null && report.personnel.value != null
                      ? {
                          id: report.personnel.id,
                          value: report.personnel.value,
                          active: report.personnel.active ?? true,
                        }
                      : undefined
                  }
                />
              )}
            />
            <FieldError message={errors.personnelId?.message} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="report-supervisor">Responsable</Label>
            <Controller
              control={control}
              name="supervisorId"
              render={({ field }) => (
                <CatalogSelect
                  id="report-supervisor"
                  type="SUPERVISOR"
                  value={field.value}
                  onChange={field.onChange}
                  currentOption={
                    report?.supervisor?.id != null && report.supervisor.value != null
                      ? {
                          id: report.supervisor.id,
                          value: report.supervisor.value,
                          active: report.supervisor.active ?? true,
                        }
                      : undefined
                  }
                />
              )}
            />
            <FieldError message={errors.supervisorId?.message} />
          </div>
        </div>
      </Section>

      <FieldError message={generalError} />

      <div className="sticky bottom-0 -mx-10 flex justify-end gap-2 border-t border-border bg-background px-10 py-4">
        <Button type="button" variant="outline" onClick={goBack}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Guardando…' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}
