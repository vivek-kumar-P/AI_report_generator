import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function markdownToBasicHtml(markdown: string): string {
  if (!markdown) return '<p></p>'

  let html = markdown

  // Escape any raw HTML to prevent XSS except we want to keep structure
  // Process line by line for better control
  const lines = html.split('\n')
  const result: string[] = []
  let inCodeBlock = false
  let inTable = false
  let tableRows: string[] = []
  let inBlockquote = false

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]

    // Code blocks
    if (line.trim().startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true
        const lang = line.trim().slice(3).trim()
        result.push(`<pre style="background:#1e293b;color:#e2e8f0;padding:12px;border-radius:6px;overflow-x:auto;font-family:monospace;font-size:13px;margin:8px 0;"><code${lang ? ` class="language-${lang}"` : ''}>`)
      } else {
        inCodeBlock = false
        result.push('</code></pre>')
      }
      continue
    }

    if (inCodeBlock) {
      result.push(line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'))
      continue
    }

    // Tables
    if (line.trim().startsWith('|')) {
      if (!inTable) {
        inTable = true
        tableRows = []
      }
      tableRows.push(line)
      // Check if next line is not a table row
      const nextLine = lines[i + 1] || ''
      if (!nextLine.trim().startsWith('|')) {
        // Render table
        result.push(renderTable(tableRows))
        inTable = false
        tableRows = []
      }
      continue
    }

    // Headings
    if (line.startsWith('### ')) {
      result.push(`<h3 style="font-size:16px;font-weight:700;margin:14px 0 6px;color:#1e293b;">${inlineMarkdown(line.slice(4))}</h3>`)
      continue
    }
    if (line.startsWith('## ')) {
      result.push(`<h2 style="font-size:20px;font-weight:700;margin:18px 0 8px;color:#1e293b;border-bottom:1px solid #e2e8f0;padding-bottom:4px;">${inlineMarkdown(line.slice(3))}</h2>`)
      continue
    }
    if (line.startsWith('# ')) {
      result.push(`<h1 style="font-size:26px;font-weight:800;margin:20px 0 10px;color:#0f172a;">${inlineMarkdown(line.slice(2))}</h1>`)
      continue
    }

    // Horizontal rule
    if (line.trim() === '---' || line.trim() === '***' || line.trim() === '___') {
      result.push('<hr style="border:none;border-top:1px solid #cbd5e1;margin:16px 0;" />')
      continue
    }

    // Unordered lists
    if (line.match(/^[\s]*[-*+] /)) {
      const indent = line.match(/^(\s*)/)?.[1]?.length || 0
      const content = line.replace(/^[\s]*[-*+] /, '')
      const paddingLeft = 20 + indent * 10
      result.push(`<li style="margin:3px 0;padding-left:${paddingLeft}px;list-style-type:disc;">${inlineMarkdown(content)}</li>`)
      continue
    }

    // Ordered lists
    if (line.match(/^[\s]*\d+\. /)) {
      const content = line.replace(/^[\s]*\d+\. /, '')
      result.push(`<li style="margin:3px 0;padding-left:20px;list-style-type:decimal;">${inlineMarkdown(content)}</li>`)
      continue
    }

    // Blockquote
    if (line.startsWith('> ')) {
      result.push(`<blockquote style="border-left:4px solid #94a3b8;padding:4px 12px;margin:8px 0;color:#475569;font-style:italic;">${inlineMarkdown(line.slice(2))}</blockquote>`)
      continue
    }

    // Empty line
    if (line.trim() === '') {
      result.push('<br/>')
      continue
    }

    // Normal paragraph
    result.push(`<p style="margin:4px 0;line-height:1.7;">${inlineMarkdown(line)}</p>`)
  }

  return result.join('\n')
}

function inlineMarkdown(text: string): string {
  if (!text) return ''

  return text
    // Bold italic
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    // Strikethrough
    .replace(/~~(.*?)~~/g, '<s>$1</s>')
    // Inline code
    .replace(/`(.*?)`/g, '<code style="background:#f1f5f9;padding:1px 5px;border-radius:3px;font-family:monospace;font-size:13px;color:#0f172a;">$1</code>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#3b82f6;text-decoration:underline;" target="_blank">$1</a>')
    // Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:4px;" />')
}

function renderTable(rows: string[]): string {
  const parseRow = (row: string) =>
    row.split('|').filter((_, i, arr) => i > 0 && i < arr.length - 1).map(cell => cell.trim())

  const filteredRows = rows.filter(r => !r.trim().match(/^\|[\s\-|]+\|$/))

  if (filteredRows.length === 0) return ''

  const headerRow = filteredRows[0]
  const bodyRows = filteredRows.slice(1)

  const headers = parseRow(headerRow)
  const headerHtml = headers.map(h =>
    `<th style="border:1px solid #cbd5e1;padding:8px 12px;background:#f8fafc;font-weight:700;text-align:left;font-size:13px;">${inlineMarkdown(h)}</th>`
  ).join('')

  const bodyHtml = bodyRows.map(row => {
    const cells = parseRow(row)
    const cellsHtml = cells.map(c =>
      `<td style="border:1px solid #cbd5e1;padding:6px 12px;font-size:13px;">${inlineMarkdown(c)}</td>`
    ).join('')
    return `<tr>${cellsHtml}</tr>`
  }).join('')

  return `<table style="border-collapse:collapse;width:100%;margin:12px 0;font-size:14px;">
    <thead><tr>${headerHtml}</tr></thead>
    <tbody>${bodyHtml}</tbody>
  </table>`
}

export function splitReportIntoPages(content: string, maxPages: number = 10): string[] {
  if (!content) return ['']

  // Split by explicit page breaks first
  const explicitPages = content.split(/\n---PAGE BREAK---\n|\n\n---\n\n(?=#{1,2} )/g)

  if (explicitPages.length > 1) {
    return explicitPages.slice(0, maxPages)
  }

  // Split by major headings (# Heading)
  const sections = content.split(/(?=^# )/m).filter(s => s.trim())

  if (sections.length <= maxPages) {
    // Not enough sections — group by character count
    const pages: string[] = []
    const charsPerPage = Math.ceil(content.length / maxPages)
    let current = ''

    const lines = content.split('\n')
    for (const line of lines) {
      current += line + '\n'
      if (current.length >= charsPerPage && (line.startsWith('#') || line.trim() === '')) {
        pages.push(current.trim())
        current = ''
        if (pages.length >= maxPages - 1) break
      }
    }

    if (current.trim()) pages.push(current.trim())
    return pages.slice(0, maxPages)
  }

  // Too many sections — group them into maxPages buckets
  const pages: string[] = []
  const sectionsPerPage = Math.ceil(sections.length / maxPages)

  for (let i = 0; i < sections.length; i += sectionsPerPage) {
    pages.push(sections.slice(i, i + sectionsPerPage).join('\n\n'))
    if (pages.length >= maxPages) break
  }

  return pages

}

export function identifyFeedbackTarget(feedback: string, pages: string[]): { pageIndex: number; section: string } {
  const feedbackLower = feedback.toLowerCase()

  // Try to find which page the feedback refers to
  for (let i = 0; i < pages.length; i++) {
    const pageContent = pages[i].toLowerCase()

    // Check if feedback mentions specific keywords from this page
    const pageWords = pageContent.split(/\s+/).filter(w => w.length > 5)
    const mentionedWords = pageWords.filter(w => feedbackLower.includes(w))

    if (mentionedWords.length > 2) {
      return { pageIndex: i, section: pages[i] }
    }
  }

  // Default to first page if no match
  return { pageIndex: 0, section: pages[0] }
}