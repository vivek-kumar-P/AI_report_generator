'use client'

import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import Navbar from '@/components/Navbar'
import A4Page, { type A4PageHandle } from '@/components/A4Page'
import { useReportStore } from '@/lib/store'
import { identifyFeedbackTarget, markdownToBasicHtml } from '@/lib/report-utils'
import { Button } from '@/components/ui/button'
import { FileDown, ChevronLeft, ChevronRight, Loader, RefreshCw, Palette, Type, Image as ImageIcon, SlidersHorizontal, AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Italic, Underline, Strikethrough, List, ListOrdered, Undo, Redo, Link as LinkIcon, SeparatorHorizontal } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'

export default function PreviewPage() {
  const { pages, pagesHtml, error, isLoading, formData, setPages, setPageHtml, setPagesHtml } = useReportStore()
  const { toast } = useToast()
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [maxPages, setMaxPages] = useState(pages?.length || 10)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
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
  const editorRef = useRef<A4PageHandle | null>(null)

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
      const pages = document.querySelectorAll('.a4-page')
      if (pages.length === 0) {
        toast({
          variant: 'destructive',
          title: 'No pages found',
          description: 'Unable to find pages to export',
        })
        setIsDownloading(false)
        return
      }

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const errors: string[] = []
      const scale = Math.min(2, window.devicePixelRatio || 2)

      for (let i = 0; i < pages.length; i++) {
        if (i > 0) {
          pdf.addPage()
        }

        const element = pages[i] as HTMLElement
        try {
          const canvas = await html2canvas(element, {
            scale,
            useCORS: true,
            allowTaint: false,
            backgroundColor: '#ffffff',
            imageTimeout: 15000,
            removeContainer: true,
            onclone: (doc) => {
              doc.querySelectorAll('[contenteditable]').forEach((node) => {
                node.setAttribute('contenteditable', 'false')
              })

              const isUnsupported = (value: string) =>
                value.includes('lab(') || value.includes('oklch(') || value.includes('color(')

              const sanitize = (value: string, fallback: string) =>
                isUnsupported(value) ? fallback : value

              // Disable stylesheets that include unsupported color functions.
              Array.from(doc.styleSheets).forEach((sheet) => {
                try {
                  const rules = (sheet as CSSStyleSheet).cssRules
                  if (!rules) return
                  for (const rule of Array.from(rules)) {
                    if (rule.cssText && isUnsupported(rule.cssText)) {
                      sheet.disabled = true
                      break
                    }
                  }
                } catch {
                  // Ignore cross-origin stylesheets
                }
              })

              doc.querySelectorAll('.a4-page *').forEach((node) => {
                const style = doc.defaultView?.getComputedStyle(node as Element)
                if (!style) return

                const color = sanitize(style.color, '#0f172a')
                const background = sanitize(style.backgroundColor, 'transparent')
                const borderColor = sanitize(style.borderColor, '#cbd5e1')
                const outlineColor = sanitize(style.outlineColor, '#cbd5e1')
                const caretColor = sanitize(style.caretColor, '#0f172a')
                const textShadow = sanitize(style.textShadow, 'none')
                const backgroundImage = sanitize(style.backgroundImage, 'none')
                const filter = sanitize(style.filter, 'none')

                const elementNode = node as HTMLElement
                elementNode.style.color = color
                elementNode.style.backgroundColor = background
                elementNode.style.borderColor = borderColor
                elementNode.style.outlineColor = outlineColor
                elementNode.style.caretColor = caretColor
                elementNode.style.textShadow = textShadow
                elementNode.style.backgroundImage = backgroundImage
                elementNode.style.filter = filter

                if (isUnsupported(style.boxShadow)) {
                  elementNode.style.boxShadow = 'none'
                }
              })
            },
          })

          const imgData = canvas.toDataURL('image/jpeg', 0.98)
          pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297)
        } catch (pageError) {
          const message = pageError instanceof Error ? pageError.message : 'Unknown page render error'
          errors.push(`Page ${i + 1}: ${message}`)
        }
      }

      if (errors.length > 0) {
        toast({
          variant: 'destructive',
          title: 'PDF export partial failure',
          description: errors[0],
        })
        return
      }

      pdf.save('report.pdf')
      toast({
        title: 'Success',
        description: `PDF with ${pages.length} page(s) downloaded`,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to download PDF'
      console.error('PDF download error:', err)
      toast({
        variant: 'destructive',
        title: 'Download failed',
        description: message,
      })
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 pb-6 h-screen flex flex-col">
        <div className="flex-1 flex overflow-hidden gap-6 px-6">
          {/* LEFT: A4 Pages Preview - Scrollable */}
          <motion.div
            className="flex-1 overflow-hidden rounded-2xl"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <ScrollArea className="h-full">
              <div className="flex flex-col items-center justify-center gap-6 p-6">
                {/* Page Display */}
                <div className="w-full max-w-3xl">
                  <A4Page
                    contentHtml={currentPageHtml}
                    pageNumber={currentPageIndex + 1}
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
                    pendingImage={pendingImage}
                    onImageHandled={() => setPendingImage(null)}
                    onContentChange={(html) => setPageHtml(currentPageIndex, html)}
                    ref={editorRef}
                  />
                </div>

                {/* Page Navigation Controls */}
                <div className="flex items-center justify-center gap-3 w-full max-w-3xl pb-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
                    disabled={currentPageIndex === 0}
                    className="gap-2 hover-glow"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>

                  <div className="px-4 py-2 rounded-lg bg-muted border border-muted text-sm font-semibold text-foreground">
                    {currentPageIndex + 1} / {totalPages}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPageIndex(Math.min(totalPages - 1, currentPageIndex + 1))}
                    disabled={currentPageIndex === totalPages - 1}
                    className="gap-2 hover-glow"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
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
            <ScrollArea className="h-full rounded-2xl border border-muted watery-panel">
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
                      className="rounded-lg border px-3 py-2 text-xs watery-input glow-hover"
                      onClick={() => editorRef.current?.setParagraph()}
                    >
                      Paragraph
                    </button>
                    <select
                      className="h-9 rounded-lg border px-2 text-sm watery-input glow-hover"
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
                      className="h-9 rounded-lg border px-2 text-sm watery-input glow-hover"
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value)}
                    >
                      {fontFamilies.map((font) => (
                        <option key={font} value={font}>{font}</option>
                      ))}
                    </select>
                    <select
                      className="h-9 rounded-lg border px-2 text-sm watery-input glow-hover"
                      value={fontSize}
                      onChange={(e) => setFontSize(e.target.value)}
                    >
                      {fontSizes.map((size) => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center justify-between rounded-lg border px-3 py-2 text-xs watery-input glow-hover">
                      Text Color
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="h-6 w-8 rounded"
                      />
                    </label>
                    <label className="flex items-center justify-between rounded-lg border px-3 py-2 text-xs watery-input glow-hover">
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
                    <button className="rounded-lg border px-2 py-2 text-xs watery-input glow-hover" onClick={() => editorRef.current?.toggleBold()}><Bold className="h-4 w-4" /></button>
                    <button className="rounded-lg border px-2 py-2 text-xs watery-input glow-hover" onClick={() => editorRef.current?.toggleItalic()}><Italic className="h-4 w-4" /></button>
                    <button className="rounded-lg border px-2 py-2 text-xs watery-input glow-hover" onClick={() => editorRef.current?.toggleUnderline()}><Underline className="h-4 w-4" /></button>
                    <button className="rounded-lg border px-2 py-2 text-xs watery-input glow-hover" onClick={() => editorRef.current?.toggleStrike()}><Strikethrough className="h-4 w-4" /></button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <button className="rounded-lg border px-2 py-2 text-xs watery-input glow-hover" onClick={() => editorRef.current?.toggleBulletList()}><List className="h-4 w-4" /></button>
                    <button className="rounded-lg border px-2 py-2 text-xs watery-input glow-hover" onClick={() => editorRef.current?.toggleOrderedList()}><ListOrdered className="h-4 w-4" /></button>
                    <button className="rounded-lg border px-2 py-2 text-xs watery-input glow-hover" onClick={() => editorRef.current?.insertHorizontalRule()}><SeparatorHorizontal className="h-4 w-4" /></button>
                    <button className="rounded-lg border px-2 py-2 text-xs watery-input glow-hover" onClick={() => editorRef.current?.undo()}><Undo className="h-4 w-4" /></button>
                    <button className="rounded-lg border px-2 py-2 text-xs watery-input glow-hover" onClick={() => editorRef.current?.redo()}><Redo className="h-4 w-4" /></button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <button className="rounded-lg border px-2 py-2 text-xs watery-input glow-hover" onClick={() => editorRef.current?.setTextAlign('left')}><AlignLeft className="h-4 w-4" /></button>
                    <button className="rounded-lg border px-2 py-2 text-xs watery-input glow-hover" onClick={() => editorRef.current?.setTextAlign('center')}><AlignCenter className="h-4 w-4" /></button>
                    <button className="rounded-lg border px-2 py-2 text-xs watery-input glow-hover" onClick={() => editorRef.current?.setTextAlign('right')}><AlignRight className="h-4 w-4" /></button>
                    <button className="rounded-lg border px-2 py-2 text-xs watery-input glow-hover" onClick={() => editorRef.current?.setTextAlign('justify')}><AlignJustify className="h-4 w-4" /></button>
                  </div>
                  <div className="grid grid-cols-[1fr_auto] gap-2">
                    <input
                      type="url"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="h-9 rounded-lg border px-3 text-xs watery-input glow-hover"
                    />
                    <button
                      type="button"
                      className="h-9 rounded-lg border px-3 text-xs watery-input glow-hover"
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
                    className="w-full glow-hover"
                  />

                  <label className="text-xs text-muted-foreground">Line Height: {lineHeight.toFixed(1)}</label>
                  <input
                    type="range"
                    min="12"
                    max="20"
                    value={Math.round(lineHeight * 10)}
                    onChange={(e) => setLineHeight(parseInt(e.target.value) / 10)}
                    className="w-full glow-hover"
                  />

                  <label className="flex items-center justify-between rounded-lg border px-3 py-2 text-xs watery-input glow-hover">
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
                      className="rounded-lg border px-3 py-2 text-xs watery-input glow-hover"
                      onClick={() => setShowBorder((v) => !v)}
                    >
                      {showBorder ? 'Hide Border' : 'Show Border'}
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border px-3 py-2 text-xs watery-input glow-hover"
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
                    className="block rounded-lg border px-3 py-2 text-xs watery-input glow-hover cursor-pointer text-center"
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
                    className="w-full border rounded-lg bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none h-28 watery-input glow-hover"
                  />
                </div>

                {/* Max Pages Control */}
                <div className="space-y-3 border-t border-muted pt-4">
                  <label className="text-sm font-semibold text-foreground block">
                    Maximum Pages: <span className="text-primary">{maxPages}</span>
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={maxPages}
                    onChange={(e) => setMaxPages(parseInt(e.target.value))}
                    className="w-full cursor-pointer glow-hover"
                  />
                  <p className="text-xs text-muted-foreground">Range: 5–50 pages</p>
                </div>

                {/* Actions */}
                <div className="space-y-3 border-t border-muted pt-4">
                  <Button
                    onClick={handleRegenerate}
                    disabled={!feedback.trim() || isRegenerating}
                    className="w-full gap-2 glow-hover watery-cta"
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

                  <Button
                    onClick={handleDownloadPDF}
                    disabled={isDownloading}
                    className="w-full gap-2 glow-hover watery-cta-secondary"
                  >
                    {isDownloading ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <FileDown className="w-4 h-4" />
                        Download PDF
                      </>
                    )}
                  </Button>

                  <Link href="/" className="block">
                    <Button variant="outline" className="w-full glow-hover">
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
