import { NextResponse } from 'next/server'
import { MCP_TOOLS } from '@/lib/mcp-tools'

export async function GET() {
  return NextResponse.json({ tools: Object.values(MCP_TOOLS) })
}

export const runtime = 'nodejs'
