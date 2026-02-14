#!/usr/bin/env node

/**
 * Test OpenRouter API Integration
 * Tests the OPENROUTER_API_KEY and validates API connectivity
 */

const API_KEY = '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'

console.log('🔍 Testing OpenRouter API Integration\n')
console.log('📋 Configuration:')
console.log(`   API Key: ${API_KEY.substring(0, 20)}...`)
console.log(`   API Endpoint: https://openrouter.ai/api/v1/chat/completions`)
console.log(`   Model: openai/gpt-3.5-turbo (fallback if available)\n`)

async function testOpenRouterAPI() {
  try {
    console.log('⏳ Sending test request to OpenRouter...\n')

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'SaaS Report Generator Test'
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant. Respond concisely.'
          },
          {
            role: 'user',
            content: 'Confirm your API key works by responding with exactly: "API Key is valid ✓"'
          }
        ],
        temperature: 0.7,
        max_tokens: 100
      })
    })

    console.log(`📊 Response Status: ${response.status} ${response.statusText}`)

    if (!response.ok) {
      const error = await response.json()
      console.error('\n❌ API Error:')
      console.error(JSON.stringify(error, null, 2))
      return false
    }

    const data = await response.json()
    console.log('\n✅ API Request Successful!\n')
    console.log('📝 Response:')
    console.log(`   Model: ${data.model}`)
    console.log(`   Message: ${data.choices[0]?.message?.content}`)
    console.log(`   Tokens Used: ${data.usage?.total_tokens || 'N/A'}`)
    console.log('\n✨ OpenRouter API is working correctly!')
    return true
  } catch (error) {
    console.error('\n❌ Test Failed:')
    console.error(error instanceof Error ? error.message : error)
    return false
  }
}

// Run test
testOpenRouterAPI().then(success => {
  process.exit(success ? 0 : 1)
})
