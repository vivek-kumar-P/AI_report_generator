'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { useReportStore, FormData } from '@/lib/store'
import { AlertCircle, Upload, CheckCircle2, Loader, AlertTriangle } from 'lucide-react'
import { validateGitHubUrlRealtime, checkGitHubRepoExists } from '@/lib/github-validator'
import { useToast } from '@/hooks/use-toast'

interface FormDialogProps {
  isOpen: boolean
  onClose: () => void
}

interface ValidationState {
  status: 'idle' | 'validating' | 'valid' | 'invalid'
  message?: string
  type?: 'error' | 'warning' | 'success'
}

export default function FormDialog({ isOpen, onClose }: FormDialogProps) {
  const router = useRouter()
  const { setFormData, setLoading, setError, setPages } = useReportStore()
  const { toast } = useToast()
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [urlValidation, setUrlValidation] = useState<ValidationState>({ status: 'idle' })
  const [isChecking, setIsChecking] = useState(false)
  const [formState, setFormState] = useState<FormData>({
    repoUrl: '',
    template: '',
    maxPages: 10,
    extraPrompt: '',
    advancedCustomization: false,
  })

  // Real-time GitHub URL validation
  useEffect(() => {
    if (!formState.repoUrl.trim()) {
      setUrlValidation({ status: 'idle' })
      return
    }

    // Quick format validation
    const formatResult = validateGitHubUrlRealtime(formState.repoUrl)
    
    if (!formatResult.isValid) {
      setUrlValidation({
        status: 'invalid',
        message: formatResult.error,
        type: 'error'
      })
      return
    }

    if (formatResult.warning) {
      setUrlValidation({
        status: 'valid',
        message: formatResult.warning,
        type: 'warning'
      })
      return
    }

    // Format is valid, now check if repo exists
    const checkRepo = async () => {
      setUrlValidation({ status: 'validating' })
      setIsChecking(true)

      try {
        const urlMatch = formState.repoUrl.match(/github\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_.-]+)/)
        if (urlMatch) {
          const [, owner, repo] = urlMatch
          const result = await checkGitHubRepoExists(owner, repo)

          if (result.isValid) {
            setUrlValidation({
              status: 'valid',
              message: '✓ Repository found and ready',
              type: 'success'
            })
          } else {
            setUrlValidation({
              status: 'invalid',
              message: result.error,
              type: 'error'
            })
          }
        }
      } catch (error) {
        console.error('[Form] Validation error:', error)
        setUrlValidation({
          status: 'invalid',
          message: 'Unable to validate repository',
          type: 'error'
        })
      } finally {
        setIsChecking(false)
      }
    }

    const timer = setTimeout(checkRepo, 500) // Debounce
    return () => clearTimeout(timer)
  }, [formState.repoUrl])

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formState.repoUrl.trim()) {
      errors.repoUrl = 'Repository URL is required'
    } else if (urlValidation.status !== 'valid') {
      errors.repoUrl = urlValidation.message || 'Please enter a valid GitHub repository URL'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setFormData(formState)
    
    // Close dialog and navigate to generate
    onClose()
    router.push('/generate')
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="glass-morphism w-full max-w-2xl h-[90vh] rounded-2xl border border-white/10 bg-slate-900/80 shadow-2xl backdrop-blur-xl dark:bg-slate-950/80 flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Fixed Header */}
            <div className="px-8 pt-8 pb-4 border-b border-white/10 flex-shrink-0">
              <h2 className="text-3xl font-bold text-foreground">Generate Report</h2>
              <p className="mt-2 text-muted-foreground">
                Fill in your project details to get started
              </p>
            </div>

            {/* Scrollable Form Content */}
            <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto flex-1 px-8 py-6">
              {/* GitHub URL */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-2 flex items-center gap-2">
                  GitHub Repository URL
                  <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Input
                    placeholder="https://github.com/owner/repo"
                    type="url"
                    value={formState.repoUrl}
                    onChange={(e) => {
                      setFormState((prev) => ({ ...prev, repoUrl: e.target.value }))
                      if (formErrors.repoUrl) setFormErrors((prev) => ({ ...prev, repoUrl: '' }))
                    }}
                    className={`hover-glow ${
                      urlValidation.status === 'valid'
                        ? 'border-green-500/50 focus:border-green-400'
                        : urlValidation.status === 'invalid'
                        ? 'border-red-500/50 focus:border-red-400'
                        : ''
                    } pr-10`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isChecking ? (
                      <Loader className="w-4 h-4 text-blue-400 animate-spin" />
                    ) : urlValidation.status === 'valid' ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : urlValidation.status === 'invalid' ? (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    ) : null}
                  </div>
                </div>
                
                {urlValidation.message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center gap-2 mt-2 text-sm ${
                      urlValidation.type === 'error'
                        ? 'text-red-400'
                        : urlValidation.type === 'warning'
                        ? 'text-yellow-400'
                        : 'text-green-400'
                    }`}
                  >
                    {urlValidation.type === 'error' && <AlertCircle className="w-4 h-4" />}
                    {urlValidation.type === 'warning' && <AlertTriangle className="w-4 h-4" />}
                    {urlValidation.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
                    {urlValidation.message}
                  </motion.div>
                )}

                <p className="text-xs text-muted-foreground mt-3 bg-muted/20 p-2 rounded">
                  💡 Enter your GitHub repository URL. The repository must have files and folders.
                </p>
              </div>

              {/* File Upload */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Upload Files (Optional)
                </label>
                <div className="relative border-2 border-dashed border-primary/30 hover-glow rounded-lg p-6 bg-primary/5 hover:bg-primary/10 transition-all cursor-pointer group">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".zip,.tar.gz"
                  />
                  <div className="flex flex-col items-center gap-2 text-center">
                    <Upload className="w-6 h-6 text-primary group-hover:text-primary/80 transition-colors" />
                    <p className="text-sm font-medium text-foreground">
                      {uploadedFile ? (
                        <span className="text-green-400 flex items-center gap-1 justify-center">
                          <CheckCircle2 className="w-4 h-4" />
                          {uploadedFile.name}
                        </span>
                      ) : (
                        'Drag & drop or click'
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">ZIP or TAR.GZ files</p>
                  </div>
                </div>
              </div>

              {/* Template */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Template or Structure (Optional)
                </label>
                <textarea
                  placeholder="Enter your preferred report structure in markdown..."
                  value={formState.template}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, template: e.target.value }))
                  }
                  className="w-full border border-input rounded-md bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none h-20"
                />
              </div>

              {/* Max Pages Slider */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-3">
                  Maximum Pages: <span className="text-blue-400">{formState.maxPages}</span>
                </label>
                <Slider
                  value={[formState.maxPages]}
                  onValueChange={(value) =>
                    setFormState((prev) => ({ ...prev, maxPages: value[0] }))
                  }
                  min={5}
                  max={50}
                  step={1}
                />
                <p className="text-xs text-muted-foreground mt-2">Range: 5–50 pages</p>
              </div>

              {/* Extra Prompt */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Additional Instructions (Optional)
                </label>
                <textarea
                  placeholder="Tell AI what to focus on..."
                  value={formState.extraPrompt}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, extraPrompt: e.target.value }))
                  }
                  className="w-full border border-input rounded-md bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none h-16"
                />
              </div>

              {/* Checkbox */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formState.advancedCustomization}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      advancedCustomization: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 rounded border-input"
                />
                <span className="text-sm text-foreground">
                  Enable advanced customization after generation
                </span>
              </label>

            </form>

            {/* Fixed Action Buttons */}
            <div className="px-8 py-6 border-t border-white/10 bg-slate-900/40 flex gap-3 flex-shrink-0 backdrop-blur">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 hover-glow"
                disabled={isChecking}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isChecking || urlValidation.status !== 'valid'}
                className="flex-1 btn-glow bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSubmit}
              >
                {isChecking ? (
                  <span className="flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    Validating...
                  </span>
                ) : (
                  'Generate Report'
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
