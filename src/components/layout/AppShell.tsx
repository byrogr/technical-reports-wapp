/**
 * Layout con aside colapsable (estado recordado en localStorage) y contenido principal.
 *
 * @author Roger Rojas Effio - roger.rojas@rmsolutions.pe
 */
import { useState, type CSSProperties, type ReactNode } from 'react'

import { AppSidebar } from './AppSidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

const SIDEBAR_OPEN_KEY = 'technical-reports:sidebarOpen'

function loadInitialOpen(): boolean {
  try {
    const stored = localStorage.getItem(SIDEBAR_OPEN_KEY)
    return stored === null ? true : stored === 'true'
  } catch {
    return true
  }
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(loadInitialOpen)

  const handleOpenChange = (value: boolean) => {
    setOpen(value)
    try {
      localStorage.setItem(SIDEBAR_OPEN_KEY, String(value))
    } catch {
      // localStorage no disponible (p. ej. modo privado); se ignora.
    }
  }

  return (
    <SidebarProvider
      open={open}
      onOpenChange={handleOpenChange}
      style={{ '--sidebar-width': '248px', '--sidebar-width-icon': '64px' } as CSSProperties}
    >
      <AppSidebar />
      <SidebarInset>
        <main className="flex-1 px-10 py-9">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
