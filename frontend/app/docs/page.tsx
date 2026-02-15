'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import Navbar from '@/components/Navbar'
import { Check, FileText, Download, ArrowRight } from 'lucide-react'

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background/95 landing-shell">
      <Navbar />

      <main className="pt-24 pb-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.section
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Docs</p>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mt-3">Get from repo to report in minutes</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mt-4">
              Everything you need to generate, review, and export polished project reports.
            </p>
          </motion.section>

          <section id="quickstart" className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start mb-14">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Quickstart</h2>
              <p className="text-muted-foreground mt-3">
                Start by connecting a GitHub repo, define your template preferences, and let the generator assemble
                a report in real time.
              </p>
              <div className="mt-6 space-y-3 text-sm text-muted-foreground">
                {[
                  'Open the Generate dialog and validate the repository URL.',
                  'Set a maximum page count and add any extra prompts.',
                  'Preview the report, request edits, and export to PDF.'
                ].map((step) => (
                  <div key={step} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-1" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/#how-it-works"
                className="inline-flex items-center gap-2 mt-6 px-5 py-2 rounded-lg font-semibold cta-primary"
              >
                See the workflow
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="rounded-2xl glow-panel slow-transition p-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">CLI-free</p>
              <h3 className="text-2xl font-bold text-foreground mt-2">Generate straight from the UI</h3>
              <p className="text-muted-foreground mt-3">
                The generator shows live status updates, page counts, and a real-time preview as the report builds.
              </p>
            </div>
          </section>

          <section id="guides" className="mb-14">
            <h2 className="text-3xl font-bold text-foreground">Guides</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {[
                {
                  title: 'Structuring reports',
                  desc: 'Learn how templates and prompts control the final narrative.'
                },
                {
                  title: 'Stakeholder-ready exports',
                  desc: 'Add consistent headers, footers, and compliance metadata.'
                },
                {
                  title: 'Team collaboration',
                  desc: 'Share, review, and approve reports with your team.'
                }
              ].map((guide) => (
                <div key={guide.title} className="rounded-2xl glow-panel slow-transition p-6">
                  <h3 className="text-lg font-semibold text-foreground">{guide.title}</h3>
                  <p className="text-muted-foreground mt-3">{guide.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="api" className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start mb-14">
            <div>
              <h2 className="text-3xl font-bold text-foreground">API access</h2>
              <p className="text-muted-foreground mt-3">
                Integrate TwoFastTwoMCP with internal tooling using the upcoming API.
                Manage exports, templates, and report metadata programmatically.
              </p>
              <div className="mt-6 space-y-3 text-sm text-muted-foreground">
                {[
                  'Create reports via REST endpoints.',
                  'Sync templates across teams.',
                  'Export PDFs on a schedule.'
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-1" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl glow-panel slow-transition p-6">
              <div className="flex items-center gap-2 text-primary">
                <FileText className="w-5 h-5" />
                <span className="text-sm font-semibold uppercase tracking-widest">Preview</span>
              </div>
              <pre className="mt-4 text-xs text-muted-foreground bg-black/40 rounded-lg p-4 overflow-x-auto">
{`POST /api/reports\n{\n  "repo": "github.com/org/project",\n  "maxPages": 12,\n  "template": "stakeholder"\n}`}
              </pre>
            </div>
          </section>

          <section id="export" className="rounded-2xl glow-panel slow-transition p-8 mb-14">
            <div className="flex items-center gap-3 text-primary">
              <Download className="w-5 h-5" />
              <span className="text-sm font-semibold uppercase tracking-widest">PDF export</span>
            </div>
            <h2 className="text-3xl font-bold text-foreground mt-3">High-fidelity exports</h2>
            <p className="text-muted-foreground mt-3">
              Export uses HTML-to-canvas rendering and stitches pages into a clean A4 PDF.
              Preview pages match the exported output to avoid formatting surprises.
            </p>
          </section>

          <section id="release-notes" className="mb-14">
            <h2 className="text-3xl font-bold text-foreground">Release notes</h2>
            <div className="rounded-2xl glow-panel slow-transition p-6 mt-6">
              <p className="text-sm text-muted-foreground">February 2026</p>
              <h3 className="text-xl font-semibold text-foreground mt-2">PDF export rebuilt</h3>
              <p className="text-muted-foreground mt-3">
                Export now supports multi-page rendering, higher resolution capture, and consistent A4 sizing.
              </p>
            </div>
          </section>

          <section id="privacy" className="mb-10">
            <div className="rounded-2xl glow-panel slow-transition p-6">
              <h2 className="text-3xl font-bold text-foreground">Privacy</h2>
              <p className="text-muted-foreground mt-3">
                Repository contents are processed in memory and never stored by default. Export files remain on your device
                unless you explicitly share them.
              </p>
            </div>
          </section>

          <section id="terms" className="mb-10">
            <div className="rounded-2xl glow-panel slow-transition p-6">
              <h2 className="text-3xl font-bold text-foreground">Terms</h2>
              <p className="text-muted-foreground mt-3">
                TwoFastTwoMCP is provided as-is. Enterprise agreements are available for teams with custom security and
                compliance requirements.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
