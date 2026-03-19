import { NextRequest, NextResponse } from 'next/server'
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, BorderStyle, WidthType, Table, TableRow,
  TableCell, ShadingType, LevelFormat, PageNumber, Header,
  Footer, PageBreak
} from 'docx'

export const runtime = 'nodejs'

// ── Markdown → docx nodes ────────────────────────────────────

function parseInline(text: string): TextRun[] {
  const runs: TextRun[] = []
  // Split by bold/italic/code markers
  const parts = text.split(/(\*\*\*.*?\*\*\*|\*\*.*?\*\*|\*.*?\*|`.*?`|~~.*?~~)/)
  for (const part of parts) {
    if (!part) continue
    if (part.startsWith('***') && part.endsWith('***')) {
      runs.push(new TextRun({ text: part.slice(3, -3), bold: true, italics: true }))
    } else if (part.startsWith('**') && part.endsWith('**')) {
      runs.push(new TextRun({ text: part.slice(2, -2), bold: true }))
    } else if (part.startsWith('*') && part.endsWith('*')) {
      runs.push(new TextRun({ text: part.slice(1, -1), italics: true }))
    } else if (part.startsWith('`') && part.endsWith('`')) {
      runs.push(new TextRun({ text: part.slice(1, -1), font: 'Courier New', size: 20 }))
    } else if (part.startsWith('~~') && part.endsWith('~~')) {
      runs.push(new TextRun({ text: part.slice(2, -2), strike: true }))
    } else {
      // Strip markdown links
      const stripped = part.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      if (stripped) runs.push(new TextRun({ text: stripped }))
    }
  }
  return runs.length > 0 ? runs : [new TextRun({ text: '' })]
}

function markdownToDocxNodes(markdown: string): (Paragraph | Table)[] {
  const nodes: (Paragraph | Table)[] = []
  const lines = markdown.split('\n')
  let i = 0
  let listItems: string[] = []
  let listType: 'ul' | 'ol' | null = null
  let inCodeBlock = false
  let codeLines: string[] = []
  let tableLines: string[] = []
  let inTable = false

  const flushList = () => {
    if (listItems.length === 0) return
    listItems.forEach((item, idx) => {
      nodes.push(new Paragraph({
        numbering: listType === 'ol'
          ? { reference: 'numbered', level: 0 }
          : { reference: 'bullets', level: 0 },
        children: parseInline(item),
        spacing: { before: 40, after: 40 },
      }))
    })
    listItems = []
    listType = null
  }

  const flushTable = () => {
    if (tableLines.length === 0) return
    const isDelimiter = (r: string) => /^\|[\s\-|:]+\|$/.test(r.trim())
    const dataRows = tableLines.filter(r => !isDelimiter(r))
    if (dataRows.length === 0) { tableLines = []; inTable = false; return }

    const parseRow = (row: string) =>
      row.split('|').slice(1, -1).map(c => c.trim())

    const headers = parseRow(dataRows[0])
    const bodyRows = dataRows.slice(1)

    const border = { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' }
    const borders = { top: border, bottom: border, left: border, right: border }
    const colWidth = Math.floor(9360 / Math.max(headers.length, 1))

    const headerRow = new TableRow({
      children: headers.map(h => new TableCell({
        borders,
        width: { size: colWidth, type: WidthType.DXA },
        shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({
          children: [new TextRun({ text: h, bold: true, size: 20 })],
        })],
      })),
    })

    const bodyRowNodes = bodyRows.map((row, idx) => {
      const cells = parseRow(row)
      return new TableRow({
        children: cells.map(c => new TableCell({
          borders,
          width: { size: colWidth, type: WidthType.DXA },
          shading: { fill: idx % 2 === 0 ? 'FFFFFF' : 'F8FAFC', type: ShadingType.CLEAR },
          margins: { top: 60, bottom: 60, left: 120, right: 120 },
          children: [new Paragraph({
            children: parseInline(c),
            spacing: { before: 0, after: 0 },
          })],
        })),
      })
    })

    nodes.push(new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: Array(headers.length).fill(colWidth),
      rows: [headerRow, ...bodyRowNodes],
    }))

    nodes.push(new Paragraph({ children: [], spacing: { before: 120, after: 0 } }))
    tableLines = []
    inTable = false
  }

  while (i < lines.length) {
    const line = lines[i]

    // Code blocks
    if (line.trim().startsWith('```')) {
      if (!inCodeBlock) {
        flushList()
        inCodeBlock = true
        codeLines = []
        i++; continue
      } else {
        inCodeBlock = false
        codeLines.forEach(cl => {
          nodes.push(new Paragraph({
            children: [new TextRun({ text: cl || ' ', font: 'Courier New', size: 18, color: '1E293B' })],
            shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
            indent: { left: 360 },
            spacing: { before: 20, after: 20 },
          }))
        })
        i++; continue
      }
    }
    if (inCodeBlock) { codeLines.push(line); i++; continue }

    // Tables
    if (line.trim().startsWith('|')) {
      flushList()
      inTable = true
      tableLines.push(line)
      if (!(lines[i + 1] || '').trim().startsWith('|')) flushTable()
      i++; continue
    }
    if (inTable) flushTable()

    // Headings
    if (line.startsWith('# ')) {
      flushList()
      nodes.push(new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: line.slice(2).trim(), bold: true, size: 40, color: '0F172A' })],
        spacing: { before: 400, after: 200 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: '1D4ED8', space: 4 } },
      }))
      i++; continue
    }
    if (line.startsWith('## ')) {
      flushList()
      nodes.push(new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun({ text: line.slice(3).trim(), bold: true, size: 32, color: '1E293B' })],
        spacing: { before: 320, after: 160 },
      }))
      i++; continue
    }
    if (line.startsWith('### ')) {
      flushList()
      nodes.push(new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun({ text: line.slice(4).trim(), bold: true, size: 26, color: '334155' })],
        spacing: { before: 240, after: 120 },
      }))
      i++; continue
    }
    if (line.startsWith('#### ')) {
      flushList()
      nodes.push(new Paragraph({
        children: [new TextRun({ text: line.slice(5).trim(), bold: true, size: 24, color: '475569' })],
        spacing: { before: 200, after: 80 },
      }))
      i++; continue
    }

    // HR
    if (/^[-*_]{3,}$/.test(line.trim())) {
      flushList()
      nodes.push(new Paragraph({
        children: [],
        border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: 'CBD5E1', space: 4 } },
        spacing: { before: 160, after: 160 },
      }))
      i++; continue
    }

    // Blockquote
    if (line.startsWith('> ')) {
      flushList()
      nodes.push(new Paragraph({
        children: parseInline(line.slice(2)).map(r => new TextRun({ ...r as any, italics: true, color: '475569' })),
        indent: { left: 720 },
        border: { left: { style: BorderStyle.SINGLE, size: 8, color: '94A3B8', space: 8 } },
        spacing: { before: 80, after: 80 },
      }))
      i++; continue
    }

    // Unordered list
    if (/^[ \t]*[-*+] /.test(line)) {
      if (listType !== 'ul') { flushList(); listType = 'ul' }
      listItems.push(line.replace(/^[ \t]*[-*+] /, ''))
      i++; continue
    }

    // Ordered list
    if (/^[ \t]*\d+\. /.test(line)) {
      if (listType !== 'ol') { flushList(); listType = 'ol' }
      listItems.push(line.replace(/^[ \t]*\d+\. /, ''))
      i++; continue
    }

    // Empty line
    if (line.trim() === '') {
      flushList()
      nodes.push(new Paragraph({ children: [], spacing: { before: 80, after: 0 } }))
      i++; continue
    }

    // Paragraph
    flushList()
    nodes.push(new Paragraph({
      children: parseInline(line),
      spacing: { before: 60, after: 60 },
    }))
    i++
  }

  flushList()
  flushTable()
  return nodes
}

