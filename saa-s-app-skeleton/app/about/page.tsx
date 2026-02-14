'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import Navbar from '@/components/Navbar'
import { ArrowRight, Check } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background landing-shell">
      <Navbar />

      <main className="pt-24 pb-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.section
            id="mission"
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">About</p>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mt-3">Documentation that moves as fast as your team</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mt-4">
              TwoFastTwoMCP is built to turn living GitHub repositories into polished, stakeholder-ready reports.
              Our mission is to remove the busy work between engineering and clarity.
            </p>
          </motion.section>

          <section id="values" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
            {[
              {
                title: 'Speed with precision',
                desc: 'Automate the heavy lifting without losing the details that matter.'
              },
              {
                title: 'Design-forward reports',
                desc: 'Every output is formatted, readable, and ready to share.'
              },
              {
                title: 'Privacy first',
                desc: 'We process repo data in memory and never store your source code.'
              }
            ].map((value) => (
              <div key={value.title} className="rounded-2xl glow-panel slow-transition p-6">
                <h3 className="text-xl font-semibold text-foreground">{value.title}</h3>
                <p className="text-muted-foreground mt-3">{value.desc}</p>
              </div>
            ))}
          </section>

          <section id="team" className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-14">
            <div>
              <h2 className="text-3xl font-bold text-foreground">A product team obsessed with clarity</h2>
              <p className="text-muted-foreground mt-4">
                We are designers and engineers who have shipped platforms for fintech, healthcare, and dev tools.
                TwoFastTwoMCP is the product we wanted while shipping fast-moving projects.
              </p>
              <div className="mt-6 space-y-3 text-sm text-muted-foreground">
                {[
                  'Product, engineering, and design are aligned on every release.',
                  'We document our own roadmap with the same tooling you use.',
                  'Every report is versioned, reviewable, and shareable.'
                ].map((point) => (
                  <div key={point} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-1" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl glow-panel slow-transition p-8">
              <p className="text-sm uppercase tracking-widest text-muted-foreground">Today</p>
              <h3 className="text-3xl font-bold text-foreground mt-2">10K+ teams</h3>
              <p className="text-muted-foreground mt-3">
                Product orgs, agencies, and founders use TwoFastTwoMCP to ship status updates and investor reports.
              </p>
            </div>
          </section>

          <section id="careers" className="rounded-2xl glow-panel slow-transition p-8 mb-14">
            <h2 className="text-3xl font-bold text-foreground">Careers</h2>
            <p className="text-muted-foreground mt-3">
              We are hiring across engineering, product, and customer success. If you want to build the future of
              documentation workflows, we would love to hear from you.
            </p>
            <Link
              href="/docs#guides"
              className="inline-flex items-center gap-2 mt-6 px-5 py-2 rounded-lg font-semibold cta-primary"
            >
              Explore open roles
              <ArrowRight className="w-4 h-4" />
            </Link>
          </section>

          <section id="contact" className="text-center">
            <h2 className="text-3xl font-bold text-foreground">Contact us</h2>
            <p className="text-muted-foreground mt-3">
              Want a private demo or have questions about rollout? Reach out and we will respond within a business day.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/docs#quickstart"
                className="px-5 py-2 rounded-lg font-semibold cta-secondary"
              >
                Read the docs
              </Link>
              <button
                className="px-5 py-2 rounded-lg font-semibold cta-primary"
                onClick={() => window.location.href = 'mailto:hello@twofasttwomcp.com'}
              >
                Email us
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
