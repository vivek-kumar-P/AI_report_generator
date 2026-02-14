'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Moon, Sun, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useReportStore } from '@/lib/store'

export default function Navbar() {
  const pathname = usePathname()
  const [isDark, setIsDark] = useState(false)
  const { setFormOpen } = useReportStore()

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark')
    setIsDark(isDarkMode)
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

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 flex justify-center pt-4 px-4">
      <div className="nav-spectrum flex items-center justify-between gap-6 rounded-2xl px-6 py-3 w-full max-w-6xl slow-transition">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 via-sky-400 to-orange-400 flex items-center justify-center shadow-lg">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-emerald-300 via-sky-300 to-orange-300 bg-clip-text text-transparent hidden sm:inline">
            TwoFastTwoMCP
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-6 flex-1">
          <Link
            href="/"
            className={`text-sm font-semibold nav-link ${
              isActive('/')
                ? 'text-foreground active'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Home
          </Link>
          <Link href="/#features" className="text-sm font-semibold nav-link text-muted-foreground hover:text-foreground">
            Features
          </Link>
          <Link href="/#how-it-works" className="text-sm font-semibold nav-link text-muted-foreground hover:text-foreground">
            Workflow
          </Link>
          <Link href="/#pricing" className="text-sm font-semibold nav-link text-muted-foreground hover:text-foreground">
            Pricing
          </Link>
          <Link href="/#faq" className="text-sm font-semibold nav-link text-muted-foreground hover:text-foreground">
            FAQ
          </Link>
          <Link
            href="/about"
            className={`text-sm font-semibold nav-link ${
              isActive('/about')
                ? 'text-foreground active'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            About
          </Link>
          <Link
            href="/docs"
            className={`text-sm font-semibold nav-link ${
              isActive('/docs')
                ? 'text-foreground active'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Docs
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg cta-secondary"
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
          <Button
            onClick={() => setFormOpen(true)}
            size="sm"
            className="whitespace-nowrap cta-primary"
          >
            Start Generating
          </Button>
        </div>
      </div>
    </nav>
  )
}
