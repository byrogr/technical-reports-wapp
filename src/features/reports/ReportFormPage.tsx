/**
 * Página de creación y edición de un informe (/reports/new y /reports/:id/edit).
 *
 * @author Roger Rojas Effio - roger.rojas@rmsolutions.pe
 */
import { useParams } from 'react-router-dom'

import { PageHeader } from '@/components/layout/PageHeader'
import { Skeleton } from '@/components/ui/skeleton'

import { ReportForm } from './ReportForm'
import { isReportNotFound, useReport } from './useReport'

export function ReportFormPage() {
  const { id } = useParams<{ id?: string }>()

  if (!id) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Nuevo informe"
          description="Registra un nuevo informe técnico de mantenimiento."
        />
        <ReportForm />
      </div>
    )
  }

  return <EditReportForm id={Number(id)} />
}

function EditReportForm({ id }: { id: number }) {
  const { data: report, isPending, isError, error } = useReport(id)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={report ? `Editar informe ${report.reportNumber}` : 'Editar informe'}
        description="Actualiza los datos del informe técnico."
      />

      {isPending ? (
        <Skeleton className="h-96 w-full" />
      ) : isError ? (
        <p className="text-sm text-destructive">
          {isReportNotFound(error) ? 'El informe no existe.' : 'No se pudo cargar el informe.'}
        </p>
      ) : (
        <ReportForm report={report} />
      )}
    </div>
  )
}
