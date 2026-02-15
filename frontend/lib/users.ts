// MongoDB user utilities
import bcrypt from 'bcryptjs'
import User from '@/models/User'
import { connectDB } from '@/lib/mongodb'

export interface IUser {
  _id: string
  email: string
  password: string
  createdAt: Date
}

export async function createUser(email: string, password: string, username?: string) {
  await connectDB()

  // Check if user already exists
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    throw new Error('User already exists')
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10)

  // Create user
  const user = await User.create({
    email,
    password: hashedPassword,
    username: username || undefined,
  })

  return user
}

export async function verifyUser(email: string, password: string) {
  await connectDB()

  const user = await User.findOne({ email })
  if (!user) {
    return null
  }

  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) {
    return null
  }

  return user
}

export async function getUserByEmail(email: string) {
  await connectDB()
  return await User.findOne({ email })
}

export async function getUserById(id: string) {
  await connectDB()
  return await User.findById(id)
}
