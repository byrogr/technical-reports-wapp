/**
 * Tabla del listado de informes.
 *
 * @author Roger Rojas Effio - roger.rojas@rmsolutions.pe
 */
import { Link } from 'react-router-dom'

import { EmptyState } from '@/components/EmptyState'
import { StatusBadge } from '@/components/StatusBadge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDateTime } from '@/lib/format'

import { ReportDownloadButton } from './ReportDownloadButton'
import type { ReportListItem } from './useReports'

export function ReportTable({ reports }: { reports: ReportListItem[] }) {
  if (reports.length === 0) {
    return (
      <EmptyState
        title="Sin informes"
        description="No hay informes que coincidan con los filtros aplicados."
      />
    )
  }

  return (
    <div className="rounded-xl bg-card shadow-sm ring-1 ring-black/5">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>N°</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Equipo</TableHead>
            <TableHead>Acción</TableHead>
            <TableHead>Estado final</TableHead>
            <TableHead>Término</TableHead>
            <TableHead className="w-0">
              <span className="sr-only">Descargar</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell>
                <Link
                  to={`/reports/${report.id}`}
                  className="font-mono text-sm text-primary hover:underline"
                >
                  {report.reportNumber}
                </Link>
              </TableCell>
              <TableCell className="text-foreground">{report.clientName}</TableCell>
              <TableCell className="text-foreground">
                {report.equipmentModel}
                {report.equipmentSerialNumber && (
                  <span className="text-muted-foreground"> · {report.equipmentSerialNumber}</span>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">{report.action.value ?? '—'}</TableCell>
              <TableCell>
                <StatusBadge value={report.finalStatus.value ?? '—'} />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDateTime(report.endDatetime)}
              </TableCell>
              <TableCell>
                <ReportDownloadButton id={report.id} reportNumber={report.reportNumber} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
