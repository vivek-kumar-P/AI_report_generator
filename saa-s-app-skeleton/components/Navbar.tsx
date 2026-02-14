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
      <div className="glass-morphism flex items-center justify-between gap-8 rounded-full border border-white/20 bg-white/10 px-8 py-4 shadow-2xl backdrop-blur-lg transition-all dark:bg-black/10 w-full max-w-6xl">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent hidden sm:inline">
            TwoFastTwoMCP
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8 flex-1">
          <Link
            href="/"
            className={`text-sm font-medium link-glow transition-all ${
              isActive('/')
                ? 'text-foreground underline underline-offset-4'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Home
          </Link>
          <Link
            href="/about"
            className={`text-sm font-medium link-glow transition-all ${
              isActive('/about')
                ? 'text-foreground underline underline-offset-4'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            About
          </Link>
          <Link
            href="/docs"
            className={`text-sm font-medium link-glow transition-all ${
              isActive('/docs')
                ? 'text-foreground underline underline-offset-4'
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
            className="p-2 rounded-lg hover:bg-white/10 hover-glow transition-colors"
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
            className="whitespace-nowrap btn-glow"
          >
            Start Generating
          </Button>
        </div>
      </div>
    </nav>
  )
}
