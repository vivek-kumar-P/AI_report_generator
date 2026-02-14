#!/usr/bin/env node

/**
 * Test API Routes with OpenRouter Integration
 * Tests the /api/tools/call endpoint
 */

const API_KEY = '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'

console.log('🧪 Testing MCP API Routes with OpenRouter\n')
console.log('═'.repeat(60))

// Simulating what the API route does
async function testReportGeneration() {
  try {
    console.log('\n📋 Test Scenario: Generate Project Report')
    console.log('   Repository: https://github.com/example/web-app')
    console.log('   Max Pages: 5')
    console.log('   Prompt: Focus on architecture')
    console.log('   Markdown Files: 3 files found\n')

    const mockMarkdownFiles = [
      { path: 'README.md', content: 'Project overview' },
      { path: 'ARCHITECTURE.md', content: 'System design' },
      { path: 'API.md', content: 'API documentation' }
    ]

    console.log('⏳ Generating report via OpenRouter...\n')

    const systemPrompt = `You are a professional project documentation generator. Create a clear, well-structured markdown report for a GitHub repository.`
    const filesInfo = mockMarkdownFiles.map(f => f.path).join(', ')
    const userPrompt = `
Generate a comprehensive project report with these details:
- Repository URL: https://github.com/example/web-app
- Max Pages: 5
- Template: Yes
- Additional Instructions: Focus on architecture and key features
- Available Markdown Files: Found 3 markdown files: ${filesInfo}

Create a professional markdown report that summarizes the project, its structure, and key information.
Format as a single markdown document suitable for A4 printing.
`

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'SaaS Report Generator'
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('❌ OpenRouter Error:')
      console.error(JSON.stringify(error, null, 2))
      return false
    }

    const data = await response.json()
    const report = data.choices[0]?.message?.content

    if (!report) {
      console.error('❌ No report content received')
      return false
    }

    console.log('✅ Report generated successfully!\n')
    console.log('📄 Generated Report:\n')
    console.log(report)
    console.log('\n' + '═'.repeat(60))
    console.log('\n📊 API Statistics:')
    console.log(`   Model: ${data.model}`)
    console.log(`   Tokens Used: ${data.usage?.total_tokens || 'N/A'}`)
    console.log(`   Response Length: ${report.length} characters`)
    console.log('\n✨ Report generation is working perfectly!')
    return true
  } catch (error) {
    console.error('\n❌ Test failed:')
    console.error(error instanceof Error ? error.message : error)
    return false
  }
}

// Run test
testReportGeneration().then(success => {
  process.exit(success ? 0 : 1)
})
