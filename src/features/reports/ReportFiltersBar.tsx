/**
 * Filtros del listado de informes (cliente, equipo, desde, hasta), sincronizados
 * con la query string para que la vista se pueda recargar y compartir.
 *
 * @author Roger Rojas Effio - roger.rojas@rmsolutions.pe
 */
import { X } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useClients } from '@/features/clients/useClients'
import { useEquipment } from '@/features/clients/useEquipment'

const CONTROL_HEIGHT = 'h-[38px]'

export function ReportFiltersBar() {
  const [searchParams, setSearchParams] = useSearchParams()
  const clientIdParam = searchParams.get('clientId')
  const equipmentIdParam = searchParams.get('equipmentId')
  const from = searchParams.get('from') ?? ''
  const to = searchParams.get('to') ?? ''
  const clientId = clientIdParam ? Number(clientIdParam) : undefined
  const equipmentId = equipmentIdParam ? Number(equipmentIdParam) : undefined

  const { data: clients } = useClients()
  const { data: equipmentList } = useEquipment(clientId)

  const updateParam = (key: string, value: string | undefined) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next, { replace: true })
  }

  const handleClientChange = (value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value === 'ALL') next.delete('clientId')
    else next.set('clientId', value)
    next.delete('equipmentId')
    setSearchParams(next, { replace: true })
  }

  const handleEquipmentChange = (value: string) => {
    updateParam('equipmentId', value === 'ALL' ? undefined : value)
  }

  const hasFilters = searchParams.size > 0

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground" htmlFor="filter-client">
          Cliente
        </label>
        <Select value={clientId ? String(clientId) : 'ALL'} onValueChange={handleClientChange}>
          <SelectTrigger id="filter-client" className={`w-[220px] ${CONTROL_HEIGHT}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos</SelectItem>
            {(clients ?? []).map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground" htmlFor="filter-equipment">
          Equipo
        </label>
        <Select
          value={equipmentId ? String(equipmentId) : 'ALL'}
          onValueChange={handleEquipmentChange}
          disabled={!clientId}
        >
          <SelectTrigger id="filter-equipment" className={`w-[220px] ${CONTROL_HEIGHT}`}>
            <SelectValue placeholder="Elige un cliente primero" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos</SelectItem>
            {(equipmentList ?? []).map((eq) => (
              <SelectItem key={eq.id} value={String(eq.id)}>
                {eq.model}
                {eq.serialNumber ? ` · ${eq.serialNumber}` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground" htmlFor="filter-from">
          Desde
        </label>
        <Input
          id="filter-from"
          type="date"
          value={from}
          onChange={(event) => updateParam('from', event.target.value || undefined)}
          className={`w-[160px] ${CONTROL_HEIGHT}`}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground" htmlFor="filter-to">
          Hasta
        </label>
        <Input
          id="filter-to"
          type="date"
          value={to}
          onChange={(event) => updateParam('to', event.target.value || undefined)}
          className={`w-[160px] ${CONTROL_HEIGHT}`}
        />
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={() => setSearchParams({}, { replace: true })}>
          <X />
          Limpiar
        </Button>
      )}
    </div>
  )
}
