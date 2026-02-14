'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { useReportStore } from '@/lib/store'
import { callMCP } from '@/src/api/mcp'
import { useToast } from '@/hooks/use-toast'
import { splitReportIntoPages, markdownToBasicHtml } from '@/lib/report-utils'
import { GenerationStage, GENERATION_STAGES, getAllStages } from '@/lib/generation-stages'
import { Loader, CheckCircle2 } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

export default function GeneratePage() {
  const router = useRouter()
  const { 
    formData, 
    setPages, 
    setPagesHtml,
    setError, 
    updateCurrentStage, 
    addCompletedStage, 
    setStageError,
    generationStatus 
  } = useReportStore()
  const { toast } = useToast()

  useEffect(() => {
    const generateReport = async () => {
      if (!formData) {
        router.push('/')
        return
      }

      try {
        // Stage: PREPARING
        updateCurrentStage(GenerationStage.PREPARING, 'Initializing generation process...')
        await new Promise(r => setTimeout(r, 500))
        addCompletedStage(GenerationStage.PREPARING)

        // Stage: FETCHING_REPO
        updateCurrentStage(GenerationStage.FETCHING_REPO, 'Downloading repository data from GitHub...')
        addCompletedStage(GenerationStage.FETCHING_REPO)
        await new Promise(r => setTimeout(r, 800))

        // Stage: SCANNING_FILES
        updateCurrentStage(GenerationStage.SCANNING_FILES, 'Identifying markdown files in repository...')
        addCompletedStage(GenerationStage.SCANNING_FILES)

        let markdownFiles: Array<{ path: string; content: string }> = []
        try {
          const scanResult = (await Promise.race([
            callMCP('scan_markdown_files', {
              repoUrl: formData.repoUrl,
            }),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Scan timeout (30s)')), 30000)
            ),
          ])) as any

          // Stage: EXTRACTING_INFO
          updateCurrentStage(GenerationStage.EXTRACTING_INFO, 'Extracting important information from files...')
          markdownFiles = scanResult.result || []
          console.log('Scanned files:', markdownFiles)
          addCompletedStage(GenerationStage.EXTRACTING_INFO)
          await new Promise(r => setTimeout(r, 500))
        } catch (scanError) {
          const errorMsg = scanError instanceof Error ? scanError.message : 'Unknown error during scan'
          setStageError(GenerationStage.SCANNING_FILES, errorMsg)
          setError(errorMsg)
          toast({
            variant: 'destructive',
            title: 'Scan failed',
            description: errorMsg,
          })
          setTimeout(() => router.push('/'), 3000)
          return
        }

        // Stage: CALLING_MCP
        updateCurrentStage(GenerationStage.CALLING_MCP, 'Communicating with MCP server...')
        addCompletedStage(GenerationStage.CALLING_MCP)
        await new Promise(r => setTimeout(r, 300))

        // Stage: PREPARING_LLM
        updateCurrentStage(GenerationStage.PREPARING_LLM, 'Building comprehensive prompt with context...')
        addCompletedStage(GenerationStage.PREPARING_LLM)
        await new Promise(r => setTimeout(r, 500))

        // Stage: CALLING_LLM
        updateCurrentStage(GenerationStage.CALLING_LLM, 'Sending request to OpenRouter API...')
        addCompletedStage(GenerationStage.CALLING_LLM)

        const requestedMaxPages = Math.max(5, formData.maxPages || 0)

        const reportResult = (await Promise.race([
          callMCP('generate_project_report', {
            repoUrl: formData.repoUrl,
            maxPages: requestedMaxPages,
            extraPrompt: formData.extraPrompt,
            template: formData.template || '',
            markdownFiles,
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Generation timeout (30s)')), 30000)
          ),
        ])) as any

        // Stage: LLM_RECEIVED
        updateCurrentStage(GenerationStage.LLM_RECEIVED, 'Request received successfully by the LLM...')
        addCompletedStage(GenerationStage.LLM_RECEIVED)
        await new Promise(r => setTimeout(r, 300))

        // Stage: LLM_PROCESSING
        updateCurrentStage(GenerationStage.LLM_PROCESSING, 'Identifying the requirement and planning the response...')
        addCompletedStage(GenerationStage.LLM_PROCESSING)
        await new Promise(r => setTimeout(r, 500))

        // Stage: GENERATING_REPORT
        updateCurrentStage(GenerationStage.GENERATING_REPORT, 'Creating comprehensive project report...')
        addCompletedStage(GenerationStage.GENERATING_REPORT)
        await new Promise(r => setTimeout(r, 300))

        // Stage: STRUCTURING_REPORT
        updateCurrentStage(GenerationStage.STRUCTURING_REPORT, 'Organizing report with proper sections...')
        addCompletedStage(GenerationStage.STRUCTURING_REPORT)
        await new Promise(r => setTimeout(r, 300))

        // Stage: PARSING_RESPONSE
        updateCurrentStage(GenerationStage.PARSING_RESPONSE, 'Processing and validating LLM response...')
        if (!reportResult.result) {
          throw new Error('No content returned from LLM')
        }
        addCompletedStage(GenerationStage.PARSING_RESPONSE)
        await new Promise(r => setTimeout(r, 300))

        // Stage: SPLITTING_PAGES
        updateCurrentStage(GenerationStage.SPLITTING_PAGES, 'Dividing report into requested pages...')
        const reportContent = reportResult.result
        const pagesList = splitReportIntoPages(reportContent, requestedMaxPages)
        if (!pagesList || pagesList.length === 0) {
          throw new Error('Failed to split report into pages')
        }
        addCompletedStage(GenerationStage.SPLITTING_PAGES)
        await new Promise(r => setTimeout(r, 300))

        // Stage: RENDERING
        updateCurrentStage(GenerationStage.RENDERING, 'Preparing report for display...')
        setPages(pagesList)
        setPagesHtml(pagesList.map((page) => markdownToBasicHtml(page)))
        addCompletedStage(GenerationStage.RENDERING)
        await new Promise(r => setTimeout(r, 200))

        // Stage: COMPLETE
        updateCurrentStage(GenerationStage.COMPLETE, 'Report generated successfully! Redirecting to preview...')
        addCompletedStage(GenerationStage.COMPLETE)

        setTimeout(() => {
          router.push('/preview')
        }, 2000)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        setError(message)
        
        // Determine which stage failed
        const currentStage = generationStatus.currentStage
        setStageError(currentStage, message)
        
        toast({
          variant: 'destructive',
          title: 'Generation failed',
          description: `${GENERATION_STAGES[currentStage]?.label || 'Process'}: ${message}`,
        })

        setTimeout(() => router.push('/'), 3000)
      }
    }

    generateReport()
  }, [formData, router])

  const allStages = getAllStages()
  const isComplete = generationStatus.currentStage === GenerationStage.COMPLETE
  const hasError = generationStatus.currentStage === GenerationStage.ERROR

  return (
    <div className="min-h-screen bg-background landing-shell">
      <Navbar />

      <main className="pt-24 pb-12 px-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-2 text-foreground">Generating Report</h1>
            <p className="text-muted-foreground">
              {GENERATION_STAGES[generationStatus.currentStage]?.description || 'Processing...'}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8 space-y-3 glow-panel rounded-2xl p-5 slow-transition">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Overall Progress</span>
              <span className="text-sm text-muted-foreground">{generationStatus.progress}%</span>
            </div>
            <Progress value={generationStatus.progress} className="h-3" />
          </div>

          {/* Current Stage Card */}
          <div className="glow-panel rounded-2xl p-8 mb-8 slow-transition">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-4xl">
                {hasError ? '❌' : GENERATION_STAGES[generationStatus.currentStage]?.icon || '⏳'}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {GENERATION_STAGES[generationStatus.currentStage]?.label || 'Processing'}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {generationStatus.message}
                </p>
              </div>
              {!hasError && !isComplete && <Loader className="w-6 h-6 animate-spin ml-auto text-primary" />}
              {isComplete && <CheckCircle2 className="w-6 h-6 ml-auto text-green-500" />}
            </div>

            {/* Hint Text */}
            {GENERATION_STAGES[generationStatus.currentStage]?.hint && !hasError && (
              <p className="text-xs text-muted-foreground italic">
                💡 {GENERATION_STAGES[generationStatus.currentStage].hint}
              </p>
            )}

            {/* Error Display */}
            {hasError && generationStatus.stageError && (
              <div className="mt-4 p-4 bg-destructive/10 border border-destructive rounded-lg">
                <p className="text-sm font-semibold text-destructive mb-1">Error in {GENERATION_STAGES[generationStatus.stageError.stage]?.label}</p>
                <p className="text-sm text-destructive">{generationStatus.stageError.error}</p>
                <p className="text-xs text-muted-foreground mt-2">Redirecting home in 3 seconds...</p>
              </div>
            )}
          </div>

          {/* Stage Timeline */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Generation Timeline</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {allStages.map((stage, idx) => {
                const isCurrentStage = generationStatus.currentStage === stage
                const isCompleted = generationStatus.completedStages.includes(stage)
                const config = GENERATION_STAGES[stage]

                return (
                  <div
                    key={stage}
                    className={`p-3 rounded-xl border transition-all slow-transition ${
                      isCurrentStage
                        ? 'glow-panel border-emerald-300/40'
                        : isCompleted
                          ? 'glow-panel border-emerald-400/50'
                          : 'glow-panel'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold bg-background border">
                        {isCompleted ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-foreground">{config.label}</p>
                        <p className="text-xs text-muted-foreground">{config.description}</p>
                      </div>
                      {isCurrentStage && <Loader className="w-4 h-4 animate-spin text-primary" />}
                      {isCompleted && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Footer Message */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground text-sm">
              {hasError
                ? '⚠️ An error occurred. Please check the details above.'
                : isComplete
                  ? '✨ Redirecting to preview in 2 seconds...'
                  : '⏳ Please wait while we generate your report...'}
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
