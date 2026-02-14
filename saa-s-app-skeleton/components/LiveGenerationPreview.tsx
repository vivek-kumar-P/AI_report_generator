'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useReportStore } from '@/lib/store'
import A4Page from '@/components/A4Page'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader, CheckCircle2, AlertCircle, FileText } from 'lucide-react'

export default function LiveGenerationPreview() {
  const { pages, generationStatus } = useReportStore()
  const [displayPages, setDisplayPages] = useState<string[]>([])

  useEffect(() => {
    setDisplayPages(pages)
  }, [pages])

  const getStatusColor = () => {
    switch (generationStatus.status) {
      case 'fetching':
        return 'text-blue-400'
      case 'processing':
        return 'text-purple-400'
      case 'complete':
        return 'text-green-400'
      case 'error':
        return 'text-red-400'
      default:
        return 'text-muted-foreground'
    }
  }

  const getStatusIcon = () => {
    switch (generationStatus.status) {
      case 'fetching':
      case 'processing':
        return <Loader className="w-5 h-5 animate-spin" />
      case 'complete':
        return <CheckCircle2 className="w-5 h-5" />
      case 'error':
        return <AlertCircle className="w-5 h-5" />
      default:
        return <FileText className="w-5 h-5" />
    }
  }

  return (
    <div className="w-full h-full flex flex-col bg-background">
      {/* Status Bar */}
      <motion.div
        className="px-6 py-4 border-b border-muted bg-muted/30 backdrop-blur"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={getStatusColor()}>
                {getStatusIcon()}
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">
                  {generationStatus.status === 'fetching' && 'Fetching Repository...'}
                  {generationStatus.status === 'processing' && 'Processing Content...'}
                  {generationStatus.status === 'complete' && 'Report Generated'}
                  {generationStatus.status === 'error' && 'Generation Error'}
                  {generationStatus.status === 'idle' && 'Initializing...'}
                </p>
                <p className="text-xs text-muted-foreground">{generationStatus.message}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">
                  {generationStatus.currentPage} / {generationStatus.totalPages} pages
                </p>
                <div className="w-32 h-2 bg-muted rounded-full mt-1 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-accent"
                    initial={{ width: 0 }}
                    animate={{ width: `${generationStatus.progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Pages Container - Scrollable */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col items-center justify-start gap-8 p-8">
          {displayPages.length === 0 ? (
            <motion.div
              className="flex flex-col items-center justify-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="text-center">
                <Loader className="w-12 h-12 text-primary/50 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Preparing pages...</p>
              </div>
            </motion.div>
          ) : (
            displayPages.map((page, idx) => (
              <motion.div
                key={idx}
                className="w-full max-w-3xl"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: idx * 0.2, duration: 0.5 }}
              >
                <div className="relative">
                  <A4Page
                    content={page}
                    pageNumber={idx + 1}
                    totalPages={displayPages.length}
                  />
                  
                  {/* Processing Badge */}
                  {generationStatus.status !== 'complete' && idx === displayPages.length - 1 && (
                    <motion.div
                      className="absolute -top-4 -right-4 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      Processing...
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))
          )}

          {generationStatus.status === 'complete' && displayPages.length > 0 && (
            <motion.div
              className="text-center py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-foreground">
                Report completed with {displayPages.length} pages
              </p>
            </motion.div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
