import { create } from 'zustand'
import { GenerationStage, TOTAL_STAGES } from './generation-stages'

export interface FormData {
  repoUrl: string
  template: string
  maxPages: number
  extraPrompt: string
  advancedCustomization: boolean
  uploadedFile?: File | null
  extractedFiles?: Array<{path: string, content: string}>
}

export interface GenerationStatus {
  status: 'idle' | 'fetching' | 'processing' | 'complete' | 'error'
  currentStage: GenerationStage
  completedStages: GenerationStage[]
  currentPage: number
  totalPages: number
  message: string
  progress: number
  stageError?: {
    stage: GenerationStage
    error: string
    timestamp: number
  }
}

export interface ReportState {
  formData: FormData | null
  isFormOpen: boolean
  isLoading: boolean
  error: string | null
  pages: string[]
  pagesHtml: string[]
  currentPageIndex: number
  generationStatus: GenerationStatus

  // Actions
  setFormOpen: (open: boolean) => void
  setFormData: (data: FormData) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setPages: (pages: string[]) => void
  setPagesHtml: (pagesHtml: string[]) => void
  setPageHtml: (index: number, html: string) => void
  setCurrentPageIndex: (index: number) => void
  updateGenerationStatus: (status: Partial<GenerationStatus>) => void
  updateCurrentStage: (stage: GenerationStage, message?: string) => void
  addCompletedStage: (stage: GenerationStage) => void
  setStageError: (stage: GenerationStage, error: string) => void
  addPageToGeneration: (page: string) => void
  resetState: () => void
}

const initialFormData: FormData = {
  repoUrl: '',
  template: '',
  maxPages: 10,
  extraPrompt: '',
  advancedCustomization: false,
}

const initialGenerationStatus: GenerationStatus = {
  status: 'idle',
  currentStage: GenerationStage.IDLE,
  completedStages: [],
  currentPage: 0,
  totalPages: 0,
  message: '',
  progress: 0,
}

export const useReportStore = create<ReportState>((set) => ({
  formData: null,
  isFormOpen: false,
  isLoading: false,
  error: null,
  pages: [],
  pagesHtml: [],
  currentPageIndex: 0,
  generationStatus: initialGenerationStatus,

  setFormOpen: (open) => set({ isFormOpen: open }),
  setFormData: (data) => set({ formData: data }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setPages: (pages) => set({ pages }),
  setPagesHtml: (pagesHtml) => set({ pagesHtml }),
  setPageHtml: (index, html) =>
    set((state) => {
      const next = [...state.pagesHtml]
      next[index] = html
      return { pagesHtml: next }
    }),
  setCurrentPageIndex: (index) => set({ currentPageIndex: index }),
  
  updateGenerationStatus: (status) =>
    set((state) => ({
      generationStatus: { ...state.generationStatus, ...status },
    })),
  
  updateCurrentStage: (stage: GenerationStage, message?: string) =>
    set((state) => ({
      generationStatus: {
        ...state.generationStatus,
        currentStage: stage,
        message: message || state.generationStatus.message,
        status:
          stage === GenerationStage.ERROR
            ? 'error'
            : stage === GenerationStage.COMPLETE
              ? 'complete'
              : 'processing',
      },
    })),
  
  addCompletedStage: (stage: GenerationStage) =>
    set((state) => {
      const completedStages = [...state.generationStatus.completedStages]
      if (!completedStages.includes(stage)) {
        completedStages.push(stage)
      }
      return {
        generationStatus: {
          ...state.generationStatus,
          completedStages,
          progress: Math.round((completedStages.length / TOTAL_STAGES) * 100),
        },
      }
    }),
  
  setStageError: (stage: GenerationStage, error: string) =>
    set((state) => ({
      generationStatus: {
        ...state.generationStatus,
        currentStage: GenerationStage.ERROR,
        status: 'error',
        stageError: {
          stage,
          error,
          timestamp: Date.now(),
        },
      },
    })),
  
  addPageToGeneration: (page: string) =>
    set((state) => ({
      pages: [...state.pages, page],
      generationStatus: {
        ...state.generationStatus,
        currentPage: state.pages.length + 1,
        progress: Math.round(((state.pages.length + 1) / state.generationStatus.totalPages) * 100),
      },
    })),
  
  resetState: () =>
    set({
      formData: null,
      isFormOpen: false,
      isLoading: false,
      error: null,
      pages: [],
      pagesHtml: [],
      currentPageIndex: 0,
      generationStatus: initialGenerationStatus,
    }),
}))
