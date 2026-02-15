import mongoose, { Schema, model, models } from 'mongoose'

export interface IReport extends mongoose.Document {
  userId: mongoose.Types.ObjectId
  title: string
  repoUrl: string
  reportMarkdown: string
  createdAt: Date
  pdfUrl?: string
}

const ReportSchema = new Schema<IReport>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    repoUrl: {
      type: String,
      required: true,
    },
    reportMarkdown: {
      type: String,
      required: true,
    },
    pdfUrl: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
)

// Prevent model recompilation in development
const Report = models.Report || model<IReport>('Report', ReportSchema)

export default Report
