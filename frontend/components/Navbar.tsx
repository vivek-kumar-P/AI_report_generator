'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Moon, Sun, Zap, LogOut, User, LayoutDashboard, ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useReportStore } from '@/lib/store'
import { useSession, signOut } from 'next-auth/react'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isDark, setIsDark] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isAtTop, setIsAtTop] = useState(true)
  const { setFormOpen, isFormOpen } = useReportStore()
  const { data: session, status } = useSession()
  const isGenerationRoute = pathname.startsWith('/generate')

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark')
    setIsDark(isDarkMode)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const atTop = window.scrollY < 8
      setIsAtTop(atTop)
      if (!atTop) {
        setIsCollapsed(true)
      }
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleDarkMode = () => {
    const html = document.documentElement
    if (html.classList.contains('dark')) {
      html.classList.remove('dark')
      setIsDark(false)
      localStorage.setItem('theme', 'light')
    } else {
      html.classList.add('dark')
      setIsDark(true)
      localStorage.setItem('theme', 'dark')
    }
  }

  const isActive = (path: string) => pathname === path

  useEffect(() => {
    if (isFormOpen) {
      setIsCollapsed(true)
    }
  }, [isFormOpen])

  useEffect(() => {
    if (isGenerationRoute) {
      setIsCollapsed(true)
    }
  }, [isGenerationRoute])

  useEffect(() => {
    if (isAtTop && !isFormOpen && !isGenerationRoute) {
      setIsCollapsed(false)
    }
  }, [isAtTop, isFormOpen, isGenerationRoute])

  const handleGenerateReport = () => {
    setFormOpen(true)
    setIsCollapsed(true)
    if (pathname !== '/') {
      router.push('/')
    }
  }

  const handleToggleNavbar = () => {
    if (isGenerationRoute) return
    setIsCollapsed((prev) => !prev)
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 flex pt-3 px-4 transition-all duration-700 ${
        isAtTop ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
      } ${isCollapsed ? 'justify-start' : 'justify-center'}`}
    >
      <div
        className={`nav-spectrum soft-glow flex items-center justify-between gap-5 rounded-2xl px-4 py-2 slow-transition backdrop-blur-md transition-all duration-700 ${
          isCollapsed ? 'w-auto' : 'w-full max-w-6xl'
        }`}
      >
        {isCollapsed ? (
          <button
            type="button"
            onClick={handleToggleNavbar}
            className="flex items-center gap-2 nav-glass-item slow-transition px-3 py-2 rounded-xl"
            aria-label="Toggle navigation"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 via-sky-400 to-orange-400 flex items-center justify-center shadow-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-semibold text-foreground hidden sm:inline">Menu</span>
          </button>
        ) : (
          <>
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 via-sky-400 to-orange-400 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-emerald-300 via-sky-300 to-orange-300 bg-clip-text text-transparent hidden sm:inline">
            TwoFastTwoMCP
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1 flex-1">
          <div className="relative group">
            <div className="flex items-center gap-1">
              <Link
                href="/"
                className={`nav-glass-item slow-transition px-3 py-2 text-sm font-semibold rounded-lg ${
                  isActive('/')
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                Home
              </Link>
              <button
                type="button"
                className="nav-glass-item slow-transition p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50"
                aria-haspopup="true"
                aria-label="Open navigation menu"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            <div className="absolute left-0 top-full mt-2 w-52 rounded-xl nav-glass-item slow-transition opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto">
              <div className="flex flex-col gap-1 p-2">
                <Link
                  href="/#features"
                  className="slow-transition rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50"
                >
                  Features
                </Link>
                <Link
                  href="/#how-it-works"
                  className="slow-transition rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50"
                >
                  Workflow
                </Link>
                <Link
                  href="/about"
                  className={`slow-transition rounded-lg px-3 py-2 text-sm font-semibold ${
                    isActive('/about')
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  About
                </Link>
                <Link
                  href="/docs"
                  className={`slow-transition rounded-lg px-3 py-2 text-sm font-semibold ${
                    isActive('/docs')
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  Docs
                </Link>
              </div>
            </div>
          </div>
          {session && (
            <Link
              href="/dashboard"
              className={`nav-glass-item slow-transition px-3 py-2 text-sm font-semibold rounded-lg flex items-center gap-1.5 ${
                isActive('/dashboard')
                  ? 'bg-gradient-to-r from-emerald-500/10 to-sky-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-emerald-500/5 hover:to-sky-500/5'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {!isFormOpen && (
            <Button
              size="sm"
              onClick={handleGenerateReport}
              className="nav-glass-item slow-transition bg-gradient-to-r from-emerald-500/70 to-sky-500/70 hover:from-emerald-600 hover:to-sky-600 shadow-lg hover:shadow-xl"
            >
              Generate Report
            </Button>
          )}
          <button
            type="button"
            onClick={handleToggleNavbar}
            className="p-2 rounded-lg nav-glass-item slow-transition hover:bg-muted/50"
            aria-label="Minimize navigation"
          >
            <Zap className="w-4 h-4 text-foreground" />
          </button>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg nav-glass-item slow-transition hover:bg-muted/50"
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-amber-500" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </button>

          {status === 'loading' ? (
            <div className="w-24 h-10 rounded-lg bg-muted/50 animate-pulse" />
          ) : session ? (
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg nav-glass-item slow-transition bg-gradient-to-r from-emerald-500/10 to-sky-500/10 border border-emerald-500/20">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-sky-400 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  {session.user?.email?.split('@')[0]}
                </span>
              </div>
              <Button
                onClick={() => signOut({ callbackUrl: '/' })}
                size="sm"
                variant="outline"
                className="gap-2 nav-glass-item slow-transition hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button
                  size="sm"
                  variant="outline"
                  className="nav-glass-item slow-transition hover:bg-primary/5 hover:border-primary/50"
                >
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  size="sm"
                  className="nav-glass-item slow-transition bg-gradient-to-r from-emerald-500/80 to-sky-500/80 hover:from-emerald-600 hover:to-sky-600 shadow-lg hover:shadow-xl"
                >
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
          </>
        )}
      </div>
    </nav>
  )
}
