const MCP_ENDPOINT =
  process.env.NEXT_PUBLIC_MCP_ENDPOINT || '/api/tools'

function getMcpBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return ''
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
}

export async function callMCP(
  toolName: string,
  args: Record<string, unknown> = {}
) {
  const url = `${getMcpBaseUrl()}${MCP_ENDPOINT}/call`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: toolName, args }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `MCP call failed with status ${response.status}`)
  }

  return response.json()
}
