/**
 * Página 404: se muestra cuando la ruta no coincide con ninguna definida.
 *
 * @author Roger Rojas Effio - roger.rojas@rmsolutions.pe
 */
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <p className="text-sm font-medium text-muted-foreground">Error 404</p>
      <h1 className="text-2xl font-semibold text-foreground">Página no encontrada</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        La página que buscas no existe o fue movida.
      </p>
      <Button asChild className="mt-2">
        <Link to="/reports">Volver al listado de informes</Link>
      </Button>
    </div>
  )
}
