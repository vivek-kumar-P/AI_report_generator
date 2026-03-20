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

const dataUrlToUint8Array = (dataUrl: string) => {
  const base64 = dataUrl.split(',')[1] || ''
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

const downloadPdfClientSide = async (markdownPages: string[]) => {
  const html2canvas = (await import('html2canvas-pro')).default
  const { PDFDocument } = await import('pdf-lib')

  const pdfDoc = await PDFDocument.create()
  const pageWidth = 595.28
  const pageHeight = 841.89
  const margin = 24

  for (const markdown of markdownPages) {
    const container = document.createElement('div')
    container.style.position = 'absolute'
    container.style.left = '-9999px'
    container.style.width = '794px'
    container.style.minHeight = '1123px'
    container.style.padding = '48px'
    container.style.background = '#ffffff'
    container.innerHTML = markdownToBasicHtml(markdown)
    document.body.appendChild(container)

    try {
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      })

      const pngBytes = dataUrlToUint8Array(canvas.toDataURL('image/png'))
      const image = await pdfDoc.embedPng(pngBytes)
      const page = pdfDoc.addPage([pageWidth, pageHeight])

      const maxWidth = pageWidth - margin * 2
      const maxHeight = pageHeight - margin * 2
      const scale = Math.min(maxWidth / image.width, maxHeight / image.height)
      const drawWidth = image.width * scale
      const drawHeight = image.height * scale

      page.drawImage(image, {
        x: (pageWidth - drawWidth) / 2,
        y: pageHeight - margin - drawHeight,
        width: drawWidth,
        height: drawHeight,
      })
    } finally {
      document.body.removeChild(container)
    }
  }

  const pdfBytes = await pdfDoc.save()
  const pdfBody = new Uint8Array(pdfBytes.byteLength)
  pdfBody.set(pdfBytes)
  const blob = new Blob([pdfBody], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'report.pdf'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
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
      // Identify which section to modify
      const target = identifyFeedbackTarget(feedback, pages)
      const fullContent = pages.join('\n\n---\n\n')
      
      // Call OpenRouter API to regenerate the section
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

      // Update the specific page with regenerated content
      if (regenerateResult.result) {
        const updatedPages = [...pages]
        updatedPages[target.pageIndex] = regenerateResult.result
        const updatedPagesHtml = [...displayPagesHtml]
        updatedPagesHtml[target.pageIndex] = markdownToBasicHtml(regenerateResult.result)
        
        // Update pages in the store
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

const handleDownloadPDF = async () => {
  setIsDownloading(true)
  try {
    const markdownPages = pages

    if (!markdownPages || markdownPages.length === 0) {
      toast({ variant: 'destructive', title: 'No content', description: 'No pages to export' })
      return
    }

    const res = await fetch('/api/export/pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pages: markdownPages }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown error' }))
      if (res.status === 501) {
        await downloadPdfClientSide(markdownPages)
        toast({ title: 'Success', description: `PDF with ${markdownPages.length} page(s) downloaded!` })
        return
      }
      throw new Error(err.error || 'Server failed to generate PDF')
    }

    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'report.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({ title: 'Success', description: `PDF with ${markdownPages.length} page(s) downloaded!` })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to download PDF'
    if (message.toLowerCase().includes('client-side generation')) {
      try {
        await downloadPdfClientSide(pages || [])
        toast({ title: 'Success', description: `PDF with ${(pages || []).length} page(s) downloaded!` })
        return
      } catch {
        // Fall through to destructive toast below.
      }
    }
    console.error('PDF error:', err)
    toast({ variant: 'destructive', title: 'Download failed', description: message })
  } finally {
    setIsDownloading(false)
  }
}

