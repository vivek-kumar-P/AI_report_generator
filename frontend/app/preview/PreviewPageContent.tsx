'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Navbar from '@/components/Navbar'
import A4Page, { type A4PageHandle } from '@/components/A4Page'
import { useReportStore } from '@/lib/store'
import { identifyFeedbackTarget, markdownToBasicHtml } from '@/lib/report-utils'
import { Button } from '@/components/ui/button'
import { FileDown, ChevronUp, ChevronDown, Loader, RefreshCw, Palette, Type, Image as ImageIcon, SlidersHorizontal, AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Italic, Underline, Strikethrough, List, ListOrdered, Undo, Redo, Link as LinkIcon, SeparatorHorizontal } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'

// PNG export function - creates high-quality images from each page
async function exportReportPages(
  pages: string[],
  toast: ReturnType<typeof useToast>['toast'],
  setIsDownloading: (value: boolean) => void
) {
  try {
    // Dynamically import html2canvas only when needed
    const html2canvas = (await import('html2canvas-pro')).default

    if (!pages || pages.length === 0) {
      toast({ variant: 'destructive', title: 'No content', description: 'No pages to export' })
      return
    }

    // Convert each page to PNG and collect
    const pageImages: { data: string; pageNum: number }[] = []

    for (let i = 0; i < pages.length; i++) {
      const htmlContent = markdownToBasicHtml(pages[i])
      const container = document.createElement('div')
      container.style.position = 'absolute'
      container.style.left = '-9999px'
      container.style.width = '794px' // A4 width in pixels at 96 DPI
      container.style.padding = '0'
      container.style.backgroundColor = '#ffffff'
      container.innerHTML = htmlContent
      document.body.appendChild(container)

      try {
        const canvas = await html2canvas(container, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          allowTaint: true,
        })

        const imageData = canvas.toDataURL('image/png')
        pageImages.push({ data: imageData, pageNum: i + 1 })
      } finally {
        document.body.removeChild(container)
      }
    }

    // Download single page as PNG or all pages individually
    if (pageImages.length === 1) {
      const a = document.createElement('a')
      a.href = pageImages[0].data
      a.download = 'report-page-1.png'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } else {
      for (let i = 0; i < pageImages.length; i++) {
        const a = document.createElement('a')
        a.href = pageImages[i].data
        a.download = `report-page-${pageImages[i].pageNum}.png`
        document.body.appendChild(a)
        // Stagger downloads slightly
        await new Promise((resolve) => setTimeout(() => { a.click(); document.body.removeChild(a); resolve(null) }, 100 * (i + 1)))
      }
    }

    toast({
      title: 'Success',
      description: `${pageImages.length} page(s) exported as PNG image${pageImages.length > 1 ? 's' : ''}. You can combine them into a PDF using online tools.`,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to export pages'
    console.error('Export error:', err)
    toast({ variant: 'destructive', title: 'Export failed', description: message })
  } finally {
    setIsDownloading(false)
  }
}

export default function PreviewPageContent() {
  const { pages, pagesHtml, error, isLoading, formData, setPages, setPageHtml, setPagesHtml } = useReportStore()
  const { toast } = useToast()
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [maxPages, setMaxPages] = useState(pages?.length || 10)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isDownloadingWord, setIsDownloadingWord] = useState(false)
  const [showBorder, setShowBorder] = useState(true)
  const [showFooter, setShowFooter] = useState(true)
  const [pagePadding, setPagePadding] = useState(32)
  const [lineHeight, setLineHeight] = useState(1.6)
  const [fontSize, setFontSize] = useState('16px')
  const [fontFamily, setFontFamily] = useState('Arial')
  const [textColor, setTextColor] = useState('#1e293b')
  const [highlightColor, setHighlightColor] = useState('#fde68a')
  const [pageTint, setPageTint] = useState('#ffffff')
  const [pendingImage, setPendingImage] = useState<File | null>(null)
  const [linkUrl, setLinkUrl] = useState('')
  const [zoom, setZoom] = useState(0.9)
  const [fitZoom, setFitZoom] = useState(0.9)
  const [zoomMode, setZoomMode] = useState<'fit' | 'custom'>('fit')
  const editorRef = useRef<A4PageHandle | null>(null)
  const previewViewportRef = useRef<HTMLDivElement | null>(null)
  const pageRefs = useRef<Array<HTMLDivElement | null>>([])

  const displayPages = pages && pages.length > 0 ? pages : ['No report generated yet']
  const displayPagesHtml = pagesHtml && pagesHtml.length > 0
    ? pagesHtml
    : displayPages.map((page) => markdownToBasicHtml(page))
  const currentPageHtml = displayPagesHtml[currentPageIndex] || ''
  const totalPages = displayPages.length
  const fontFamilies = useMemo(
    () => ['Arial', 'Georgia', 'Times New Roman', 'Verdana', 'Courier New'],
    []
  )
  const fontSizes = useMemo(
    () => ['12px', '14px', '16px', '18px', '20px', '22px', '24px'],
    []
  )

  const zoomScale = zoomMode === 'fit' ? fitZoom : zoom
  const pageGap = Math.max(12, Math.round(32 * zoomScale))
  
  const scrollToPage = (index: number) => {
    const safeIndex = Math.max(0, Math.min(totalPages - 1, index))
    setCurrentPageIndex(safeIndex)
    requestAnimationFrame(() => {
      const target = pageRefs.current[safeIndex]
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })
  }

  useEffect(() => {
    document.body.dataset.noParticles = 'true'
    return () => {
      delete document.body.dataset.noParticles
    }
  }, [])

  useEffect(() => {
    const viewport = previewViewportRef.current
    if (!viewport) return

    const updateFit = () => {
      const rect = viewport.getBoundingClientRect()
      const fitWidth = (rect.width - 48) / 794
      const fitHeight = (rect.height - 48) / 1123
      const nextFit = Math.max(0.35, Math.min(1, fitWidth, fitHeight))
      const rounded = Number(nextFit.toFixed(2))
      setFitZoom(rounded)
      if (zoomMode === 'fit') {
        setZoom(rounded)
      }
    }

    updateFit()
    const observer = new ResizeObserver(updateFit)
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [zoomMode])

  const handleRegenerate = async () => {
    if (!feedback.trim() || !pages || pages.length === 0) return
    
    setIsRegenerating(true)
    try {
      const target = identifyFeedbackTarget(feedback, pages)
      const fullContent = pages.join('\n\n---\n\n')
      
      const regenerateResult = await fetch('/api/tools/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'regenerate_section',
          args: {
            originalSection: target.section,
            feedback: feedback,
            fullContent: fullContent
          }
        })
      }).then(res => res.json())

      if (regenerateResult.result) {
        const updatedPages = [...pages]
        updatedPages[target.pageIndex] = regenerateResult.result
        const updatedPagesHtml = [...displayPagesHtml]
        updatedPagesHtml[target.pageIndex] = markdownToBasicHtml(regenerateResult.result)
        
        setPages(updatedPages)
        setPagesHtml(updatedPagesHtml)
        
        toast({
          title: 'Success',
          description: `Section on page ${target.pageIndex + 1} has been updated with your feedback!`,
        })
        
        setFeedback('')
      } else {
        throw new Error('No content returned from regeneration')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to regenerate'
      console.error('Regeneration error:', err)
      toast({
        variant: 'destructive',
        title: 'Regeneration failed',
        description: message,
      })
    } finally {
      setIsRegenerating(false)
    }
  }

  const handleDownloadImages = async () => {
    setIsDownloading(true)
    await exportReportPages(pages || [], toast, setIsDownloading)
  }

  const handleDownloadWord = async () => {
    setIsDownloadingWord(true)
    try {
      const markdownPages = pages

      if (!markdownPages || markdownPages.length === 0) {
        toast({ variant: 'destructive', title: 'No content', description: 'No pages to export' })
        return
      }

      const res = await fetch('/api/export/docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pages: markdownPages }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(err.error || 'Server failed to generate document')
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'report.docx'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({ title: 'Success', description: `Word document with ${markdownPages.length} page(s) downloaded!` })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to download Word document'
      console.error('Word download error:', err)
      toast({ variant: 'destructive', title: 'Download failed', description: message })
    } finally {
      setIsDownloadingWord(false)
    }
  }

  return (
    <div className="min-h-screen bg-background/95 landing-shell">
      <Navbar />

      <main className="pt-28 pb-6 h-screen flex flex-col">
        <div className="flex-1 flex overflow-hidden gap-6 px-6">
          {/* LEFT: A4 Pages Preview - Scrollable */}
          <motion.div
            className="flex-1 overflow-hidden rounded-2xl glow-panel slow-transition"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-5 py-3 border-b border-muted/60 bg-muted/30 backdrop-blur">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoomMode('fit')}
                  className="cta-secondary"
                >
                  Fit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => scrollToPage(currentPageIndex - 1)}
                  disabled={currentPageIndex === 0}
                  className="cta-secondary"
                >
                  <ChevronUp className="w-4 h-4" />
                  Up
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setZoomMode('custom')
                    setZoom((prev) => Math.max(0.4, Number((prev - 0.1).toFixed(2))))
                  }}
                  className="cta-secondary"
                >
                  -
                </Button>
                <div className="px-3 py-1 rounded-lg glow-panel text-xs font-semibold text-foreground">
                  {Math.round(zoomScale * 100)}%
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setZoomMode('custom')
                    setZoom((prev) => Math.min(1.6, Number((prev + 0.1).toFixed(2))))
                  }}
                  className="cta-secondary"
                >
                  +
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => scrollToPage(currentPageIndex + 1)}
                  disabled={currentPageIndex === totalPages - 1}
                  className="cta-secondary"
                >
                  Down
                  <ChevronDown className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setZoomMode('custom')
                    setZoom(1)
                  }}
                  className="cta-secondary"
                >
                  100%
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                Page {currentPageIndex + 1} / {totalPages} · A4 210 x 297 mm
              </div>
            </div>
            <ScrollArea className="h-full" ref={previewViewportRef}>
              <div className="flex flex-col items-center justify-center p-6" style={{ gap: pageGap }}>
                {/* Page Display */}
                <div className="w-full max-w-3xl flex flex-col items-center" style={{ gap: pageGap }}>
                  {displayPagesHtml.map((pageHtml, pageIndex) => (
                    <div
                      key={pageIndex}
                      ref={(node) => {
                        pageRefs.current[pageIndex] = node
                      }}
                      className={`flex w-full justify-center transition-all duration-300 ${
                        pageIndex === currentPageIndex ? 'ring-1 ring-emerald-400/50 rounded-lg' : 'opacity-85'
                      }`}
                      onClick={() => scrollToPage(pageIndex)}
                    >
                      <div
                        className="transition-transform duration-300"
                        style={{ transform: `scale(${zoomScale})`, transformOrigin: 'top center' }}
                      >
                        <A4Page
                          contentHtml={pageHtml}
                          pageNumber={pageIndex + 1}
                          totalPages={totalPages}
                          showBorder={showBorder}
                          showFooter={showFooter}
                          pagePadding={pagePadding}
                          lineHeight={lineHeight}
                          fontSize={fontSize}
                          fontFamily={fontFamily}
                          textColor={textColor}
                          highlightColor={highlightColor}
                          pageTint={pageTint}
                          pendingImage={pageIndex === currentPageIndex ? pendingImage : null}
                          onImageHandled={() => setPendingImage(null)}
                          onContentChange={(html) => setPageHtml(pageIndex, html)}
                          ref={pageIndex === currentPageIndex ? editorRef : undefined}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </motion.div>

          {/* RIGHT: Customization & Actions - omitting long panel content for brevity, same as before */}
          <motion.aside
            className="w-full md:w-[360px] flex-shrink-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <ScrollArea className="h-full rounded-2xl glow-panel slow-transition">
              <div className="p-6 space-y-6 h-full">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Preview & Edit</h2>
                    <p className="text-sm text-muted-foreground">
                      Page {currentPageIndex + 1} of {totalPages}
                    </p>
                  </div>
                  <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
                </div>

                {/* Actions */}
                <div className="space-y-3 border-t border-muted pt-4">
                  <Button
                    onClick={handleRegenerate}
                    disabled={!feedback.trim() || isRegenerating}
                    className="w-full gap-2 cta-primary"
                  >
                    {isRegenerating ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Regenerating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        Regenerate Report
                      </>
                    )}
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={handleDownloadImages}
                      disabled={isDownloading || isDownloadingWord || totalPages === 0}
                      variant="outline"
                      className="gap-2 cta-secondary"
                      title="Download report pages as PNG images"
                    >
                      {isDownloading ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Exporting...
                        </>
                      ) : (
                        <>
                          <FileDown className="w-4 h-4" />
                          PNG
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleDownloadWord}
                      disabled={isDownloadingWord || isDownloading || totalPages === 0}
                      variant="outline"
                      className="gap-2 cta-secondary"
                      title="Download report as Word document"
                    >
                      {isDownloadingWord ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Exporting...
                        </>
                      ) : (
                        <>
                          <FileDown className="w-4 h-4" />
                          Word
                        </>
                      )}
                    </Button>
                  </div>

                  <Button
                    asChild
                    className="w-full cta-secondary"
                  >
                    <Link href="/">Back to Home</Link>
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </motion.aside>
        </div>
      </main>
    </div>
  )
}
