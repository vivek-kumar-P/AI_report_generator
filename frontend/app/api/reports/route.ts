import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import Report from '@/models/Report'

export const runtime = 'nodejs'

// GET - Fetch all reports for the logged-in user
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectDB()

    const reports = await Report.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .select('_id title repoUrl createdAt pdfUrl')
      .lean()

    return NextResponse.json({ reports })
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    )
  }
}

// POST - Save a new report
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { title, repoUrl, reportMarkdown, pdfUrl } = await req.json()

    if (!title || !repoUrl || !reportMarkdown) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    await connectDB()

    const report = await Report.create({
      userId: session.user.id,
      title,
      repoUrl,
      reportMarkdown,
      pdfUrl,
    })

    return NextResponse.json(
      { 
        message: 'Report saved successfully',
        reportId: report._id.toString()
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error saving report:', error)
    return NextResponse.json(
      { error: 'Failed to save report' },
      { status: 500 }
    )
  }
}
