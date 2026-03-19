import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer-core'
import puppeteerLocal from 'puppeteer'

export const runtime = 'nodejs'

function markdownToHtml(markdown: string): string {
  if (!markdown) return ''
  const lines = markdown.split('\n')
  const result: string[] = []
  let inCode = false
  let codeLines: string[] = []
  let inTable = false
  let tableRows: string[] = []
  let listBuf: string[] = []
  let listType: 'ul' | 'ol' | null = null

  const flushList = () => {
    if (!listBuf.length) return
    const tag = listType === 'ol' ? 'ol' : 'ul'
    result.push(`<${tag}>${listBuf.join('')}</${tag}>`)
    listBuf = []; listType = null
  }

  const flushTable = () => {
    if (!tableRows.length) return
    const isDelim = (r: string) => /^\|[\s\-|:]+\|$/.test(r.trim())
    const data = tableRows.filter(r => !isDelim(r))
    if (!data.length) { tableRows = []; inTable = false; return }
    const parse = (r: string) => r.split('|').slice(1, -1).map(c => c.trim())
    const heads = parse(data[0]).map(h => `<th>${h}</th>`).join('')
    const body = data.slice(1).map(r =>
      `<tr>${parse(r).map(c => `<td>${c}</td>`).join('')}</tr>`
    ).join('')
    result.push(`<table><thead><tr>${heads}</tr></thead><tbody>${body}</tbody></table>`)
    tableRows = []; inTable = false
  }

  const inline = (t: string) => t
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/~~(.*?)~~/g, '<s>$1</s>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      if (!inCode) { flushList(); inCode = true; codeLines = [] }
      else {
        inCode = false
        const esc = codeLines.join('\n').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
        result.push(`<pre><code>${esc}</code></pre>`)
        codeLines = []
      }
      continue
    }
    if (inCode) { codeLines.push(line); continue }

    if (line.trim().startsWith('|')) {
      flushList(); inTable = true; tableRows.push(line)
      if (!lines[lines.indexOf(line)+1]?.trim().startsWith('|')) flushTable()
      continue
    }
    if (inTable) flushTable()

    if (line.startsWith('# '))    { flushList(); result.push(`<h1>${inline(line.slice(2))}</h1>`); continue }
    if (line.startsWith('## '))   { flushList(); result.push(`<h2>${inline(line.slice(3))}</h2>`); continue }
    if (line.startsWith('### '))  { flushList(); result.push(`<h3>${inline(line.slice(4))}</h3>`); continue }
    if (line.startsWith('#### ')) { flushList(); result.push(`<h4>${inline(line.slice(5))}</h4>`); continue }
    if (/^[-*_]{3,}$/.test(line.trim())) { flushList(); result.push('<hr/>'); continue }
    if (line.startsWith('> '))    { flushList(); result.push(`<blockquote>${inline(line.slice(2))}</blockquote>`); continue }

    if (/^[ \t]*[-*+] /.test(line)) {
      if (listType !== 'ul') { flushList(); listType = 'ul' }
      listBuf.push(`<li>${inline(line.replace(/^[ \t]*[-*+] /,''))}</li>`)
      continue
    }
    if (/^[ \t]*\d+\. /.test(line)) {
      if (listType !== 'ol') { flushList(); listType = 'ol' }
      listBuf.push(`<li>${inline(line.replace(/^[ \t]*\d+\. /,''))}</li>`)
      continue
    }

    if (line.trim() === '') { flushList(); result.push('<div class="spacer"></div>'); continue }
    flushList()
    result.push(`<p>${inline(line)}</p>`)
  }

  flushList(); flushTable()
  return result.join('\n')
}

