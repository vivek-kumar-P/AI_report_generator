export interface FetchResult {
  success: boolean
  data?: Array<{ path: string; content: string }>
  error?: string
}

const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // ms

export class GitHubFetcher {
  private static async fetchWithRetry(
    url: string,
    retries = MAX_RETRIES
  ): Promise<Response> {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          headers: {
            Accept: 'application/vnd.github.v3.raw',
          },
        })

        if (response.ok) return response
        if (response.status === 404) throw new Error('Repository not found')
        if (response.status === 403) throw new Error('Rate limit exceeded. Try again later.')
      } catch (error) {
        if (i === retries - 1) throw error
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY * (i + 1)))
      }
    }
    throw new Error('Failed to fetch after retries')
  }

  static async fetchMarkdownFiles(repoUrl: string): Promise<FetchResult> {
    try {
      // Parse repo URL
      const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)(?:\.git)?$/)
      if (!match) {
        return {
          success: false,
          error: 'Invalid GitHub URL format. Use: https://github.com/owner/repo',
        }
      }

      const [, owner, repo] = match
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents`

      // Fetch repository contents
      const response = await this.fetchWithRetry(apiUrl)
      const contents = await response.json()

      if (!Array.isArray(contents)) {
        return {
          success: false,
          error: 'Failed to read repository contents',
        }
      }

      // Filter markdown files
      const mdFiles = contents
        .filter((file: any) => file.name.endsWith('.md'))
        .map((file: any) => ({
          path: file.path || file.name,
          url: file.download_url,
        }))

      if (mdFiles.length === 0) {
        return {
          success: false,
          error: 'No markdown files found in repository root',
        }
      }

      // Fetch markdown file contents
      const mdContents: Array<{ path: string; content: string }> = []
      for (const file of mdFiles) {
        try {
          const fileResponse = await this.fetchWithRetry(file.url)
          const content = await fileResponse.text()
          mdContents.push({ path: file.path, content })
        } catch (error) {
          console.warn(`Failed to fetch ${file.path}:`, error)
        }
      }

      if (mdContents.length === 0) {
        return {
          success: false,
          error: 'Failed to fetch markdown file contents',
        }
      }

      return {
        success: true,
        data: mdContents,
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred'
      return {
        success: false,
        error: `GitHub fetch error: ${errorMessage}`,
      }
    }
  }

  static async generateReport(
    repoUrl: string,
    template?: string,
    extraPrompt?: string
  ): Promise<FetchResult> {
    const mdResult = await this.fetchMarkdownFiles(repoUrl)
    
    if (!mdResult.success) {
      return mdResult
    }

    try {
      // Combine markdown files into a single report
      const combinedContent = (mdResult.data || [])
        .map((item) => item.content)
        .join('\n\n---\n\n')
      
      // Build report with template if provided
      let report = template ? `${template}\n\n` : ''
      report += combinedContent
      
      if (extraPrompt) {
        report += `\n\n## Custom Instructions\n${extraPrompt}`
      }

      return {
        success: true,
        data: [{ path: 'combined-report.md', content: report }],
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to generate report'
      return {
        success: false,
        error: errorMessage,
      }
    }
  }
}
