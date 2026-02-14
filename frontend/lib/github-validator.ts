export interface GitHubValidationResult {
  isValid: boolean
  error?: string
  owner?: string
  repo?: string
  url?: string
}

/**
 * Validates GitHub repository URL format and structure
 */
export function validateGitHubUrl(url: string): GitHubValidationResult {
  if (!url || !url.trim()) {
    return {
      isValid: false,
      error: 'Repository URL is required'
    }
  }

  const trimmedUrl = url.trim()

  // Check if it's a valid GitHub URL format
  const githubRegex = /^(https:\/\/)?github\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_.-]+)(\.git)?\/?$/i
  const match = trimmedUrl.match(githubRegex)

  if (!match) {
    return {
      isValid: false,
      error: 'Invalid GitHub URL format. Use: https://github.com/owner/repo'
    }
  }

  const owner = match[2]
  const repo = match[3]

  // Validate owner and repo names
  if (!owner || owner.length < 1 || owner.length > 39) {
    return {
      isValid: false,
      error: 'Invalid repository owner name'
    }
  }

  if (!repo || repo.length < 1 || repo.length > 255) {
    return {
      isValid: false,
      error: 'Invalid repository name'
    }
  }

  const normalizedUrl = `https://github.com/${owner}/${repo}`

  return {
    isValid: true,
    owner,
    repo,
    url: normalizedUrl
  }
}

/**
 * Checks if a GitHub repository exists and has content
 * This makes an API call to GitHub to verify the repo
 */
export async function checkGitHubRepoExists(
  owner: string,
  repo: string
): Promise<GitHubValidationResult> {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      },
      cache: 'no-store'
    })

    if (response.status === 404) {
      return {
        isValid: false,
        error: 'Repository not found. Please check the owner and repository name.'
      }
    }

    if (!response.ok) {
      return {
        isValid: false,
        error: 'Unable to access repository. It may be private or rate limit exceeded.'
      }
    }

    const data = await response.json()

    // Check if repository has any content (files/folders)
    if (data.size === 0) {
      return {
        isValid: false,
        error: 'Repository appears to be empty. Please add files or folders to your repository.'
      }
    }

    return {
      isValid: true,
      owner,
      repo,
      url: data.html_url
    }
  } catch (error) {
    console.error('[GitHub Validator] Error checking repo:', error)
    return {
      isValid: false,
      error: 'Network error. Please check your connection and try again.'
    }
  }
}

/**
 * Comprehensive validation: format + existence check
 */
export async function validateGitHubRepository(
  url: string
): Promise<GitHubValidationResult> {
  // First, validate format
  const formatResult = validateGitHubUrl(url)

  if (!formatResult.isValid) {
    return formatResult
  }

  // Then check if it exists
  if (formatResult.owner && formatResult.repo) {
    return await checkGitHubRepoExists(formatResult.owner, formatResult.repo)
  }

  return {
    isValid: false,
    error: 'Unable to validate repository'
  }
}

/**
 * Real-time validation (format only, no API call)
 * Use this for instant feedback while user types
 */
export function validateGitHubUrlRealtime(url: string): {
  isValid: boolean
  error?: string
  warning?: string
} {
  const result = validateGitHubUrl(url)

  if (!result.isValid) {
    return {
      isValid: false,
      error: result.error
    }
  }

  // Additional warnings
  if (url.includes('.git')) {
    return {
      isValid: true,
      warning: 'Repository URL can be simplified (remove .git)'
    }
  }

  return {
    isValid: true
  }
}
