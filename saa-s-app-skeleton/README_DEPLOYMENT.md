# SaaS Report Generator - Project Structure

## 📁 Directory Structure (Vercel-Ready)

```
saa-s-app-skeleton/
├── app/                           # Next.js App Router
│   ├── api/                       # API Routes (Backend)
│   │   ├── tools/
│   │   │   ├── route.ts          # GET /api/tools (list tools)
│   │   │   └── call/
│   │   │       └── route.ts      # POST /api/tools/call (execute tool)
│   │   └── health/
│   │       └── route.ts          # GET /api/health (liveness probe)
│   ├── page.tsx                  # Home page (/)
│   ├── layout.tsx                # Root layout
│   ├── about/page.tsx            # About page
│   ├── docs/page.tsx             # Docs page
│   ├── generate/page.tsx         # Report generation (loading)
│   ├── preview/page.tsx          # Preview & export
│   └── export/page.tsx           # Export options
│
├── components/                   # React Components
│   ├── ui/                       # shadcn UI Components
│   ├── Navbar.tsx
│   ├── FormDialog.tsx
│   ├── A4Page.tsx
│   ├── LiveGenerationPreview.tsx
│   └── theme-provider.tsx
│
├── lib/                          # Utilities & Core Logic
│   ├── mcp-tools.ts             # MCP Tool definitions & handlers
│   ├── api/
│   │   └── mcp.ts               # Frontend API client
│   ├── github-validator.ts       # GitHub URL validation
│   ├── github-fetcher.ts         # GitHub API interaction
│   ├── store.ts                  # Zustand state management
│   └── utils.ts                  # Helper utilities
│
├── hooks/                        # Custom React Hooks
│   ├── use-toast.ts
│   └── use-mobile.ts
│
├── styles/                       # Global Styles
│   └── globals.css
│
├── public/                       # Static Assets
│   └── favicon.ico
│
├── next.config.mjs               # Next.js Configuration
├── tsconfig.json                 # TypeScript Configuration
├── tailwind.config.ts            # Tailwind CSS Configuration
├── postcss.config.mjs            # PostCSS Configuration
├── components.json               # shadcn UI Configuration
├── package.json                  # Dependencies & Scripts
│
├── .env.example                  # Environment variables template
├── .env.local.example            # Local development template
├── .gitignore                    # Git ignore rules
│
├── vercel.json                   # Vercel deployment config
├── README.md                     # Project documentation
└── DEPLOYMENT_GUIDE.md           # Vercel deployment guide

```

---

## 🚀 Getting Started

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open browser:**
   ```
   http://localhost:3000
   ```

---

## 📤 Vercel Deployment

### Prerequisites
- GitHub account with repository push access
- Vercel account (free at vercel.com)

### Step 1: Prepare Repository

```bash
# Ensure all files are properly structured
# Run local build to verify
npm run build

# Commit all changes
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Step 2: Connect to Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Vercel auto-detects Next.js framework

### Step 3: Configure Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables:

```
NEXT_PUBLIC_API_URL = https://your-project-name.vercel.app
NEXT_PUBLIC_MCP_ENDPOINT = /api/tools
GITHUB_TOKEN = (optional) ghp_...
OPENAI_API_KEY = (optional) sk-...
DATABASE_URL = (optional) postgresql://...
```

### Step 4: Deploy

1. Click "Deploy"
2. Vercel builds and deploys automatically
3. Visit: `https://your-project-name.vercel.app`

---

## 🔌 API Endpoints

### Local Development
```
GET  http://localhost:3000/api/tools
POST http://localhost:3000/api/tools/call
GET  http://localhost:3000/api/health
```

### Production (Vercel)
```
GET  https://your-project-name.vercel.app/api/tools
POST https://your-project-name.vercel.app/api/tools/call
GET  https://your-project-name.vercel.app/api/health
```

---

## 🛠️ Available Tools

### 1. `hello`
Simple test tool to verify MCP is working.

```bash
curl -X POST http://localhost:3000/api/tools/call \
  -H "Content-Type: application/json" \
  -d '{"name": "hello", "args": {}}'
```

