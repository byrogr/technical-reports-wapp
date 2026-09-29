/**
 * Listado de informes técnicos con filtros por cliente, equipo y fechas.
 *
 * @author Roger Rojas Effio - roger.rojas@rmsolutions.pe
 */
import { Plus } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'

import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import { ReportFiltersBar } from './ReportFiltersBar'
import { ReportTable } from './ReportTable'
import { useReports, type ReportFilters } from './useReports'

export function ReportListPage() {
  const [searchParams] = useSearchParams()

  const filters: ReportFilters = {
    clientId: searchParams.get('clientId') ? Number(searchParams.get('clientId')) : undefined,
    equipmentId: searchParams.get('equipmentId')
      ? Number(searchParams.get('equipmentId'))
      : undefined,
    from: searchParams.get('from') ?? undefined,
    to: searchParams.get('to') ?? undefined,
  }

  const { data: reports, isPending, isError } = useReports(filters)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Informes"
        description="Listado de informes técnicos de mantenimiento."
        action={
          <Button asChild>
            <Link to="/reports/new">
              <Plus />
              Nuevo informe
            </Link>
          </Button>
        }
      />

      <ReportFiltersBar />

      {isPending ? (
        <Skeleton className="h-64 w-full" />
      ) : isError ? (
        <p className="text-sm text-destructive">No se pudieron cargar los informes.</p>
      ) : (
        <ReportTable reports={reports} />
      )}
    </div>
  )
}
