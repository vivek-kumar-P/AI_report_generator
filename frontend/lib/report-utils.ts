import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const CHARS_PER_PAGE = 1800
const MIN_PAGE_CHARS = 400 // pages below this get merged with next

export function splitReportIntoPages(content: string, maxPages: number = 10): string[] {
  if (!content || content.trim() === '') return ['']

  const normalized = content.replace(/\r\n/g, '\n').trim()

  // Split at every top-level OR second-level heading
  const rawSections = normalized
    .split(/(?=^#{1,2} )/m)
    .map(s => s.trim())
    .filter(s => s.length > 0)

  if (rawSections.length === 0) return splitByCharCount(normalized, maxPages)
  if (rawSections.length === 1) return splitByCharCount(normalized, maxPages)

  const totalWeight = rawSections.reduce((sum, s) => sum + s.length, 0)
  const targetWeight = Math.ceil(totalWeight / maxPages)

  // Greedily bin sections into pages
  const pages: string[] = []
  let currentBin: string[] = []
  let currentWeight = 0

  for (let i = 0; i < rawSections.length; i++) {
    const section = rawSections[i]

    if (
      currentWeight + section.length > targetWeight &&
      currentBin.length > 0 &&
      pages.length < maxPages - 1
    ) {
      pages.push(currentBin.join('\n\n'))
      currentBin = []
      currentWeight = 0
    }

    currentBin.push(section)
    currentWeight += section.length
  }

  if (currentBin.length > 0) {
    pages.push(currentBin.join('\n\n'))
  }

  // ── Merge tiny pages (under MIN_PAGE_CHARS) with the next page ──
  // Do multiple passes until no tiny pages remain
  let merged = true
  while (merged && pages.length > 1) {
    merged = false
    for (let i = 0; i < pages.length - 1; i++) {
      if (pages[i].length < MIN_PAGE_CHARS) {
        // merge page i into page i+1
        pages.splice(i, 2, pages[i] + '\n\n' + pages[i + 1])
        merged = true
        break
      }
    }
  }

  // If last page is tiny, merge it with the previous page
  while (pages.length > 1 && pages[pages.length - 1].length < MIN_PAGE_CHARS) {
    const last = pages.pop()!
    pages[pages.length - 1] += '\n\n' + last
  }

  // If we have too many pages, merge smallest adjacent pair
  while (pages.length > maxPages) {
    let minIdx = 0
    let minWeight = pages[0].length + pages[1].length
    for (let i = 1; i < pages.length - 1; i++) {
      const w = pages[i].length + pages[i + 1].length
      if (w < minWeight) { minWeight = w; minIdx = i }
    }
    pages.splice(minIdx, 2, pages[minIdx] + '\n\n' + pages[minIdx + 1])
  }

  return pages.slice(0, maxPages)
}

function splitByCharCount(content: string, maxPages: number): string[] {
  const lines = content.split('\n')
  const targetChars = Math.ceil(content.length / maxPages)
  const pages: string[] = []
  let current = ''

  for (const line of lines) {
    current += line + '\n'
    if (current.length >= targetChars && pages.length < maxPages - 1) {
      pages.push(current.trim())
      current = ''
    }
  }

  if (current.trim()) pages.push(current.trim())
  return pages
}

// ─── Markdown → HTML ──────────────────────────────────────────

export function markdownToBasicHtml(markdown: string): string {
  if (!markdown) return '<p></p>'

  const lines = markdown.split('\n')
  const result: string[] = []
  let inCodeBlock = false
  let codeLines: string[] = []
  let inTable = false
  let tableRows: string[] = []
  let listBuffer: string[] = []
  let listType: 'ul' | 'ol' | null = null

  const flushList = () => {
    if (listBuffer.length === 0) return
    const tag = listType === 'ol' ? 'ol' : 'ul'
    result.push(`<${tag}>${listBuffer.join('')}</${tag}>`)
    listBuffer = []
    listType = null
  }

  const flushTable = () => {
    if (tableRows.length === 0) return
    result.push(renderTable(tableRows))
    tableRows = []
    inTable = false
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.trim().startsWith('```')) {
      if (!inCodeBlock) {
        flushList()
        inCodeBlock = true
        codeLines = []
      } else {
        inCodeBlock = false
        const escaped = codeLines.join('\n')
          .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        result.push(`<pre><code>${escaped}</code></pre>`)
        codeLines = []
      }
      continue
    }
    if (inCodeBlock) { codeLines.push(line); continue }

    if (line.trim().startsWith('|')) {
      flushList()
      inTable = true
      tableRows.push(line)
      if (!(lines[i + 1] || '').trim().startsWith('|')) flushTable()
      continue
    }
    if (inTable) flushTable()

    if (line.startsWith('# '))    { flushList(); result.push(`<h1>${inline(line.slice(2))}</h1>`); continue }
    if (line.startsWith('## '))   { flushList(); result.push(`<h2>${inline(line.slice(3))}</h2>`); continue }
    if (line.startsWith('### '))  { flushList(); result.push(`<h3>${inline(line.slice(4))}</h3>`); continue }
    if (line.startsWith('#### ')) { flushList(); result.push(`<h4>${inline(line.slice(5))}</h4>`); continue }

    if (/^[-*_]{3,}$/.test(line.trim())) { flushList(); result.push('<hr/>'); continue }

    if (line.startsWith('> ')) {
      flushList()
      result.push(`<blockquote>${inline(line.slice(2))}</blockquote>`)
      continue
    }

    if (/^[ \t]*[-*+] /.test(line)) {
      if (listType !== 'ul') { flushList(); listType = 'ul' }
      listBuffer.push(`<li>${inline(line.replace(/^[ \t]*[-*+] /, ''))}</li>`)
      continue
    }

    if (/^[ \t]*\d+\. /.test(line)) {
      if (listType !== 'ol') { flushList(); listType = 'ol' }
      listBuffer.push(`<li>${inline(line.replace(/^[ \t]*\d+\. /, ''))}</li>`)
      continue
    }

    if (line.trim() === '') {
      flushList()
      result.push('<p style="margin:0;height:6px;"></p>')
      continue
    }

    flushList()
    result.push(`<p>${inline(line)}</p>`)
  }

  flushList()
  flushTable()
  return result.join('\n')
}

function inline(text: string): string {
  if (!text) return ''
  return text
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    .replace(/~~(.*?)~~/g, '<s>$1</s>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:4px;"/>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
}

function renderTable(rows: string[]): string {
  const isDelimiter = (r: string) => /^\|[\s\-|:]+\|$/.test(r.trim())
  const dataRows = rows.filter(r => !isDelimiter(r))
  if (dataRows.length === 0) return ''

  const parse = (row: string) => row.split('|').slice(1, -1).map(c => c.trim())
  const headers = parse(dataRows[0])
  const body = dataRows.slice(1)

  const headHtml = headers.map(h => `<th>${inline(h)}</th>`).join('')
  const bodyHtml = body.map(row => {
    const cells = parse(row)
    return `<tr>${cells.map(c => `<td>${inline(c)}</td>`).join('')}</tr>`
  }).join('')

  return `<table><thead><tr>${headHtml}</tr></thead><tbody>${bodyHtml}</tbody></table>`
}

// ─── Feedback target ──────────────────────────────────────────

export function identifyFeedbackTarget(
  feedback: string,
  pages: string[]
): { pageIndex: number; section: string } {
  const fbLower = feedback.toLowerCase()

  const pageMatch = fbLower.match(/page\s*(\d+)/)
  if (pageMatch) {
    const idx = parseInt(pageMatch[1]) - 1
    if (idx >= 0 && idx < pages.length) return { pageIndex: idx, section: pages[idx] }
  }

  const keywords = ['title', 'introduction', 'methodology', 'findings', 'conclusion', 'recommendation', 'abstract', 'summary', 'appendix', 'reference', 'discussion']
  for (const kw of keywords) {
    if (fbLower.includes(kw)) {
      for (let i = 0; i < pages.length; i++) {
        if (pages[i].toLowerCase().includes(kw)) return { pageIndex: i, section: pages[i] }
      }
    }
  }

  let bestPage = 0
  let bestScore = 0
  const fbWords = fbLower.split(/\s+/).filter(w => w.length > 4)
  for (let i = 0; i < pages.length; i++) {
    const score = fbWords.filter(w => pages[i].toLowerCase().includes(w)).length
    if (score > bestScore) { bestScore = score; bestPage = i }
  }

  return { pageIndex: bestPage, section: pages[bestPage] }
}