### 2. `scan_markdown_files`
Scans repository for markdown files.

```bash
curl -X POST http://localhost:3000/api/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "scan_markdown_files",
    "args": {"repoUrl": "https://github.com/owner/repo"}
  }'
```

### 3. `generate_project_report`
Generates a comprehensive project report.

```bash
curl -X POST http://localhost:3000/api/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "generate_project_report",
    "args": {
      "repoUrl": "https://github.com/owner/repo",
      "maxPages": 5,
      "extraPrompt": "Focus on architecture",
      "template": "standard",
      "markdownFiles": []
    }
  }'
```

---

## 📝 NPM Scripts

```bash
npm run dev       # Start dev server (http://localhost:3000)
npm run build     # Production build
npm start         # Run production server
npm run lint      # Run ESLint
npm run type-check # TypeScript type checking
```

---

## 🌍 Environment Variables

| Variable | Local | Vercel | Purpose |
|----------|-------|--------|---------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3000` | `https://your-domain.vercel.app` | Base URL for API calls |
| `NEXT_PUBLIC_MCP_ENDPOINT` | `/api/tools` | `/api/tools` | MCP tools endpoint path |
| `GITHUB_TOKEN` | (optional) | (from env vars) | GitHub API authentication |
| `OPENAI_API_KEY` | (optional) | (from env vars) | OpenAI LLM integration |
| `DATABASE_URL` | (optional) | (from env vars) | Database connection string |

---

## 🔒 Security Checklist

- [ ] `.env.local` is in `.gitignore` (never commit secrets)
- [ ] Use `.env.example` for template variables
- [ ] Sensitive keys stored only in Vercel dashboard
- [ ] API routes validate input
- [ ] CORS properly configured (if needed)
- [ ] Rate limiting implemented (future)

---

## 🧪 Testing

### Test the full flow:
1. Open http://localhost:3000
2. Click "Get Started" or any "Generate Report" button
3. Enter GitHub repository URL: `https://github.com/facebook/react`
4. Set max pages: 5
5. Add optional prompt: "Focus on core features"
6. Click "Generate Report"
7. Wait for report generation (2-3 seconds)
8. Preview report in A4 format
9. Click "Download PDF" to export

### Test API directly:
```bash
# Health check
curl http://localhost:3000/api/health

# List tools
curl http://localhost:3000/api/tools

# Call tool
curl -X POST http://localhost:3000/api/tools/call \
  -H "Content-Type: application/json" \
  -d '{"name": "hello", "args": {}}'
```

---

## 📚 File Purpose Reference

| File | Purpose |
|------|---------|
| `lib/mcp-tools.ts` | Tool definitions & execution logic (shared) |
| `app/api/tools/route.ts` | GET endpoint to list available tools |
| `app/api/tools/call/route.ts` | POST endpoint to execute tools |
| `lib/api/mcp.ts` | Frontend client for calling MCP tools |
| `lib/store.ts` | Zustand state management for report data |
| `components/FormDialog.tsx` | Form for repo URL & report settings |
| `app/generate/page.tsx` | Loading page with MCP tool chaining |
| `app/preview/page.tsx` | Preview & PDF export |

---

## 🆘 Troubleshooting

### "Tool not found" error
- Check tool name is correct
- Ensure `lib/mcp-tools.ts` has the tool defined

### "Cannot find module" error
- Check import paths use `@/` alias
- Verify file exists in correct location

### Build fails on Vercel
- Check `npm run build` passes locally first
- Review Vercel build logs for detailed error
- Ensure all dependencies are in `package.json`

### API endpoint not responding
- Check server is running: `npm run dev`
- Verify URL in environment variables
- Check browser console for network errors

---

## 🚀 Next Steps

1. **Add Real LLM**: Replace mock content generator with OpenAI API
2. **Add Authentication**: Implement user login with NextAuth.js
3. **Database**: Add PostgreSQL for saving reports
4. **Real GitHub Scanning**: Implement actual file fetching from repos
5. **Email Export**: Add option to email PDF reports

---

## 📖 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Zustand](https://github.com/pmndrs/zustand)

