/**
 * Detalle de un informe: cabecera con estado y acciones, tarjetas de equipo,
 * intervención, detalle, firmas y registro.
 *
 * @author Roger Rojas Effio - roger.rojas@rmsolutions.pe
 */
import { Pencil } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDateTime } from '@/lib/format'
import { NotFoundPage } from '@/pages/NotFoundPage'

import { ReportDownloadButton } from './ReportDownloadButton'
import { isReportNotFound, useReport } from './useReport'

export function ReportDetailPage() {
  const { id } = useParams<{ id: string }>()
  const reportId = Number(id)
  const { data: report, isPending, isError, error } = useReport(reportId)

  if (isPending) {
    return <Skeleton className="h-96 w-full" />
  }

  if (isError) {
    if (isReportNotFound(error)) return <NotFoundPage />
    return <p className="text-sm text-destructive">No se pudo cargar el informe.</p>
  }

  const finalStatusValue = report.finalStatus?.value ?? '—'

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-2xl font-semibold text-foreground">
              {report.reportNumber}
            </h1>
            <StatusBadge value={finalStatusValue} />
          </div>
          <p className="text-sm text-muted-foreground">
            {report.clientName} · {report.equipmentModel} · {report.action?.value ?? '—'}
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to={`/reports/${report.id}/edit`}>
              <Pencil />
              Editar
            </Link>
          </Button>
          {report.id != null && (
            <ReportDownloadButton
              id={report.id}
              reportNumber={report.reportNumber ?? String(report.id)}
              variant="default"
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Equipo</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Cliente</p>
                <p className="text-foreground">{report.clientName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Equipo</p>
                <p className="text-foreground">
                  {report.equipmentModel}
                  {report.equipmentSerialNumber && ` · ${report.equipmentSerialNumber}`}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground">Componente afectado</p>
                <p className="text-foreground">{report.affectedComponent || '—'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Intervención</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Evento / falla</p>
                <p className="text-foreground">{report.eventFailure?.value ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Acción</p>
                <p className="text-foreground">{report.action?.value ?? '—'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground">Estado del equipo</p>
                <p className="text-foreground">
                  {report.initialStatus?.value ?? '—'} → {report.finalStatus?.value ?? '—'}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground">Periodo</p>
                <p className="text-foreground">
                  {report.startDatetime && formatDateTime(report.startDatetime)} —{' '}
                  {report.endDatetime && formatDateTime(report.endDatetime)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalle</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-line text-foreground">{report.details || '—'}</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Firmas</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Personal técnico</p>
                <p className="text-foreground">{report.personnel?.value ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Responsable</p>
                <p className="text-foreground">{report.supervisor?.value ?? '—'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Registro</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Creado por</p>
                <p className="text-foreground">{report.createdBy ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Fecha</p>
                <p className="text-foreground">
                  {report.createdAt ? formatDateTime(report.createdAt) : '—'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
