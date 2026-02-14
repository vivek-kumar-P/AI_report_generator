// MCP Tools definitions and handlers (shared between frontend & API)
// This replaces the root index.js backend

export const MCP_TOOLS = {
  hello: {
    name: 'hello',
    description: 'Say hello',
    inputSchema: { type: 'object', properties: {} },
  },
  scan_markdown_files: {
    name: 'scan_markdown_files',
    description: 'Scan and list markdown files from a repository',
    inputSchema: {
      type: 'object',
      properties: {
        repoUrl: { type: 'string' },
      },
      required: ['repoUrl'],
    },
  },
  generate_project_report: {
    name: 'generate_project_report',
    description: 'Generate a project report',
    inputSchema: {
      type: 'object',
      properties: {
        repoUrl: { type: 'string' },
        maxPages: { type: 'number' },
        extraPrompt: { type: 'string' },
        template: { type: 'string' },
        markdownFiles: { type: 'array' },
      },
      required: ['repoUrl'],
    },
  },
  regenerate_section: {
    name: 'regenerate_section',
    description: 'Regenerate a specific section based on user feedback',
    inputSchema: {
      type: 'object',
      properties: {
        originalSection: { type: 'string' },
        feedback: { type: 'string' },
        fullContent: { type: 'string' },
      },
      required: ['originalSection', 'feedback'],
    },
  },
}

// Tool execution logic
export async function callToolHandler(
  name: string,
  args: Record<string, any>
): Promise<{ result: any }> {
  const safeArgs = args ?? {}

  if (name === 'hello') {
    return { result: 'Hello from MCP 🚀' }
  }

  if (name === 'scan_markdown_files') {
    const { repoUrl } = safeArgs
    const mockFiles = [
      {
        path: 'README.md',
        content:
          '# My Project\n\nThis is the main readme for the project. It contains an overview and getting started guide.',
      },
      {
        path: 'docs/ARCHITECTURE.md',
        content: '# Architecture\n\n## Overview\nThe system is built with a modular design...',
      },
      {
        path: 'docs/API.md',
        content:
          '# API Documentation\n\n## Endpoints\n- GET /api/data\n- POST /api/create',
      },
    ]
    return { result: mockFiles }
  }

  if (name === 'generate_project_report') {
    const { repoUrl, maxPages, extraPrompt, template, markdownFiles } = safeArgs
    const requiredMinPages = 5
    const effectiveMaxPages = Math.max(requiredMinPages, Number(maxPages) || requiredMinPages)
    const filesInfo = Array.isArray(markdownFiles)
      ? `Found ${markdownFiles.length} markdown files: ${markdownFiles.map((f: any) => f.path).join(', ')}`
      : 'No markdown files provided'
    
    // Call OpenRouter API for real report generation
    const openrouterApiKey = process.env.OPENROUTER_API_KEY
    if (!openrouterApiKey) {
      throw new Error('OPENROUTER_API_KEY not found in environment variables')
    }

    // Construct prompt for OpenRouter
    const systemPrompt = `You are a professional report writer. Produce a formal, objective report in third person with clear headings and consistent formatting. The report must be detailed enough to fill at least five A4 pages when rendered.`
    const userPrompt = `
  Generate a comprehensive project report with these details:
  - Repository URL: ${repoUrl}
  - Max Pages Requested: ${effectiveMaxPages}
  - Template: ${template ? 'Yes' : 'No'}
  - Additional Instructions: ${extraPrompt || 'None'}
  - Available Markdown Files: ${filesInfo}

  MANDATORY REPORT STRUCTURE (use these headings, in this order):
  1. Title Page (Title, author name, date, purpose)
  2. Executive Summary/Abstract (100-200 words)
  3. Table of Contents
  4. Introduction (background, purpose, scope)
  5. Methodology (how data was gathered)
  6. Findings/Results (detailed)
  7. Discussion/Analysis (interpretation)
  8. Conclusion (summary)
  9. Recommendations (actions)
  10. References/Bibliography
  11. Appendices (supporting material)

  REQUIREMENTS:
  - Minimum length: at least 2,000-2,500 words total (approx. 5 A4 pages).
  - Each section must include 2-3 substantial paragraphs.
  - Use formal, objective tone and third person.
  - Use consistent headings/subheadings.
  - Mention visuals (tables/charts) where relevant.
  - Format as a single markdown document suitable for A4 printing.
  `

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openrouterApiKey}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'SaaS Report Generator'
        },
        body: JSON.stringify({
          model: 'openai/gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.6,
          max_tokens: 3500
        })
      })

      if (!response.ok) {
        let detail = ''
        try {
          const body = await response.json()
          detail = body?.error?.message || JSON.stringify(body)
        } catch {
          detail = await response.text()
        }
        const hint = response.status === 401
          ? 'OpenRouter API unauthorized. Check OPENROUTER_API_KEY.'
          : `OpenRouter API error: ${response.status} ${response.statusText}`
        throw new Error(detail ? `${hint} ${detail}` : hint)
      }

      const data = await response.json()
      const report = data.choices[0]?.message?.content || 'Failed to generate report'
      return { result: report }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown OpenRouter error'
      throw new Error(`Failed to call OpenRouter API: ${message}`)
    }
  }

  if (name === 'regenerate_section') {
    const { originalSection, feedback, fullContent, prompt } = safeArgs
    
    // Call OpenRouter API for section regeneration
    const openrouterApiKey = process.env.OPENROUTER_API_KEY
    if (!openrouterApiKey) {
      throw new Error('OPENROUTER_API_KEY not found in environment variables')
    }

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openrouterApiKey}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'SaaS Report Generator'
        },
        body: JSON.stringify({
          model: 'openai/gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a document editor. Modify the provided section based on user feedback. Return ONLY the modified section in markdown format, nothing else.'
            },
            {
              role: 'user',
              content: `
ORIGINAL SECTION:
${originalSection}

USER FEEDBACK:
${feedback}

CONTEXT (for reference):
${fullContent.substring(0, 500)}...

Please modify the section to address the user's feedback. Keep the same markdown format and structure. Return ONLY the updated section.
`
            }
          ],
          temperature: 0.7,
          max_tokens: 1500
        })
      })

      if (!response.ok) {
        let detail = ''
        try {
          const body = await response.json()
          detail = body?.error?.message || JSON.stringify(body)
        } catch {
          detail = await response.text()
        }
        const hint = response.status === 401
          ? 'OpenRouter API unauthorized. Check OPENROUTER_API_KEY.'
          : `OpenRouter API error: ${response.status} ${response.statusText}`
        throw new Error(detail ? `${hint} ${detail}` : hint)
      }

      const data = await response.json()
      const regeneratedSection = data.choices[0]?.message?.content || 'Failed to regenerate section'
      return { result: regeneratedSection }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown OpenRouter error'
      throw new Error(`Failed to call OpenRouter API: ${message}`)
    }
  }

  throw new Error('Tool not found')
}
