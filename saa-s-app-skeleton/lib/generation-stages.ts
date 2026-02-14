/**
 * Generation Stages Configuration
 * Defines all stages of report generation with descriptions and error handling
 */

export enum GenerationStage {
  IDLE = 'idle',
  PREPARING = 'preparing',
  FETCHING_REPO = 'fetching_repo',
  SCANNING_FILES = 'scanning_files',
  EXTRACTING_INFO = 'extracting_info',
  CALLING_MCP = 'calling_mcp',
  PREPARING_LLM = 'preparing_llm',
  CALLING_LLM = 'calling_llm',
  LLM_RECEIVED = 'llm_received',
  LLM_PROCESSING = 'llm_processing',
  GENERATING_REPORT = 'generating_report',
  STRUCTURING_REPORT = 'structuring_report',
  PARSING_RESPONSE = 'parsing_response',
  SPLITTING_PAGES = 'splitting_pages',
  RENDERING = 'rendering',
  COMPLETE = 'complete',
  ERROR = 'error',
}

export interface StageConfig {
  id: GenerationStage
  label: string
  description: string
  percentage: number
  icon: string
  hint?: string
}

export const GENERATION_STAGES: Record<GenerationStage, StageConfig> = {
  [GenerationStage.IDLE]: {
    id: GenerationStage.IDLE,
    label: 'Ready',
    description: 'Waiting to start',
    percentage: 0,
    icon: '⏳',
  },
  [GenerationStage.PREPARING]: {
    id: GenerationStage.PREPARING,
    label: 'Preparing',
    description: 'Initializing generation process',
    percentage: 5,
    icon: '⚙️',
  },
  [GenerationStage.FETCHING_REPO]: {
    id: GenerationStage.FETCHING_REPO,
    label: 'Fetching Repository',
    description: 'Downloading repository data from GitHub',
    percentage: 10,
    icon: '📥',
    hint: 'Connecting to GitHub API...',
  },
  [GenerationStage.SCANNING_FILES]: {
    id: GenerationStage.SCANNING_FILES,
    label: 'Scanning Files',
    description: 'Identifying markdown files in the repository',
    percentage: 20,
    icon: '🔍',
    hint: 'Finding .md, .markdown files...',
  },
  [GenerationStage.EXTRACTING_INFO]: {
    id: GenerationStage.EXTRACTING_INFO,
    label: 'Extracting Info',
    description: 'Extracting important information from files',
    percentage: 30,
    icon: '✂️',
    hint: 'Parsing markdown content...',
  },
  [GenerationStage.CALLING_MCP]: {
    id: GenerationStage.CALLING_MCP,
    label: 'Calling MCP',
    description: 'Invoking MCP tools for file scanning',
    percentage: 35,
    icon: '🔗',
    hint: 'Communicating with MCP server...',
  },
  [GenerationStage.PREPARING_LLM]: {
    id: GenerationStage.PREPARING_LLM,
    label: 'Preparing LLM Request',
    description: 'Preparing prompt and context for LLM',
    percentage: 45,
    icon: '📝',
    hint: 'Building comprehensive prompt...',
  },
  [GenerationStage.CALLING_LLM]: {
    id: GenerationStage.CALLING_LLM,
    label: 'Calling LLM API',
    description: 'Calling LLM using your API key (OpenRouter)',
    percentage: 50,
    icon: '🤖',
    hint: 'Contacting GPT-3.5-Turbo...',
  },
  [GenerationStage.LLM_RECEIVED]: {
    id: GenerationStage.LLM_RECEIVED,
    label: 'Request Received',
    description: 'Request received successfully by the LLM',
    percentage: 55,
    icon: '✓',
    hint: 'LLM processing your request...',
  },
  [GenerationStage.LLM_PROCESSING]: {
    id: GenerationStage.LLM_PROCESSING,
    label: 'Identifying Requirements',
    description: 'LLM identifying the requirement and planning the response',
    percentage: 65,
    icon: '⚡',
    hint: 'AI thinking and writing...',
  },
  [GenerationStage.GENERATING_REPORT]: {
    id: GenerationStage.GENERATING_REPORT,
    label: 'Generating Report',
    description: 'Creating comprehensive project report',
    percentage: 75,
    icon: '📄',
    hint: 'Writing professional report...',
  },
  [GenerationStage.STRUCTURING_REPORT]: {
    id: GenerationStage.STRUCTURING_REPORT,
    label: 'Structuring Report',
    description: 'Organizing report with proper sections',
    percentage: 80,
    icon: '🏗️',
    hint: 'Adding structure and formatting...',
  },
  [GenerationStage.PARSING_RESPONSE]: {
    id: GenerationStage.PARSING_RESPONSE,
    label: 'Parsing Response',
    description: 'Processing and validating LLM response',
    percentage: 85,
    icon: '🔄',
    hint: 'Validating markdown format...',
  },
  [GenerationStage.SPLITTING_PAGES]: {
    id: GenerationStage.SPLITTING_PAGES,
    label: 'Splitting into Pages',
    description: 'Dividing report into requested pages',
    percentage: 90,
    icon: '📑',
    hint: 'Creating multi-page format...',
  },
  [GenerationStage.RENDERING]: {
    id: GenerationStage.RENDERING,
    label: 'Rendering Report',
    description: 'Preparing report for display',
    percentage: 95,
    icon: '🎨',
    hint: 'Rendering preview...',
  },
  [GenerationStage.COMPLETE]: {
    id: GenerationStage.COMPLETE,
    label: 'Report Generated Successfully',
    description: 'Report generated successfully and ready to view',
    percentage: 100,
    icon: '✨',
    hint: 'Redirecting to preview...',
  },
  [GenerationStage.ERROR]: {
    id: GenerationStage.ERROR,
    label: 'Error',
    description: 'An error occurred during generation',
    percentage: 0,
    icon: '❌',
  },
}

/**
 * Get stage Config by ID
 */
export function getStageConfig(stage: GenerationStage): StageConfig {
  return GENERATION_STAGES[stage] || GENERATION_STAGES[GenerationStage.IDLE]
}

/**
 * Get all stages in order
 */
export function getAllStages(): GenerationStage[] {
  return [
    GenerationStage.PREPARING,
    GenerationStage.FETCHING_REPO,
    GenerationStage.SCANNING_FILES,
    GenerationStage.EXTRACTING_INFO,
    GenerationStage.CALLING_MCP,
    GenerationStage.PREPARING_LLM,
    GenerationStage.CALLING_LLM,
    GenerationStage.LLM_RECEIVED,
    GenerationStage.LLM_PROCESSING,
    GenerationStage.GENERATING_REPORT,
    GenerationStage.STRUCTURING_REPORT,
    GenerationStage.PARSING_RESPONSE,
    GenerationStage.SPLITTING_PAGES,
    GenerationStage.RENDERING,
    GenerationStage.COMPLETE,
  ]
}

export const TOTAL_STAGES = getAllStages().length

/**
 * Check if a stage is complete
 */
export function isStageComplete(stage: GenerationStage, completedStages: GenerationStage[]): boolean {
  return completedStages.includes(stage)
}

/**
 * Check if a stage is current
 */
export function isStageCurrent(stage: GenerationStage, currentStage: GenerationStage): boolean {
  return stage === currentStage
}
