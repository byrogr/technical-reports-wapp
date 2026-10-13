/**
 * Pantalla de inicio de sesión en dos columnas: foto del negocio a la izquierda (oculta
 * en pantallas angostas) y el formulario con el logo a la derecha.
 *
 * Foto y logo: propios de Scontrol (https://scontrol.pe/empresa/).
 *
 * @author Roger Rojas Effio - roger.rojas@rmsolutions.pe
 */
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'

import loginHero from '@/assets/login-hero.jpg'
import logo from '@/assets/logo-scontrol.png'
import { FieldError } from '@/components/FieldError'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { useAuth } from './useAuth'

const loginSchema = z.object({
  email: z.email('Ingresa un correo válido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  if (isAuthenticated) {
    const redirect = new URLSearchParams(location.search).get('redirect')
    return <Navigate to={redirect ?? '/reports'} replace />
  }

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null)
    try {
      await login(values.email, values.password)
      const redirect = new URLSearchParams(location.search).get('redirect')
      navigate(redirect ?? '/reports', { replace: true })
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'No se pudo iniciar sesión')
    }
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <img
          src={loginHero}
          alt=""
          className="absolute inset-0 size-full object-cover object-[65%_center]"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-black/10" />
        <div className="absolute inset-x-0 bottom-0 p-10 text-white">
          <p className="text-2xl font-semibold">Sistema de Informes Técnicos</p>
          <p className="mt-1 text-sm text-white/80">
            Radio controles y seguridad para maquinaria — Scontrol Ingeniería S.A.C.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-8 bg-muted px-4 py-10">
        <img src={logo} alt="Scontrol Ingeniería" className="h-14 w-auto" />

        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Iniciar sesión</CardTitle>
            <CardDescription>Ingresa con tu correo y contraseña</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Correo</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={errors.email ? true : undefined}
                  {...register('email')}
                />
                <FieldError message={errors.email?.message} />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  aria-invalid={errors.password ? true : undefined}
                  {...register('password')}
                />
                <FieldError message={errors.password?.message} />
              </div>

              <FieldError message={formError ?? undefined} />

              <Button type="submit" disabled={isSubmitting} className="mt-2">
                {isSubmitting ? 'Ingresando…' : 'Ingresar'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
