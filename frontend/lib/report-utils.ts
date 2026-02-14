/**
 * Utility functions for report generation and pagination
 */

/**
 * Split report content into multiple pages based on character count and max pages
 */
export function splitReportIntoPages(content: string, maxPages: number): string[] {
  const minPages = 5
  const effectiveMaxPages = Math.max(maxPages || 0, minPages)
  if (!content) return ['']

  // Estimate characters per page (A4 at readable size)
  const adaptiveCharsPerPage = Math.max(1600, Math.min(2400, Math.ceil(content.length / effectiveMaxPages)))
  const charsPerPage = adaptiveCharsPerPage

  // Split by headers first to respect structure
  const sections = content.split(/(?=^#{1,3}\s)/m)

  const pages: string[] = []
  let currentPage = ''
  let currentPageCount = 0

  for (const section of sections) {
    const sectionLength = section.length

    // If adding this section would exceed limit and we haven't hit max pages
    if (currentPageCount + sectionLength > charsPerPage && currentPage && pages.length < effectiveMaxPages) {
      pages.push(currentPage.trim())
      currentPage = section
      currentPageCount = sectionLength
    } else {
      currentPage += section
      currentPageCount += sectionLength
    }

    // If we've hit max pages, dump rest into last page
    if (pages.length === effectiveMaxPages - 1) {
      currentPage = [currentPage, ...sections.slice(sections.indexOf(section) + 1)].join('')
      break
    }
  }

  // Add final page
  if (currentPage.trim()) {
    pages.push(currentPage.trim())
  }

  // If no pages created, return original
  if (pages.length === 0) {
    pages.push(content)
  }

  let resultPages = pages.slice(0, effectiveMaxPages)

  // Fallback: if we still have fewer than min pages, split by paragraph length
  if (resultPages.length < minPages) {
    const targetLength = Math.max(1200, Math.floor(content.length / minPages))
    const chunks: string[] = []
    const paragraphs = content.split(/\n\n+/)
    let buffer = ''

    for (const paragraph of paragraphs) {
      if ((buffer + '\n\n' + paragraph).length > targetLength && buffer) {
        chunks.push(buffer.trim())
        buffer = paragraph
      } else {
        buffer = buffer ? `${buffer}\n\n${paragraph}` : paragraph
      }
    }

    if (buffer.trim()) {
      chunks.push(buffer.trim())
    }

    resultPages = chunks.slice(0, effectiveMaxPages)
  }

  return resultPages
}

/**
 * Identify which section/page a feedback request targets
 */
export function identifyFeedbackTarget(feedback: string, pages: string[]): {
  pageIndex: number
  section: string
  keywords: string[]
} {
  // Extract potential section keywords from feedback
  const keywords = feedback
    .toLowerCase()
    .match(/\b[a-z]{4,}\b/g)
    ?.slice(0, 5) || []

  let targetPageIndex = 0
  let maxMatches = 0

  // Find page with most keyword matches
  pages.forEach((page, idx) => {
    const pageText = page.toLowerCase()
    const matches = keywords.filter(k => pageText.includes(k)).length
    if (matches > maxMatches) {
      maxMatches = matches
      targetPageIndex = idx
    }
  })

  return {
    pageIndex: targetPageIndex,
    section: pages[targetPageIndex] || '',
    keywords,
  }
}

/**
 * Create a prompt for LLM to modify specific section
 */
export function createFeedbackPrompt(
  originalSection: string,
  feedback: string,
  fullContent: string
): string {
  return `
You are a document editor. The user has requested changes to a specific section of their project report.

ORIGINAL SECTION:
${originalSection}

USER FEEDBACK:
${feedback}

FULL DOCUMENT CONTEXT:
${fullContent.substring(0, 1000)}...

TASK:
- Understand what the user wants changed
- Modify ONLY the relevant section
- Maintain markdown formatting
- Keep the same level of detail
- Ensure it flows with the rest of the document
- Return ONLY the modified section, nothing else

Return the updated section in markdown format.
`
}

/**
 * Add page numbers and formatting to pages
 */
export function formatPagesWithMetadata(pages: string[], currentPage: number = 0): string[] {
  return pages.map((content, idx) => {
    // Add simple page indicator
    return content
  })
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * Minimal markdown-to-HTML conversion for editor initialization.
 * Keeps headings, lists, and paragraphs readable in TipTap.
 */
export function markdownToBasicHtml(markdown: string): string {
  if (!markdown) return ''

  const lines = markdown.split('\n')
  const htmlLines: string[] = []
  let inList = false

  for (const rawLine of lines) {
    const line = rawLine.trim()

    if (!line) {
      if (inList) {
        htmlLines.push('</ul>')
        inList = false
      }
      continue
    }

    if (line.startsWith('### ')) {
      htmlLines.push(`<h3>${escapeHtml(line.slice(4))}</h3>`)
      continue
    }
    if (line.startsWith('## ')) {
      htmlLines.push(`<h2>${escapeHtml(line.slice(3))}</h2>`)
      continue
    }
    if (line.startsWith('# ')) {
      htmlLines.push(`<h1>${escapeHtml(line.slice(2))}</h1>`)
      continue
    }

    if (line.startsWith('- ')) {
      if (!inList) {
        htmlLines.push('<ul>')
        inList = true
      }
      htmlLines.push(`<li>${escapeHtml(line.slice(2))}</li>`)
      continue
    }

    if (inList) {
      htmlLines.push('</ul>')
      inList = false
    }

    htmlLines.push(`<p>${escapeHtml(line)}</p>`)
  }

  if (inList) {
    htmlLines.push('</ul>')
  }

  return htmlLines.join('\n')
}
