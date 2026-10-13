/**
 * Menú lateral: Operación (Informes, Clientes y equipos) y Configuración (Catálogos).
 * Arriba, el logo (como ícono) y las siglas del sistema (SIT); al pie, el email del usuario
 * y el botón de cerrar sesión.
 *
 * @author Roger Rojas Effio - roger.rojas@rmsolutions.pe
 */
import { FileText, LogOut, Tags, Users } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'

import logo from '@/assets/logo-scontrol-mark.png'
import { useAuth } from '@/auth/useAuth'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from '@/components/ui/sidebar'

const operationItems = [
  { title: 'Informes', href: '/reports', icon: FileText },
  { title: 'Clientes y equipos', href: '/clients', icon: Users },
]

const configurationItems = [{ title: 'Catálogos', href: '/catalogs', icon: Tags }]

export function AppSidebar() {
  const location = useLocation()
  const { userEmail, logout } = useAuth()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-1 py-1 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:px-0">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-card p-1 shadow-sm ring-1 ring-black/5 group-data-[collapsible=icon]:size-8">
            <img
              src={logo}
              alt="Scontrol Ingeniería"
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <div className="min-w-0 flex-1 leading-tight group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-semibold text-sidebar-foreground">SIT</p>
            <p className="truncate text-xs text-muted-foreground">Sistema de Informes Técnicos</p>
          </div>
          <SidebarTrigger />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Operación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {operationItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname.startsWith(item.href)}
                    tooltip={item.title}
                    className="data-active:border data-active:border-border"
                  >
                    <NavLink to={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Configuración</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {configurationItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname.startsWith(item.href)}
                    tooltip={item.title}
                    className="data-active:border data-active:border-border"
                  >
                    <NavLink to={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div
              className="truncate px-2 py-1 text-sm text-muted-foreground group-data-[collapsible=icon]:hidden"
              title={userEmail ?? undefined}
            >
              {userEmail}
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout} tooltip="Cerrar sesión">
              <LogOut />
              <span>Cerrar sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
