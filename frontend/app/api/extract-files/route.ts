import { NextResponse } from 'next/server'
import JSZip from 'jszip'

export const runtime = 'nodejs'

// Supported text file extensions
const TEXT_EXTENSIONS = [
  '.txt', '.md', '.markdown', '.json', '.js', '.ts', '.tsx', '.jsx',
  '.py', '.java', '.cpp', '.c', '.h', '.hpp', '.cs', '.go', '.rs',
  '.php', '.rb', '.swift', '.kt', '.html', '.css', '.scss', '.sass',
  '.xml', '.yaml', '.yml', '.toml', '.ini', '.cfg', '.conf',
  '.sh', '.bash', '.zsh', '.fish', '.ps1', '.bat', '.cmd',
  '.sql', '.graphql', '.proto', '.dockerfile', '.gitignore',
  '.env.example', '.editorconfig', 'README', 'LICENSE', 'CHANGELOG'
]

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Check file type
    const fileName = file.name.toLowerCase()
    const isZip = fileName.endsWith('.zip')
    const isTarGz = fileName.endsWith('.tar.gz') || fileName.endsWith('.tgz')

    if (!isZip && !isTarGz) {
      return NextResponse.json(
        { error: 'Only ZIP and TAR.GZ files are supported' },
        { status: 400 }
      )
    }

    // Extract text files
    const extractedFiles: { path: string; content: string }[] = []

    if (isZip) {
      const arrayBuffer = await file.arrayBuffer()
      const zip = await JSZip.loadAsync(arrayBuffer)

      for (const [path, zipEntry] of Object.entries(zip.files)) {
        // Skip directories and hidden files
        if (zipEntry.dir || path.startsWith('.') || path.includes('/.')) {
          continue
        }

        // Check if it's a text file
        const isTextFile = TEXT_EXTENSIONS.some(ext => 
          path.toLowerCase().endsWith(ext) || 
          path.toLowerCase().split('/').pop() === ext.replace('.', '')
        )

        if (isTextFile) {
          try {
            const content = await zipEntry.async('string')
            // Limit file size to 100KB
            if (content.length <= 100000) {
              extractedFiles.push({
                path,
                content
              })
            }
          } catch (error) {
            console.error(`Failed to read ${path}:`, error)
            // Continue with next file
          }
        }
      }
    } else if (isTarGz) {
      // For TAR.GZ, we'll need to add tar extraction
      return NextResponse.json(
        { error: 'TAR.GZ support coming soon. Please use ZIP files for now.' },
        { status: 400 }
      )
    }

    if (extractedFiles.length === 0) {
      return NextResponse.json(
        { error: 'No text files found in the archive' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      files: extractedFiles,
      count: extractedFiles.length
    })

  } catch (error) {
    console.error('File extraction error:', error)
    return NextResponse.json(
      { error: 'Failed to extract files from archive' },
      { status: 500 }
    )
  }
}
