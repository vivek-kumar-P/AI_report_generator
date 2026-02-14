'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Navbar from '@/components/Navbar'
import A4Page from '@/components/A4Page'
import { useReportStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Download, ArrowLeft, AlertCircle, Loader } from 'lucide-react'

export default function ExportPage() {
  const { pages } = useReportStore()
  const [isDownloading, setIsDownloading] = useState(false)
  const pdfPageRefs = useRef<Array<HTMLDivElement | null>>([])

  if (!pages || pages.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <main className="pt-32 px-4 flex items-center justify-center min-h-screen">
          <div className="glass-morphism border border-white/10 bg-white/5 rounded-2xl p-8 text-center max-w-md">
            <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">No Report Generated</h2>
            <p className="text-muted-foreground mb-6">
              Please generate a report first from the home page.
            </p>
            <Link href="/">
              <Button className="w-full">Back to Home</Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const handleDownloadPDF = async () => {
    if (isDownloading) return

    setIsDownloading(true)

    try {
      const [{ jsPDF }, html2canvasModule] = await Promise.all([
        import('jspdf'),
        import('html2canvas')
      ])

      const html2canvas = html2canvasModule.default
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })

      for (let index = 0; index < pdfPageRefs.current.length; index += 1) {
        const pageElement = pdfPageRefs.current[index]
        if (!pageElement) continue

        const canvas = await html2canvas(pageElement, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff'
        })

        const imgData = canvas.toDataURL('image/png')
        const pageWidth = pdf.internal.pageSize.getWidth()
        const pageHeight = pdf.internal.pageSize.getHeight()
        const imgWidth = pageWidth
        const imgHeight = (canvas.height * imgWidth) / canvas.width
        const yOffset = Math.max(0, (pageHeight - imgHeight) / 2)

        if (index > 0) {
          pdf.addPage()
        }

        pdf.addImage(imgData, 'PNG', 0, yOffset, imgWidth, imgHeight)
      }

      pdf.save('report.pdf')
    } catch (error) {
      console.error('PDF export failed:', error)
      alert('PDF export failed. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      <Navbar />

      <main className="pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold text-foreground mb-2">Your Generated Report</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Your report is ready to download and share with your team
            </p>
          </motion.div>

          {/* Pages Grid */}
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            {pages.map((page, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex justify-center"
              >
                <div className="w-full max-w-sm">
                  <A4Page
                    content={page}
                    pageNumber={index + 1}
                    totalPages={pages.length}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link href="/preview">
              <Button variant="outline" className="gap-2 w-full sm:w-auto">
                <ArrowLeft className="w-4 h-4" />
                Back to Edit
              </Button>
            </Link>
            <Button
              onClick={handleDownloadPDF}
              className="gap-2 w-full sm:w-auto"
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Preparing PDF...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download PDF
                </>
              )}
            </Button>
          </motion.div>

          {/* Info Box */}
          <motion.div
            className="mt-12 glass-morphism border border-blue-400/20 bg-blue-400/10 rounded-2xl p-6 text-center max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-blue-200">
              Your report is formatted and ready to download as PDF. All pages, formatting, and images are preserved in the output.
            </p>
          </motion.div>
        </div>

        {/* Hidden full-size pages for PDF rendering */}
        <div
          className="absolute -left-[9999px] top-0 flex flex-col gap-8"
          aria-hidden="true"
        >
          {pages.map((page, index) => (
            <div
              key={`pdf-${index}`}
              ref={(el) => {
                pdfPageRefs.current[index] = el
              }}
              className="w-[794px]"
            >
              <A4Page
                content={page}
                pageNumber={index + 1}
                totalPages={pages.length}
              />
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
