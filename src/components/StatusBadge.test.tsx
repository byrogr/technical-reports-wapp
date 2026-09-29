import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { StatusBadge } from './StatusBadge'

describe('StatusBadge', () => {
  it('usa el estilo operativo para "Operativo"', () => {
    render(<StatusBadge value="Operativo" />)
    expect(screen.getByText('Operativo')).toHaveClass('bg-status-operational')
  })

  it('normaliza mayúsculas y acentos para "INOPERATIVO"', () => {
    render(<StatusBadge value="INOPERATIVO" />)
    expect(screen.getByText('INOPERATIVO')).toHaveClass('bg-status-inoperative')
  })

  it('reconoce variantes de "En Obs."', () => {
    render(<StatusBadge value="En Observación" />)
    expect(screen.getByText('En Observación')).toHaveClass('bg-status-observation')
  })

  it('usa el estilo gris por defecto para valores desconocidos', () => {
    render(<StatusBadge value="Pendiente" />)
    expect(screen.getByText('Pendiente')).toHaveClass('bg-status-neutral')
  })
})
