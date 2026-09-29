/**
 * Catálogos: pestañas por tipo (Acción, Estado, Evento/falla, Personal, Responsable),
 * cada una con alta de opciones y edición inline. La pestaña activa vive en la query string.
 *
 * @author Roger Rojas Effio - roger.rojas@rmsolutions.pe
 */
import { useSearchParams } from 'react-router-dom'

import { PageHeader } from '@/components/layout/PageHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { CatalogList } from './CatalogList'
import { catalogTabs, type CatalogType } from './catalogTypes'
import { useCatalogs } from './useCatalogs'

function isCatalogType(value: string | null): value is CatalogType {
  return catalogTabs.some((tab) => tab.type === value)
}

function CatalogTabCount({ type }: { type: CatalogType }) {
  const { data } = useCatalogs(type)
  if (!data) return null
  return <span className="text-muted-foreground">{data.length}</span>
}

export function CatalogsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const typeParam = searchParams.get('type')
  const activeType = isCatalogType(typeParam) ? typeParam : catalogTabs[0].type

  const handleTabChange = (value: string) => {
    setSearchParams({ type: value }, { replace: true })
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Catálogos"
        description="Opciones configurables: acción, estado, evento/falla, personal y responsable."
      />

      <Tabs value={activeType} onValueChange={handleTabChange}>
        <TabsList>
          {catalogTabs.map((tab) => (
            <TabsTrigger key={tab.type} value={tab.type} className="gap-1.5">
              {tab.label}
              <CatalogTabCount type={tab.type} />
            </TabsTrigger>
          ))}
        </TabsList>

        {catalogTabs.map((tab) => (
          <TabsContent key={tab.type} value={tab.type}>
            <CatalogList type={tab.type} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
