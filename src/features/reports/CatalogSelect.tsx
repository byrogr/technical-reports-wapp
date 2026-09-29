/**
 * Select de una opción de catálogo: solo opciones activas, más la opción
 * actual del informe si está inactiva (marcada "(inactiva)").
 *
 * @author Roger Rojas Effio - roger.rojas@rmsolutions.pe
 */
import type { CatalogType } from '@/features/catalogs/catalogTypes'
import { useCatalogs } from '@/features/catalogs/useCatalogs'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface CurrentOption {
  id: number
  value: string
  active: boolean
}

interface CatalogSelectProps {
  id?: string
  type: CatalogType
  value: number
  onChange: (value: number) => void
  currentOption?: CurrentOption
  placeholder?: string
}

export function CatalogSelect({
  id,
  type,
  value,
  onChange,
  currentOption,
  placeholder = 'Selecciona una opción',
}: CatalogSelectProps) {
  const { data } = useCatalogs(type)
  const activeOptions = (data ?? []).filter((option) => option.active)

  const options =
    currentOption && !activeOptions.some((option) => option.id === currentOption.id)
      ? [...activeOptions, { ...currentOption, type }]
      : activeOptions

  return (
    <Select value={value ? String(value) : undefined} onValueChange={(v) => onChange(Number(v))}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.id} value={String(option.id)}>
            {option.value}
            {!option.active && ' (inactiva)'}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
