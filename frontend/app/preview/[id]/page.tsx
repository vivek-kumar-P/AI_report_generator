'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useReportStore } from '@/lib/store'
import { splitReportIntoPages, markdownToBasicHtml } from '@/lib/report-utils'
import { Spinner } from '@/components/ui/spinner'

interface PageProps {
  params: {
    id: string
  }
}

export default function ReportViewPage({ params }: PageProps) {
  const router = useRouter()
  const { setPages, setPagesHtml, setFormData } = useReportStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadReport = async () => {
      try {
        const res = await fetch(`/api/reports/${params.id}`)
        
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Report not found')
          }
          throw new Error('Failed to load report')
        }

        const { report } = await res.json()
        
        // Split the report markdown into pages
        const pagesList = splitReportIntoPages(report.reportMarkdown, 10)
        const pagesHtmlList = pagesList.map((page) => markdownToBasicHtml(page))
        
        // Update the store with the loaded report
        setPages(pagesList)
        setPagesHtml(pagesHtmlList)
        setFormData({
          repoUrl: report.repoUrl,
          maxPages: 10,
          extraPrompt: '',
          template: '',
          advancedCustomization: false,
        })

        // Redirect to the preview page
        router.push('/preview')
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        setTimeout(() => router.push('/dashboard'), 3000)
      } finally {
        setLoading(false)
      }
    }

    loadReport()
  }, [params.id, router, setPages, setPagesHtml, setFormData])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Spinner className="w-8 h-8 mb-4" />
        <p className="text-muted-foreground">Loading report...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-destructive mb-4">{error}</p>
        <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
      </div>
    )
  }

  return null
}
