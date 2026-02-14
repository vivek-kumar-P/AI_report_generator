# 📋 Complete Project Structure Reference

## Directory Tree (Vercel-Ready SaaS)

```
my-saas-app/
│
├── 📂 app/                              # Next.js App Router (Frontend + Backend)
│   │
│   ├── 📂 api/                          # API Routes (Replaces Express server)
│   │   ├── 📂 tools/
│   │   │   ├── route.ts                 # GET /api/tools (list all tools)
│   │   │   └── 📂 call/
│   │   │       └── route.ts             # POST /api/tools/call (execute tool)
│   │   └── 📂 health/
│   │       └── route.ts                 # GET /api/health (liveness probe)
│   │
│   ├── 📂 about/
│   │   └── page.tsx                     # /about route
│   ├── 📂 docs/
│   │   └── page.tsx                     # /docs route
│   ├── 📂 generate/
│   │   └── page.tsx                     # /generate (loading page)
│   ├── 📂 preview/
│   │   └── page.tsx                     # /preview (A4 preview + PDF export)
│   ├── 📂 export/
│   │   └── page.tsx                     # /export (export options)
│   │
│   ├── layout.tsx                       # Root layout (global wrapper)
│   ├── page.tsx                         # / (home page)
│   ├── globals.css                      # Global styles
│   └── error.tsx                        # Error boundary (optional)
│
├── 📂 components/                       # React Components
│   ├── 📂 ui/                           # shadcn UI Components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   └── ... (50+ other UI components)
│   │
│   ├── FormDialog.tsx                   # Report generation form
│   ├── A4Page.tsx                       # A4 page component (for PDF)
│   ├── Navbar.tsx                       # Navigation bar
│   └── theme-provider.tsx               # Dark/light theme provider
│
├── 📂 lib/                              # Core Logic & Utilities
│   ├── 📂 api/
│   │   └── mcp.ts                       # Frontend API client
│   │
│   ├── mcp-tools.ts                     # ⭐ MCP Tools (shared backend)
│   ├── github-validator.ts              # GitHub URL validation
│   ├── store.ts                         # Zustand state management
│   └── utils.ts                         # Helper utilities
│
├── 📂 hooks/                            # Custom React Hooks
│   ├── use-toast.ts                     # Toast notifications hook
│   └── use-mobile.ts                    # Mobile detection hook
│
├── 📂 public/                           # Static Assets
│   └── favicon.ico
│
├── 📄 next.config.mjs                   # Next.js configuration
├── 📄 tsconfig.json                     # TypeScript configuration
├── 📄 package.json                      # Dependencies & scripts
│
├── 📄 .env.local                        # 🔐 Local env vars (gitignored)
├── 📄 .env.example                      # Template for env vars
├── 📄 .gitignore                        # Git ignore rules
│
├── 📄 vercel.json                       # ⭐ Vercel deployment config
├── 📄 README_DEPLOYMENT.md              # Deployment guide
│
└── 📄 STRUCTURE_REFERENCE.md            # This file
```

---

## API Routes Structure

```
app/api/                         (API Routes)
├── tools/
│   ├── route.ts               (GET /api/tools - list tools)
│   └── call/
│       └── route.ts           (POST /api/tools/call - execute tool)
└── health/
    └── route.ts               (GET /api/health - health check)
```

**Each route.ts file is automatically a serverless function on Vercel.**

---

## Environment Variables

### .env.local (Local Development)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_MCP_ENDPOINT=/api/tools
```

### Vercel Dashboard (Production)
```
NEXT_PUBLIC_API_URL=https://your-app.vercel.app
NEXT_PUBLIC_MCP_ENDPOINT=/api/tools
```

---

## Critical Files for Vercel

✅ **Must Have:**
1. `app/api/tools/route.ts`
2. `app/api/tools/call/route.ts`
3. `lib/mcp-tools.ts`
4. `package.json`
5. `next.config.mjs`

✅ **Recommended:**
1. `vercel.json`
2. `.env.example`
3. `README_DEPLOYMENT.md`

