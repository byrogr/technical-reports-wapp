/**
 * Botón para descargar el PDF de un informe. El endpoint requiere el token,
 * así que se hace fetch (vía el cliente tipado) y se dispara la descarga con
 * un object URL, en vez de un <a href> directo.
 *
 * @author Roger Rojas Effio - roger.rojas@rmsolutions.pe
 */
import { Download, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { client } from '@/api/client'
import { Button } from '@/components/ui/button'

function extractFilename(disposition: string | null): string | undefined {
  if (!disposition) return undefined
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition)
  return match ? decodeURIComponent(match[1]) : undefined
}

interface ReportDownloadButtonProps {
  id: number
  reportNumber: string
  variant?: 'icon' | 'default'
}

export function ReportDownloadButton({
  id,
  reportNumber,
  variant = 'icon',
}: ReportDownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const { data, error, response } = await client.GET('/api/technical-reports/{id}/document', {
        params: { path: { id } },
        parseAs: 'blob',
      })
      if (error) throw new Error('download failed')

      // La API declara el body como string (format: byte) pero, con parseAs: 'blob',
      // openapi-fetch entrega un Blob real en tiempo de ejecución.
      const blob = data as unknown as Blob
      const filename =
        extractFilename(response.headers.get('content-disposition')) ??
        `informe-${reportNumber}.pdf`

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('No se pudo descargar el PDF')
    } finally {
      setIsDownloading(false)
    }
  }

  if (variant === 'icon') {
    return (
      <Button
        size="icon-sm"
        variant="ghost"
        onClick={handleDownload}
        disabled={isDownloading}
        aria-label="Descargar PDF"
      >
        {isDownloading ? <Loader2 className="animate-spin" /> : <Download />}
      </Button>
    )
  }

  return (
    <Button variant="outline" onClick={handleDownload} disabled={isDownloading}>
      {isDownloading ? <Loader2 className="animate-spin" /> : <Download />}
      Descargar PDF
    </Button>
  )
}