// ── Route handler ────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { pages } = body

    if (!pages || !Array.isArray(pages) || pages.length === 0) {
      return NextResponse.json({ error: 'Missing pages array' }, { status: 400 })
    }

    const allNodes: (Paragraph | Table)[] = []

    for (let p = 0; p < pages.length; p++) {
      const pageMarkdown = pages[p] as string
      if (!pageMarkdown?.trim()) continue

      const pageNodes = markdownToDocxNodes(pageMarkdown)
      allNodes.push(...pageNodes)

      // Page break between pages (not after last)
      if (p < pages.length - 1) {
        allNodes.push(new Paragraph({
          children: [new PageBreak()],
          spacing: { before: 0, after: 0 },
        }))
      }
    }

    const doc = new Document({
      numbering: {
        config: [
          {
            reference: 'bullets',
            levels: [{
              level: 0,
              format: LevelFormat.BULLET,
              text: '•',
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 720, hanging: 360 } } },
            }],
          },
          {
            reference: 'numbered',
            levels: [{
              level: 0,
              format: LevelFormat.DECIMAL,
              text: '%1.',
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 720, hanging: 360 } } },
            }],
          },
        ],
      },
      styles: {
        default: {
          document: { run: { font: 'Arial', size: 24, color: '1E293B' } },
        },
        paragraphStyles: [
          {
            id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal',
            quickFormat: true,
            run: { size: 40, bold: true, font: 'Arial', color: '0F172A' },
            paragraph: { spacing: { before: 400, after: 200 }, outlineLevel: 0 },
          },
          {
            id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal',
            quickFormat: true,
            run: { size: 32, bold: true, font: 'Arial', color: '1E293B' },
            paragraph: { spacing: { before: 320, after: 160 }, outlineLevel: 1 },
          },
          {
            id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal',
            quickFormat: true,
            run: { size: 26, bold: true, font: 'Arial', color: '334155' },
            paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 2 },
          },
        ],
      },
      sections: [{
        properties: {
          page: {
            size: { width: 12240, height: 15840 },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0', space: 4 } },
                spacing: { after: 200 },
                children: [new TextRun({ text: 'Generated Report', size: 18, color: '94A3B8', font: 'Arial' })],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                border: { top: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0', space: 4 } },
                spacing: { before: 200 },
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: 'Page ', size: 18, color: '94A3B8', font: 'Arial' }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 18, color: '94A3B8', font: 'Arial' }),
                ],
              }),
            ],
          }),
        },
        children: allNodes,
      }],
    })

    const buffer = await Packer.toBuffer(doc)
    const docxBody = new Uint8Array(buffer.byteLength)
    docxBody.set(buffer)

    return new NextResponse(docxBody, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename="report.docx"',
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[DOCX Export] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}