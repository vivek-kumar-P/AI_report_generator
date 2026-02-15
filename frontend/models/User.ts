import mongoose, { Schema, model, models } from 'mongoose'

export interface IUser extends mongoose.Document {
  email: string
  password: string
  username?: string
  createdAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    username: {
      type: String,
      required: false,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

// Prevent model recompilation in development
const User = models.User || model<IUser>('User', UserSchema)

export default User
