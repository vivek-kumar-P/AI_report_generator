import { NextResponse } from 'next/server'
import { createUser } from '@/lib/users'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (name && name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Name must be at least 2 characters' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Password validation
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Create user
    const user = await createUser(email, password, name?.trim())

    return NextResponse.json(
      { message: 'User created successfully', userId: user._id.toString() },
      { status: 201 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    
    // Log detailed error for debugging
    console.error('Signup error:', error)
    console.error('Error message:', message)
    
    if (message === 'User already exists') {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      )
    }

    // Check for MongoDB connection errors
    if (message.includes('MONGODB_URI') || message.includes('connect')) {
      return NextResponse.json(
        { error: 'Database connection failed. Please contact support.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: `Failed to create user: ${message}` },
      { status: 500 }
    )
  }
}
