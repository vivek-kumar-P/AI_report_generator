#!/usr/bin/env node

/**
 * Test MCP Tools with OpenRouter API
 * Tests the generate_project_report tool using OpenRouter
 */

// Import MCP tools (using dynamic import due to require being unavailable with ES modules)
import { callToolHandler } from './saa-s-app-skeleton/lib/mcp-tools.ts'

// Set environment variable
process.env.OPENROUTER_API_KEY = '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'

console.log('🧪 Testing MCP Tools with OpenRouter\n')
console.log('═'.repeat(60))

async function testMCPTools() {
  try {
    // Test 1: Hello tool
    console.log('\n1️⃣  Testing "hello" tool...')
    const helloResult = await callToolHandler('hello', {})
    console.log(`   ✅ Result: ${helloResult.result}`)

    // Test 2: Scan markdown files
    console.log('\n2️⃣  Testing "scan_markdown_files" tool...')
    const scanResult = await callToolHandler('scan_markdown_files', {
      repoUrl: 'https://github.com/example/repo'
    })
    console.log(`   ✅ Found ${scanResult.result.length} files:`)
    scanResult.result.forEach((file, idx) => {
      console.log(`      - ${idx + 1}. ${file.path}`)
    })

    // Test 3: Generate report with OpenRouter
    console.log('\n3️⃣  Testing "generate_project_report" tool with OpenRouter...')
    console.log('   ⏳ Calling OpenRouter API...')
    
    const markdownFiles = scanResult.result
    const reportResult = await callToolHandler('generate_project_report', {
      repoUrl: 'https://github.com/example/web-app',
      maxPages: 5,
      extraPrompt: 'Focus on architecture and key features',
      template: true,
      markdownFiles: markdownFiles
    })

    if (reportResult.result && reportResult.result.length > 0) {
      console.log('   ✅ Report generated successfully!')
      console.log(`\n📄 Report Preview (first 300 chars):\n`)
      console.log('   ' + reportResult.result.substring(0, 300).replace(/\n/g, '\n   '))
      if (reportResult.result.length > 300) {
        console.log('\n   ... [report continues] ...\n')
      }
    } else {
      console.error('   ❌ No report generated')
      return false
    }

    console.log('\n' + '═'.repeat(60))
    console.log('\n✨ All tests passed!')
    console.log('\n✅ Configuration Status:')
    console.log('   ✓ OPENROUTER_API_KEY configured')
    console.log('   ✓ Hello tool working')
    console.log('   ✓ Scan markdown files tool working')
    console.log('   ✓ Report generation with OpenRouter working')
    return true
  } catch (error) {
    console.error('\n' + '═'.repeat(60))
    console.error('\n❌ Test failed:')
    console.error(error instanceof Error ? error.message : error)
    console.error('\nStack:')
    if (error instanceof Error) {
      console.error(error.stack)
    }
    return false
  }
}

// Run test
testMCPTools().then(success => {
  process.exit(success ? 0 : 1)
})
