// MCP Tools definitions and handlers (shared between frontend & API)

import { GitHubFetcher } from './github-fetcher'

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
      properties: { repoUrl: { type: 'string' } },
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
    const fetchResult = await GitHubFetcher.fetchMarkdownFiles(repoUrl)
    if (!fetchResult.success) {
      throw new Error(fetchResult.error || 'Failed to fetch markdown files')
    }
    return { result: fetchResult.data || [] }
  }

  if (name === 'generate_project_report') {
    const { repoUrl, maxPages, extraPrompt, template, markdownFiles } = safeArgs
    const effectiveMaxPages = Math.max(1, Number(maxPages) || 5)

    const filesInfo = Array.isArray(markdownFiles) && markdownFiles.length > 0
      ? markdownFiles.map((f: any) => `\n### ${f.path}\n${f.content || ''}`).join('\n\n')
      : 'No markdown files provided'

    const groqApiKey = process.env.GROQ_API_KEY
    if (!groqApiKey) throw new Error('GROQ_API_KEY not found in environment variables')

    const wordsPerPage = 350
    const targetWords = effectiveMaxPages * wordsPerPage

    const systemPrompt = `You are a senior technical writer producing formal, detailed project reports. 
You write in third person, use precise language, and always produce FULL content for every section — never write placeholder text like "[Author Name]" or "[Current Date]".
Every section must have substantial content. Never write a heading without at least 3 full paragraphs of content below it.
Always use actual dates, realistic author attributions, and concrete details based on the repository information provided.`

    const userPrompt = `Generate a comprehensive, detailed project report for the following repository.

Repository URL: ${repoUrl}
Target Length: ${targetWords} words minimum (${effectiveMaxPages} pages × ${wordsPerPage} words/page)
Additional Instructions: ${extraPrompt || 'None'}
Template: ${template || 'Standard A4 report format'}

REPOSITORY CONTENT:
${filesInfo}

MANDATORY STRUCTURE — write EACH section with FULL content (minimum 3 paragraphs each):

# Title Page
Write the actual project name, today's date (${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}), author attribution, and a 2-paragraph purpose statement.

## Executive Summary
Write 3-4 paragraphs summarising the entire report — what the project is, what was found, and what is recommended.

## Table of Contents
List all sections with their headings.

## Introduction
Write 4+ paragraphs covering: project background, problem being solved, why this project matters, scope of this report, and objectives.

## Methodology
Write 3-4 paragraphs describing: how the repository was analysed, what files and documentation were reviewed, what tools and techniques were used, and the analysis approach.

## Findings and Results
Write 4-5 paragraphs with concrete findings from the actual codebase: tech stack identified, architecture patterns, key features discovered, code quality observations, and any notable implementation details. Include a markdown table summarising key findings.

## Discussion and Analysis
Write 3-4 paragraphs interpreting the findings: what the findings mean, strengths of the implementation, weaknesses or gaps identified, and comparison to industry best practices.

## Conclusion
Write 3 paragraphs summarising: what was achieved, the overall assessment of the project, and final thoughts.

## Recommendations
Write 3-4 paragraphs with specific, actionable recommendations for improving the project. Include a markdown table with Priority, Recommendation, and Expected Impact columns.

## References and Bibliography
List all sources, documentation, and files referenced in this report.

## Appendices
Include any additional supporting material, code snippets, or technical details.

CRITICAL RULES:
- NEVER use placeholder text like [Author Name], [Date], [Description] — always write real content
- NEVER write a section with less than 3 paragraphs
- Use proper markdown: # for H1, ## for H2, ### for H3, **bold**, bullet lists, numbered lists, tables
- Write ${targetWords}+ words total
- Base all findings on the actual repository content provided above`

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqApiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.5,
          max_tokens: 8000,
        }),
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
          ? 'Groq API unauthorized. Check GROQ_API_KEY.'
          : `Groq API error: ${response.status} ${response.statusText}`
        throw new Error(detail ? `${hint} — ${detail}` : hint)
      }

      const data = await response.json()
      const report = data.choices[0]?.message?.content || 'Failed to generate report'
      return { result: report }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown Groq error'
      throw new Error(`Failed to call Groq API: ${message}`)
    }
  }

  if (name === 'regenerate_section') {
    const { originalSection, feedback, fullContent } = safeArgs

    const groqApiKey = process.env.GROQ_API_KEY
    if (!groqApiKey) throw new Error('GROQ_API_KEY not found in environment variables')

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqApiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are a document editor. Rewrite the provided section based on user feedback.
Return ONLY the updated markdown section — no preamble, no explanation, no extra commentary.
Keep the same heading structure. Write full, substantial content — never placeholder text.`,
            },
            {
              role: 'user',
              content: `ORIGINAL SECTION:
${originalSection}

USER FEEDBACK:
${feedback}

FULL REPORT CONTEXT:
${fullContent || 'No additional context.'}

Rewrite the section addressing the feedback. Return ONLY the updated section in markdown.`,
            },
          ],
          temperature: 0.6,
          max_tokens: 2000,
        }),
      })

      if (!response.ok) {
        let detail = ''
        try {
          const body = await response.json()
          detail = body?.error?.message || JSON.stringify(body)
        } catch {
          detail = await response.text()
        }
        throw new Error(`Groq API error ${response.status}: ${detail}`)
      }

      const data = await response.json()
      const regeneratedSection = data.choices[0]?.message?.content || 'Failed to regenerate section'
      return { result: regeneratedSection }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown Groq error'
      throw new Error(`Failed to call Groq API: ${message}`)
    }
  }

  throw new Error(`Tool not found: ${name}`)
}