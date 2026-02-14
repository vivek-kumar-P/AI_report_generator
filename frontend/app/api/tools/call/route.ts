import { NextRequest, NextResponse } from 'next/server'
import { callToolHandler } from '@/lib/mcp-tools'

export async function POST(req: NextRequest) {
  try {
    const { name, args } = await req.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Missing tool name' },
        { status: 400 }
      )
    }

    const result = await callToolHandler(name, args || {})

    return NextResponse.json({
      content: [
        {
          type: 'text',
          text: typeof result.result === 'string' 
            ? result.result 
            : JSON.stringify(result.result),
        },
      ],
      result: result.result || 'No content returned',
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error'
    console.error('[MCP] Tool error:', message)
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

export const runtime = 'nodejs'
