/**
 * Mensaje de error asociado a un campo de formulario.
 *
 * @author Roger Rojas Effio - roger.rojas@rmsolutions.pe
 */
export function FieldError({ message }: { message?: string }) {
  if (!message) return null

  return (
    <p role="alert" className="text-sm text-destructive">
      {message}
    </p>
  )
}