export async function POST(req: NextRequest) {
  try {
    // On Vercel, PDF generation requires client-side export
    if (process.env.VERCEL) {
      return NextResponse.json(
        { error: 'PDF export on Vercel requires client-side generation. Use the Download PDF button in the preview.' },
        { status: 501 }
      )
    }

    const { pages } = await req.json()

    if (!pages || !Array.isArray(pages) || pages.length === 0) {
      return NextResponse.json({ error: 'Missing pages array' }, { status: 400 })
    }

    // Build full HTML document
    const pagesHtml = pages.map((page: string, i: number) => {
      const content = markdownToHtml(page)
      const pageBreak = i < pages.length - 1 ? 'page-break-after: always;' : ''
      return `<div class="page" style="${pageBreak}">${content}</div>`
    }).join('\n')

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 13px;
    color: #1e293b;
    background: #ffffff;
    line-height: 1.7;
  }

  .page {
    width: 210mm;
    min-height: 297mm;
    padding: 20mm 18mm;
    background: #ffffff;
    position: relative;
  }

  h1 {
    font-size: 22px;
    font-weight: 800;
    color: #0f172a;
    margin: 0 0 14px;
    padding-bottom: 6px;
    border-bottom: 2px solid #1d4ed8;
    line-height: 1.25;
  }

  h2 {
    font-size: 17px;
    font-weight: 700;
    color: #1e293b;
    margin: 20px 0 10px;
    padding-bottom: 4px;
    border-bottom: 1px solid #e2e8f0;
    line-height: 1.3;
  }

  h3 {
    font-size: 14px;
    font-weight: 700;
    color: #334155;
    margin: 16px 0 6px;
    line-height: 1.4;
  }

  h4 {
    font-size: 13px;
    font-weight: 700;
    color: #475569;
    margin: 12px 0 4px;
  }

  p {
    margin: 0 0 8px;
    line-height: 1.75;
    color: #1e293b;
    text-align: justify;
  }

  .spacer {
    height: 6px;
  }

  ul, ol {
    padding-left: 22px;
    margin: 6px 0 10px;
  }

  ul { list-style-type: disc; }
  ol { list-style-type: decimal; }

  li {
    margin: 3px 0;
    line-height: 1.65;
    color: #1e293b;
  }

  strong { font-weight: 700; }
  em { font-style: italic; }
  s { text-decoration: line-through; }

  a {
    color: #2563eb;
    text-decoration: underline;
  }

  blockquote {
    border-left: 4px solid #94a3b8;
    padding: 6px 14px;
    margin: 10px 0;
    color: #475569;
    font-style: italic;
    background: #f8fafc;
    border-radius: 0 4px 4px 0;
  }

  hr {
    border: none;
    border-top: 1.5px solid #e2e8f0;
    margin: 16px 0;
  }

  pre {
    background: #1e293b;
    color: #e2e8f0;
    padding: 12px 16px;
    border-radius: 6px;
    font-family: 'Courier New', monospace;
    font-size: 11px;
    overflow: hidden;
    margin: 10px 0;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-all;
  }

  code {
    background: #f1f5f9;
    color: #0f172a;
    padding: 1px 5px;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
    font-size: 11.5px;
    border: 1px solid #e2e8f0;
  }

  pre code {
    background: transparent;
    border: none;
    padding: 0;
    color: inherit;
    font-size: 11px;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    margin: 12px 0;
    font-size: 12px;
  }

  th {
    border: 1px solid #cbd5e1;
    padding: 7px 12px;
    background: #f1f5f9;
    font-weight: 700;
    text-align: left;
    color: #1e293b;
  }

  td {
    border: 1px solid #e2e8f0;
    padding: 6px 12px;
    color: #334155;
  }

  tr:nth-child(even) td {
    background: #f8fafc;
  }

  img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    margin: 8px 0;
  }
</style>
</head>
<body>${pagesHtml}</body>
</html>`

    const browser = process.env.VERCEL
      ? null
      : await puppeteerLocal.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        })

    if (!browser) {
      return NextResponse.json(
        { error: 'PDF export on Vercel requires client-side generation. Use the Download PDF button in the preview.' },
        { status: 501 }
      )
    }

    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    })

    await browser.close()

    const pdfBody = new Uint8Array(pdfBuffer.byteLength)
    pdfBody.set(pdfBuffer)

    return new NextResponse(pdfBody, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="report.pdf"',
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[PDF Export] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}