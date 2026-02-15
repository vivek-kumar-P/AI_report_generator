# TwoFastTwoMCP - AI Report Generator

A lightning-fast SaaS application that generates professional, publication-ready A4 reports from GitHub repositories or uploaded project files using advanced AI. Connect your GitHub repo, shape the outline, and export polished PDFs in minutes.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)
![OpenRouter](https://img.shields.io/badge/OpenRouter-GPT-orange)
![License](https://img.shields.io/badge/License-MIT-green)

## 🚀 Features

- **GitHub Integration**: Real-time repository scanning with markdown file extraction
- **Local File Support**: Generate reports from ZIP archives containing project files
- **Dynamic Page Control**: Set report length from 1–50 pages based on your needs
- **AI-Powered Reports**: OpenRouter API integration for intelligent content generation
- **A4-Ready Export**: Professional PDF export with TipTap editor for final customization
- **Dark Mode Support**: Seamless theme switching with localStorage persistence
- **Real-Time Generation**: Live streaming status updates during report creation
- **Authentication**: NextAuth.js with MongoDB for secure user sessions
- **Responsive Design**: Mobile-first UI with Framer Motion animations
- **Zoom Controls**: Fit-to-viewport, manual zoom, and page-by-page navigation

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [API Routes](#api-routes)
- [Features in Detail](#features-in-detail)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI (custom wrapper components)
- **Animations**: Framer Motion
- **Editor**: TipTap (rich text editor)
- **PDF Export**: html2canvas + jsPDF
- **State Management**: Zustand
- **Authentication**: NextAuth.js v5

### Backend
- **Runtime**: Node.js
- **MCP Server**: Model Context Protocol (@modelcontextprotocol/sdk)
- **HTTP Server**: Express.js
- **Database**: MongoDB Atlas + Mongoose
- **API Integration**: OpenRouter (GPT-3.5-turbo)
- **File Processing**: jszip for ZIP extraction

### Infrastructure
- **Deployment**: Vercel (frontend)
- **Database Hosting**: MongoDB Atlas
- **API Gateway**: OpenRouter
- **Version Control**: Git/GitHub

## 📁 Project Structure

```
twoFast_twoMCP/
├── frontend/                    # Next.js application
│   ├── app/
│   │   ├── api/                # API routes
│   │   │   ├── auth/           # Authentication endpoints
│   │   │   ├── extract-files/  # ZIP file extraction
│   │   │   ├── reports/        # Report CRUD operations
│   │   │   ├── health/         # Health check
│   │   │   └── tools/          # MCP tool calling
│   │   ├── (public)/           # Public pages
│   │   │   ├── page.tsx        # Homepage
│   │   │   ├── login/page.tsx  # Login
│   │   │   └── signup/page.tsx # Signup
│   │   ├── (protected)/        # Auth-required pages
│   │   │   ├── dashboard/      # User reports
│   │   │   ├── generate/       # Report generation flow
│   │   │   ├── preview/        # Report preview & editing
│   │   │   └── export/         # PDF export
│   │   ├── layout.tsx          # Root layout
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── Navbar.tsx          # Header navigation (sticky, scroll-fade)
│   │   ├── FormDialog.tsx      # Report generation form (GitHub/ZIP upload)
│   │   ├── A4Page.tsx          # A4 page renderer with editor
│   │   ├── LiveGenerationPreview.tsx  # Real-time generation status
│   │   ├── ParticleBackground.tsx    # Canvas particle effect
│   │   └── ui/                 # Radix UI components
│   ├── lib/
│   │   ├── store.ts            # Zustand store (state management)
│   │   ├── mcp-tools.ts        # MCP tool handlers
│   │   ├── github-fetcher.ts   # GitHub REST API client
│   │   ├── github-validator.ts # GitHub URL validation
│   │   ├── report-utils.ts     # Report splitting & formatting
│   │   ├── generation-stages.ts # Generation progress stages
│   │   ├── mongodb.ts          # MongoDB connection pooling
│   │   └── utils.ts            # Utility functions
│   ├── models/
│   │   ├── User.ts             # User schema
│   │   └── Report.ts           # Report schema
│   ├── middleware.ts           # Route protection
│   ├── next.config.mjs         # Next.js configuration
│   ├── tsconfig.json           # TypeScript config
│   ├── tailwind.config.ts      # Tailwind CSS config
│   ├── package.json
│   ├── package-lock.json
│   └── vercel.json             # Vercel deployment config
├── backend/                    # MCP + Express server
│   ├── index.js                # Entry point
│   ├── package.json
│   ├── pnpm-lock.yaml
│   └── test-*.js               # Test files
├── vercel.json                 # Root Vercel config (DEPRECATED)
└── README.md                   # This file
```

## 📋 Prerequisites

- **Node.js**: v20.16.0 or higher
- **npm**: v9.8.1 or higher
- **MongoDB Atlas**: Cloud database account with cluster
- **OpenRouter Account**: API key for LLM access
- **GitHub Account**: For OAuth (optional, for testing)
- **Git**: For version control

## 🚀 Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/vivek-kumar-P/AI_report_generator.git
cd twoFast_twoMCP
```

### 2. Install Dependencies

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### 3. Create Environment Files

#### Frontend (`frontend/.env.local`)

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-min-32-chars

# APIs
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxx
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_MCP_ENDPOINT=/api/tools

# Optional
GITHUB_TOKEN=ghp_xxxxxxxxxxxxx
```

#### Backend (Optional, for local MCP server)

```bash
# backend/.env
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxx
```

### 4. Generate NextAuth Secret

```bash
openssl rand -base64 32
```

Copy the output to `NEXTAUTH_SECRET` in `.env.local`.

### 5. Run Development Server

```bash
# Terminal 1: Frontend
cd frontend
npm run dev
# Opens http://localhost:3000

# Terminal 2: Backend (optional local MCP)
cd backend
node index.js
# MCP server on http://localhost:8000
```

### 6. Access the Application

- **Homepage**: http://localhost:3000
- **Dashboard**: http://localhost:3000/dashboard (requires login)
- **Generate Report**: Click "Generate Report" button

## ⚙️ Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `NEXTAUTH_URL` | NextAuth callback URL (must match deployed URL) | `https://app.vercel.app` |
| `NEXTAUTH_SECRET` | JWT signing secret (min 32 chars) | `openssl rand -base64 32` |
| `NEXTAUTH_PROVIDERS_CREDENTIALS_PASSWORD` | Credentials password override | (optional) |
| `OPENROUTER_API_KEY` | OpenRouter LLM API key | `sk-or-v1-...` |
| `NEXT_PUBLIC_API_URL` | Frontend API base URL | `http://localhost:3000` |
| `NEXT_PUBLIC_MCP_ENDPOINT` | MCP endpoint path | `/api/tools` |
| `GITHUB_TOKEN` | GitHub API token (optional, for rate limits) | `ghp_...` |

### Obtaining API Keys

#### MongoDB Atlas
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster and database user
3. Copy the connection string to `MONGODB_URI`
4. Add your IP to Network Access

#### OpenRouter
1. Sign up at [OpenRouter.ai](https://openrouter.ai)
2. Go to Keys → Create Key
3. Copy the API key to `OPENROUTER_API_KEY`

#### GitHub API (Optional)
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Create a token with `repo` scope
3. Add to `GITHUB_TOKEN`

## 🚀 Deployment

### Deploy to Vercel

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Select your GitHub repository
   - Set Root Directory to `frontend`

3. **Configure Environment Variables**
   - In Vercel Project Settings → Environment Variables, add:
     - `MONGODB_URI`
     - `NEXTAUTH_URL` (your Vercel domain)
     - `NEXTAUTH_SECRET`
     - `OPENROUTER_API_KEY`

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically
   - Update `NEXTAUTH_URL` to your Vercel domain after first deployment

### MongoDB Atlas Network Access

⚠️ **Important**: Allow Vercel IPs to access MongoDB

1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Select "Allow access from anywhere" (`0.0.0.0/0`)
4. Click "Confirm"

### Update NEXTAUTH_URL

After Vercel deployment completes:

1. Copy your Vercel deployment URL (e.g., `https://app-xyz.vercel.app`)
2. Update `NEXTAUTH_URL` in Vercel Environment Variables
3. Trigger a redeploy

## 📡 API Routes

### Public Routes
- `GET /api/health` - Health check

### Authentication
- `POST /api/auth/signup` - Create user account
- `POST /api/auth/[...nextauth]` - NextAuth endpoints (login, session, etc.)

### Tools & MCP
- `GET /api/tools` - List available tools
- `POST /api/tools/call` - Execute MCP tool

### File Processing
- `POST /api/extract-files` - Extract files from ZIP archive

### Reports
- `GET /api/reports` - List user reports (protected)
- `GET /api/reports/:id` - Get report by ID (protected)
- `POST /api/reports` - Create report (protected)
- `DELETE /api/reports/:id` - Delete report (protected)

## 🎯 Features in Detail

### 1. Report Generation Flow

1. **Input**: User provides GitHub URL or uploads ZIP file
2. **File Scanning**: Extract markdown files from source
3. **AI Generation**: OpenRouter processes files and generates comprehensive report
4. **Pagination**: Report automatically split into A4-sized pages
5. **Editing**: User can customize content with TipTap editor
6. **Export**: Download as PDF with A4 formatting

### 2. Dynamic Page Control

- Set pages from 1–50 during generation
- Adjust after generation in preview page
- Each page automatically scales to A4 size
- Zoom controls: Fit, -, +, 100%, Up/Down navigation

### 3. GitHub Integration

- Real-time repository validation
- Automatic README, CHANGELOG, and .md file detection
- Content extraction with rate limit handling
- Support for private repos (with GitHub token)

### 4. ZIP Upload Support

- Accepts `.zip` files (`.tar.gz` coming soon)
- Extracts text files (code, markdown, config, etc.)
- 100KB per file size limit
- Up to 50 files per archive

### 5. Authentication

- Email/password credentials provider (NextAuth.js)
- MongoDB session storage
- JWT-based token authentication
- Protected routes with middleware
- Auto-logout on browser close

### 6. Real-Time UI

- Live generation progress with stage tracking
- Streaming page previews during generation
- Error recovery with retry logic
- Smooth animations with Framer Motion

## 🐛 Troubleshooting

### MongoDB Connection Issues

**Error**: `MongoNetworkError: connect ECONNREFUSED`

**Solution**:
1. Verify `MONGODB_URI` is correct
2. Check MongoDB Atlas Network Access includes your IP
3. Verify credentials in connection string

### OpenRouter API Errors

**Error**: `401 Unauthorized`

**Solution**:
1. Verify `OPENROUTER_API_KEY` is correct
2. Check API key has no leading/trailing spaces
3. Verify key is not expired in OpenRouter dashboard

### NextAuth Session Issues

**Error**: `Session not found` or redirect loops

**Solution**:
1. Verify `NEXTAUTH_URL` matches deployment domain
2. Verify `NEXTAUTH_SECRET` is 32+ characters
3. Check MongoDB connection for session storage
4. Clear browser cookies and try again

### Vercel Deployment Fails

**Error**: `No entrypoint found`

**Solution**:
1. Verify Root Directory is set to `frontend` in Vercel settings
2. Verify `frontend/package.json` exists
3. Delete root `package.json` if it exists
4. Trigger fresh deployment

### File Upload Not Working

**Error**: `Failed to extract files`

**Solution**:
1. Ensure ZIP file is not corrupted
2. Check file size (max recommended: 50MB)
3. Verify supported file extensions in log
4. Try re-uploading

## 📚 Documentation

- **GitHub Fetcher**: See [lib/github-fetcher.ts](frontend/lib/github-fetcher.ts)
- **Report Utils**: See [lib/report-utils.ts](frontend/lib/report-utils.ts)
- **MCP Tools**: See [lib/mcp-tools.ts](frontend/lib/mcp-tools.ts)
- **Generation Stages**: See [lib/generation-stages.ts](frontend/lib/generation-stages.ts)
- **Store (State)**: See [lib/store.ts](frontend/lib/store.ts)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙋 Support

For issues, questions, or feature requests:
- Open a GitHub Issue
- Check existing [Troubleshooting](#troubleshooting) section
- Review deployment configuration in `frontend/vercel.json`

## 🔗 Links

- **Live App**: https://ai-report-generator.vercel.app
- **GitHub**: https://github.com/vivek-kumar-P/AI_report_generator
- **OpenRouter API**: https://openrouter.ai
- **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas
- **Next.js Docs**: https://nextjs.org/docs
- **Vercel Docs**: https://vercel.com/docs

---

**Built with ⚡ by TwoFastTwoMCP Team**

Last updated: February 15, 2026
