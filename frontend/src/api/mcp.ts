const MCP_ENDPOINT =
  process.env.NEXT_PUBLIC_MCP_ENDPOINT || 'https://tacitly-predeficient-aidyn.ngrok-free.dev/tools'

function getMcpBaseUrl(): string {
  // Always use empty base since we have full URL in MCP_ENDPOINT
  return ''
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
      'ngrok-skip-browser-warning': 'true',
    },
    body: JSON.stringify({ name: toolName, args }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `MCP call failed with status ${response.status}`)
  }

  return response.json()
}