const handleDownloadWord = async () => {
  setIsDownloadingWord(true)
  try {
    // Get raw markdown pages from the store (not DOM HTML)
    const markdownPages = pages // this is the `pages` array from useReportStore()

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

          {/* RIGHT: Customization & Actions */}
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

                {/* Typography */}
                <div className="space-y-3 border-t border-muted pt-4">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Type className="h-4 w-4" /> Typography
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      className="rounded-lg border px-3 py-2 text-xs watery-input glow-hover text-foreground/80"
                      onClick={() => editorRef.current?.setParagraph()}
                    >
                      Paragraph
                    </button>
                    <select
                      className="h-9 rounded-lg border px-2 text-sm watery-input glow-hover text-foreground"
                      onChange={(e) => {
                        const level = Number(e.target.value) as 1 | 2 | 3
                        editorRef.current?.setHeading(level)
                      }}
                      defaultValue="2"
                    >
                      <option value="1">Heading 1</option>
                      <option value="2">Heading 2</option>
                      <option value="3">Heading 3</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      className="h-9 rounded-lg border px-2 text-sm watery-input glow-hover text-foreground"
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value)}
                    >
                      {fontFamilies.map((font) => (
                        <option key={font} value={font}>{font}</option>
                      ))}
                    </select>
                    <select
                      className="h-9 rounded-lg border px-2 text-sm watery-input glow-hover text-foreground"
                      value={fontSize}
                      onChange={(e) => setFontSize(e.target.value)}
                    >
                      {fontSizes.map((size) => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center justify-between rounded-lg border px-3 py-2 text-xs watery-input glow-hover text-foreground/80">
                      Text Color
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="h-6 w-8 rounded"
                      />
                    </label>
                    <label className="flex items-center justify-between rounded-lg border px-3 py-2 text-xs watery-input glow-hover text-foreground/80">
                      Highlight
                      <input
                        type="color"
                        value={highlightColor}
                        onChange={(e) => setHighlightColor(e.target.value)}
                        className="h-6 w-8 rounded"
                      />
                    </label>
                  </div>
                </div>

                {/* Formatting */}
                <div className="space-y-3 border-t border-muted pt-4">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Palette className="h-4 w-4" /> Formatting
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <button className="rounded-lg border px-2 py-2 text-xs watery-input glow-hover text-foreground/80" onClick={() => editorRef.current?.toggleBold()}><Bold className="w-4 h-4" /></button>
                    <button className="rounded-lg border px-2 py-2 text-xs watery-input glow-hover text-foreground/80" onClick={() => editorRef.current?.toggleItalic()}><Italic className="w-4 h-4" /></button>
                    <button className="rounded-lg border px-2 py-2 text-xs watery-input glow-hover text-foreground/80" onClick={() => editorRef.current?.toggleUnderline()}><Underline className="w-4 h-4" /></button>
                    <button className="rounded-lg border px-2 py-2 text-xs watery-input glow-hover text-foreground/80" onClick={() => editorRef.current?.toggleStrike()}><Strikethrough className="w-4 h-4" /></button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <button className="rounded-lg border px-2 py-2 text-xs watery-input glow-hover text-foreground/80" onClick={() => editorRef.current?.toggleBulletList()}><List className="w-4 h-4" /></button>
                    <button className="rounded-lg border px-2 py-2 text-xs watery-input glow-hover text-foreground/80" onClick={() => editorRef.current?.toggleOrderedList()}><ListOrdered className="w-4 h-4" /></button>
                    <button className="rounded-lg border px-2 py-2 text-xs watery-input glow-hover text-foreground/80" onClick={() => editorRef.current?.insertHorizontalRule()}><SeparatorHorizontal className="w-4 h-4" /></button>
                    <button className="rounded-lg border px-2 py-2 text-xs watery-input glow-hover text-foreground/80" onClick={() => editorRef.current?.undo()}><Undo className="w-4 h-4" /></button>
                    <button className="rounded-lg border px-2 py-2 text-xs watery-input glow-hover text-foreground/80" onClick={() => editorRef.current?.redo()}><Redo className="w-4 h-4" /></button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <button className="rounded-lg border px-2 py-2 text-xs watery-input glow-hover text-foreground/80" onClick={() => editorRef.current?.setTextAlign('left')}><AlignLeft className="w-4 h-4" /></button>
                    <button className="rounded-lg border px-2 py-2 text-xs watery-input glow-hover text-foreground/80" onClick={() => editorRef.current?.setTextAlign('center')}><AlignCenter className="w-4 h-4" /></button>
                    <button className="rounded-lg border px-2 py-2 text-xs watery-input glow-hover text-foreground/80" onClick={() => editorRef.current?.setTextAlign('right')}><AlignRight className="w-4 h-4" /></button>
                    <button className="rounded-lg border px-2 py-2 text-xs watery-input glow-hover text-foreground/80" onClick={() => editorRef.current?.setTextAlign('justify')}><AlignJustify className="w-4 h-4" /></button>
                  </div>
                  <div className="grid grid-cols-[1fr_auto] gap-2">
                    <input
                      type="url"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="h-9 rounded-lg border px-3 text-xs watery-input glow-hover text-foreground placeholder:text-muted-foreground"
                    />
                    <button
                      type="button"
                      className="h-9 rounded-lg border px-3 text-xs watery-input glow-hover text-foreground/80"
                      onClick={() => {
                        if (linkUrl.trim()) {
                          editorRef.current?.setLink(linkUrl.trim())
                        } else {
                          editorRef.current?.unsetLink()
                        }
                      }}
                    >
                      <LinkIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Layout */}
                <div className="space-y-3 border-t border-muted pt-4">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Palette className="h-4 w-4" /> Layout & Style
                  </div>
                  <label className="text-xs text-muted-foreground">Page Padding: {pagePadding}px</label>
                  <input
                    type="range"
                    min="20"
                    max="64"
                    value={pagePadding}
                    onChange={(e) => setPagePadding(parseInt(e.target.value))}
                    className="w-full glow-hover slow-transition"
                  />

                  <label className="text-xs text-muted-foreground">Line Height: {lineHeight.toFixed(1)}</label>
                  <input
                    type="range"
                    min="12"
                    max="20"
                    value={Math.round(lineHeight * 10)}
                    onChange={(e) => setLineHeight(parseInt(e.target.value) / 10)}
                    className="w-full glow-hover slow-transition"
                  />

                  <label className="flex items-center justify-between rounded-lg border px-3 py-2 text-xs watery-input glow-hover text-foreground/80">
                    Page Tint
                    <input
                      type="color"
                      value={pageTint}
                      onChange={(e) => setPageTint(e.target.value)}
                      className="h-6 w-8 rounded"
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      className="rounded-lg border px-3 py-2 text-xs watery-input glow-hover text-foreground/80"
                      onClick={() => setShowBorder((v) => !v)}
                    >
                      {showBorder ? 'Hide Border' : 'Show Border'}
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border px-3 py-2 text-xs watery-input glow-hover text-foreground/80"
                      onClick={() => setShowFooter((v) => !v)}
                    >
                      {showFooter ? 'Hide Footer' : 'Show Footer'}
                    </button>
                  </div>
                </div>

                {/* Images */}
                <div className="space-y-3 border-t border-muted pt-4">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <ImageIcon className="h-4 w-4" /> Images
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="image-upload"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setPendingImage(file)
                        e.currentTarget.value = ''
                      }
                    }}
                  />
                  <label
                    htmlFor="image-upload"
                    className="block rounded-lg border px-3 py-2 text-xs watery-input glow-hover cursor-pointer text-center text-foreground/80"
                  >
                    Upload Image
                  </label>
                  <p className="text-xs text-muted-foreground">Paste images directly into the editor too.</p>
                </div>

                {/* Feedback Section */}
                <div className="space-y-3 border-t border-muted pt-4">
                  <label className="text-sm font-semibold text-foreground block">
                    Feedback & Changes
                  </label>
                  <textarea
                    placeholder="Describe what you want to change or improve..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full border rounded-lg bg-background/80 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none h-28 watery-input glow-hover"
                  />
                </div>

                {/* Max Pages Control */}
                <div className="space-y-3 border-t border-muted pt-4">
                  <label className="text-sm font-semibold text-foreground block">
                    Maximum Pages: <span className="text-primary">{maxPages}</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={maxPages}
                    onChange={(e) => setMaxPages(parseInt(e.target.value))}
                    className="w-full cursor-pointer glow-hover slow-transition"
                  />
                  <p className="text-xs text-muted-foreground">Range: 1-50 pages</p>
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
                      onClick={handleDownloadPDF}
                      disabled={isDownloading || isDownloadingWord}
                      className="w-full gap-1.5 cta-secondary"
                    >
                      {isDownloading ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Wait...
                        </>
                      ) : (
                        <>
                          <span>Download</span>
                          <span className="flex items-center justify-center font-bold text-[10px] tracking-wider bg-red-500/10 text-red-500 border border-red-500/20 px-1.5 py-0.5 rounded shadow-sm">
                            PDF
                          </span>
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={handleDownloadWord}
                      disabled={isDownloadingWord || isDownloading}
                      className="w-full gap-1.5 cta-secondary"
                    >
                      {isDownloadingWord ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Wait...
                        </>
                      ) : (
                        <>
                          <span>Download</span>
                          <span className="flex items-center justify-center font-bold text-[10px] tracking-wider bg-blue-500/10 text-blue-600 border border-blue-500/20 px-1.5 py-0.5 rounded shadow-sm">
                            DOCX
                          </span>
                        </>
                      )}
                    </Button>
                  </div>

                  <Link href="/" className="block">
                    <Button variant="outline" className="w-full cta-secondary">
                      Back to Home
                    </Button>
                  </Link>
                </div>

                <div className="text-xs text-muted-foreground rounded-lg border border-muted/60 bg-muted/20 p-3">
                  Customize typography, layout, and colors on the right. Edits update inline in the page.
                </div>
              </div>
            </ScrollArea>
          </motion.aside>
        </div>
      </main>
    </div>
  )
}
