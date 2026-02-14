'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useReportStore } from '@/lib/store'
import Navbar from '@/components/Navbar'
import FormDialog from '@/components/FormDialog'
import { motion } from 'framer-motion'
import { ArrowRight, Github, Zap, Check, Quote, ChevronDown, Lock, Zap as ZapIcon, BarChart3, FileText } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

export default function Home() {
  const { isFormOpen, setFormOpen } = useReportStore()
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  }

  return (
    <div className="min-h-screen bg-background landing-shell">
      <Navbar />
      <FormDialog isOpen={isFormOpen} onClose={() => setFormOpen(false)} />

      <main className="min-h-screen">
        {/* Hero Section */}
        <section id="home" className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="hero-orb hero-orb-cyan w-[420px] h-[420px] -top-32 -left-28" />
            <div className="hero-orb hero-orb-orange w-[360px] h-[360px] top-10 right-[-120px]" />
            <div className="hero-orb hero-orb-lime w-[280px] h-[280px] bottom-[-140px] left-[35%]" />
          </div>
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="space-y-7">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full glow-chip text-xs font-semibold text-foreground/80">
                  <span className="tracking-[0.3em]">LIVE AI WORKFLOWS</span>
                  <span className="text-[10px] text-foreground/60">10K+ TEAMS</span>
                </div>

                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-tight">
                  Build lightning-fast
                  <span className="block bg-gradient-to-r from-emerald-300 via-sky-300 to-orange-300 bg-clip-text text-transparent mt-2">
                    stakeholder reports
                  </span>
                </h1>

                <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                  Connect GitHub, shape the outline, and export A4-ready PDFs in minutes. Your team gets sharp summaries,
                  metrics, and clean visuals without the manual grind.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <motion.button
                    onClick={() => setFormOpen(true)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-3 rounded-lg font-semibold inline-flex items-center justify-center gap-2 cta-primary"
                  >
                    Start Generating
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                  <motion.a
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    href="#how-it-works"
                    className="px-8 py-3 rounded-lg font-semibold inline-flex items-center justify-center cta-secondary"
                  >
                    Watch the flow
                  </motion.a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                  {[
                    { label: 'Avg build time', value: '4.8 min' },
                    { label: 'Report accuracy', value: '99%' },
                    { label: 'Stakeholder-ready', value: '24/7' }
                  ].map((stat) => (
                    <motion.div
                      key={stat.label}
                      className="glow-panel rounded-xl p-4 text-center slow-transition"
                      whileHover={{ y: -4 }}
                    >
                      <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mt-1">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ChevronDown className="w-4 h-4" />
                  <a href="#features" className="link-glow hover:text-foreground">
                    Explore features
                  </a>
                </div>
              </div>

              <div className="space-y-5">
                <motion.div
                  className="glow-panel rounded-2xl p-6 slow-transition pulse-float"
                  whileHover={{ y: -6 }}
                >
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    Live preview
                    <span className="text-foreground/80">A4 Render</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground mt-4">Release Readout</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Auto-compiled milestones, commit highlights, and timeline metrics.
                  </p>
                  <div className="mt-4 space-y-3">
                    <div className="h-2 rounded-full bg-white/10">
                      <div className="h-2 rounded-full bg-gradient-to-r from-emerald-300 via-sky-300 to-orange-300 w-4/5" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                        <p className="text-xs text-muted-foreground">Insights</p>
                        <p className="text-lg font-semibold text-foreground">+18%</p>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                        <p className="text-xs text-muted-foreground">Velocity</p>
                        <p className="text-lg font-semibold text-foreground">2.1x</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { title: 'Smart summary', desc: 'Highlights + risks with zero fluff.' },
                    { title: 'One-click export', desc: 'PDFs that match the preview.' }
                  ].map((card) => (
                    <motion.div
                      key={card.title}
                      className="glow-panel rounded-2xl p-4 slow-transition"
                      whileHover={{ y: -4 }}
                    >
                      <p className="text-sm font-semibold text-foreground">{card.title}</p>
                      <p className="text-xs text-muted-foreground mt-2">{card.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* USP Section */}
        <section id="features" className="py-14 px-4 sm:px-6 lg:px-8 border-t border-muted">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              <motion.div variants={itemVariants} className="space-y-4 p-6 rounded-2xl glow-panel slow-transition" whileHover={{ y: -6 }}>
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-300/30 via-sky-300/30 to-orange-300/30 rounded-xl flex items-center justify-center">
                  <ZapIcon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Lightning Fast</h3>
                <p className="text-muted-foreground">Generate comprehensive reports in minutes using advanced AI algorithms and intelligent content extraction.</p>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-4 p-6 rounded-2xl glow-panel slow-transition" whileHover={{ y: -6 }}>
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-300/30 via-sky-300/30 to-orange-300/30 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Professional Output</h3>
                <p className="text-muted-foreground">Get polished, publication-ready reports with proper formatting, sections, and visual hierarchy.</p>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-4 p-6 rounded-2xl glow-panel slow-transition" whileHover={{ y: -6 }}>
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-300/30 via-sky-300/30 to-orange-300/30 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Data-Driven Insights</h3>
                <p className="text-muted-foreground">Extract meaningful metrics, analytics, and insights directly from your repository data.</p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-14 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-muted/5 border-t border-muted">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="text-center mb-10"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">How it works</p>
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mt-3">From repo to report in three steps</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-4">
                Connect your GitHub repo, pick the structure, and export clean A4-ready PDFs in minutes.
              </p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              {[
                {
                  step: '01',
                  title: 'Connect GitHub',
                  desc: 'Validate your repository and pull the structure, docs, and commits.',
                  icon: <Github className="w-6 h-6 text-primary" />
                },
                {
                  step: '02',
                  title: 'Design the outline',
                  desc: 'Set page limits, add prompts, and shape the report tone and format.',
                  icon: <Zap className="w-6 h-6 text-primary" />
                },
                {
                  step: '03',
                  title: 'Export instantly',
                  desc: 'Preview, refine, and download a crisp PDF ready for stakeholders.',
                  icon: <FileText className="w-6 h-6 text-primary" />
                }
              ].map((step, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="relative p-6 rounded-2xl glow-panel slow-transition"
                  whileHover={{ y: -6 }}
                >
                  <div className="absolute top-6 right-6 text-xs font-semibold text-muted-foreground">{step.step}</div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mt-5">{step.title}</h3>
                  <p className="text-muted-foreground mt-3">{step.desc}</p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="mt-12 flex justify-center"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <button
                onClick={() => setFormOpen(true)}
                className="px-8 py-3 rounded-lg font-semibold cta-primary"
              >
                Start a free report
              </button>
            </motion.div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-14 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="text-center mb-10"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">Why Choose Our Platform</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Everything you need to create stunning project reports</p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              {[
                { title: "GitHub Integration", desc: "Seamlessly connect any GitHub repository" },
                { title: "Smart AI Processing", desc: "Intelligent content extraction and summarization" },
                { title: "A4 Formatted Pages", desc: "Professional PDF-ready document layout" },
                { title: "Customizable Templates", desc: "Adjust structure and styling to your needs" },
                { title: "Instant Exports", desc: "Download reports in multiple formats" },
                { title: "Team Collaboration", desc: "Share and manage reports with your team" }
              ].map((benefit, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="flex gap-4 p-6 rounded-2xl glow-panel slow-transition"
                  whileHover={{ y: -4 }}
                >
                  <Check className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground">{benefit.title}</h3>
                    <p className="text-muted-foreground text-sm">{benefit.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="py-14 px-4 sm:px-6 lg:px-8 bg-muted/5 border-y border-muted">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="text-center mb-10"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Loved by Teams</h2>
              <p className="text-muted-foreground">Join thousands of satisfied users</p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              {[
                {
                  quote: "Saves us 12 hours per week on report generation. Absolutely game-changing.",
                  author: "Sarah Chen",
                  role: "Product Manager",
                  company: "TechCorp"
                },
                {
                  quote: "The AI understands our code structure perfectly. Reports are always accurate.",
                  author: "James Wilson",
                  role: "Tech Lead",
                  company: "StartupXYZ"
                },
                {
                  quote: "Finally a tool that makes documentation easy. Our stakeholders love it.",
                  author: "Maria Rodriguez",
                  role: "CTO",
                  company: "Enterprise Inc"
                }
              ].map((testimonial, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="p-6 rounded-2xl glow-panel slow-transition"
                  whileHover={{ y: -4 }}
                >
                  <Quote className="w-5 h-5 text-primary mb-4" />
                  <p className="text-foreground mb-4 italic">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}, {testimonial.company}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-14 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="text-center mb-10"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground">Simple, team-ready pricing</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-4">
                Start free and scale when you need deeper coverage, custom templates, and faster exports.
              </p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              {[
                {
                  name: 'Starter',
                  price: '$0',
                  desc: 'Perfect for evaluation and small repos.',
                  features: ['2 reports / month', 'Basic templates', 'PDF export']
                },
                {
                  name: 'Team',
                  price: '$29',
                  desc: 'Collaborate and ship documentation faster.',
                  features: ['20 reports / month', 'Custom sections', 'Shared workspace']
                },
                {
                  name: 'Scale',
                  price: '$99',
                  desc: 'Enterprise features with priority support.',
                  features: ['Unlimited reports', 'SOC2-ready exports', 'Dedicated onboarding']
                }
              ].map((plan, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className={`rounded-2xl p-6 glow-panel slow-transition ${
                    plan.name === 'Team' ? 'ring-1 ring-emerald-300/40' : ''
                  }`}
                  whileHover={{ y: -6 }}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                    {plan.name === 'Team' && (
                      <span className="text-xs font-semibold uppercase tracking-widest text-primary">Popular</span>
                    )}
                  </div>
                  <div className="mt-4">
                    <p className="text-4xl font-bold text-foreground">{plan.price}</p>
                    <p className="text-sm text-muted-foreground">per month</p>
                  </div>
                  <p className="text-muted-foreground mt-4">{plan.desc}</p>
                  <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => setFormOpen(true)}
                    className="mt-6 w-full px-4 py-2 rounded-lg cta-secondary"
                  >
                    Choose {plan.name}
                  </button>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Security Section */}
        <section id="security" className="py-14 px-4 sm:px-6 lg:px-8 bg-muted/5 border-y border-muted">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              <motion.div variants={itemVariants}>
                <div className="flex items-center gap-3 text-primary mb-4">
                  <Lock className="w-5 h-5" />
                  <span className="text-sm font-semibold uppercase tracking-widest">Security</span>
                </div>
                <h2 className="text-4xl font-bold text-foreground mb-4">Keep your data private and compliant</h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Reports are generated without storing your codebase. Encryption at rest, granular access control, and audit trails are included by default.
                </p>
                <div className="space-y-4 text-sm text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-primary mt-1" />
                    <span>Repository content is processed in-memory and discarded after export.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-primary mt-1" />
                    <span>Role-based access and signed download links for shared reports.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-primary mt-1" />
                    <span>Compliance-friendly exports with watermarking and audit metadata.</span>
                  </div>
                </div>
                <div className="mt-8 flex items-center gap-4">
                  <Link href="/docs" className="px-5 py-2 rounded-lg cta-primary font-semibold">
                    Read security docs
                  </Link>
                  <button
                    onClick={() => setFormOpen(true)}
                    className="px-5 py-2 rounded-lg cta-secondary"
                  >
                    Request a demo
                  </button>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-6">
                <div className="p-6 rounded-2xl glow-panel slow-transition">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Compliance</p>
                  <p className="text-2xl font-bold text-foreground mt-2">SOC 2-ready exports</p>
                  <p className="text-sm text-muted-foreground mt-3">Export bundles include audit metadata, timestamps, and report fingerprints.</p>
                </div>
                <div className="p-6 rounded-2xl glow-panel slow-transition">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Data Control</p>
                  <p className="text-2xl font-bold text-foreground mt-2">Zero retention by default</p>
                  <p className="text-sm text-muted-foreground mt-3">Choose how long to keep generated reports or wipe instantly.</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Trust Signals */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div variants={itemVariants} className="glow-panel rounded-2xl p-5 slow-transition" whileHover={{ y: -4 }}>
                <div className="text-3xl font-bold text-primary mb-2">10K+</div>
                <p className="text-muted-foreground text-sm">Active Users</p>
              </motion.div>
              <motion.div variants={itemVariants} className="glow-panel rounded-2xl p-5 slow-transition" whileHover={{ y: -4 }}>
                <div className="text-3xl font-bold text-primary mb-2">50M+</div>
                <p className="text-muted-foreground text-sm">Reports Generated</p>
              </motion.div>
              <motion.div variants={itemVariants} className="glow-panel rounded-2xl p-5 slow-transition" whileHover={{ y: -4 }}>
                <div className="text-3xl font-bold text-primary mb-2">99.9%</div>
                <p className="text-muted-foreground text-sm">Uptime SLA</p>
              </motion.div>
              <motion.div variants={itemVariants} className="glow-panel rounded-2xl p-5 slow-transition" whileHover={{ y: -4 }}>
                <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                <p className="text-muted-foreground text-sm">Support</p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Lead Capture Form */}
        <section className="py-14 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-muted/5 to-background">
          <div className="max-w-3xl mx-auto">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-foreground mb-4">Ready to Get Started?</h2>
              <p className="text-lg text-muted-foreground">Generate your first report free. No credit card required.</p>
            </motion.div>

            <motion.button
              onClick={() => setFormOpen(true)}
              className="w-full px-8 py-4 rounded-lg font-semibold cta-primary"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              viewport={{ once: true }}
            >
              Create Your First Report
              <ArrowRight className="w-5 h-5 inline ml-2" />
            </motion.button>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-14 px-4 sm:px-6 lg:px-8 border-t border-muted">
          <div className="max-w-3xl mx-auto">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-foreground mb-2">Frequently Asked Questions</h2>
              <p className="text-muted-foreground">Everything you need to know about our platform</p>
            </motion.div>

            <Accordion type="single" collapsible className="space-y-4">
              {[
                {
                  q: "How does the AI understand my GitHub repository?",
                  a: "Our AI analyzes your repository's README files, code structure, documentation, and commit history to understand your project comprehensively."
                },
                {
                  q: "What formats can I export reports in?",
                  a: "You can export reports as PDF, HTML, and Markdown formats. All formats maintain professional styling and formatting."
                },
                {
                  q: "Can I customize the report template?",
                  a: "Yes! You can choose from pre-built templates or create custom templates with your own structure, sections, and styling."
                },
                {
                  q: "Is my data secure and private?",
                  a: "Absolutely. We use enterprise-grade encryption, don't store your code, and comply with GDPR and SOC 2 standards."
                },
                {
                  q: "How long does report generation take?",
                  a: "Most reports are generated within 3-5 minutes, depending on repository size and complexity."
                },
                {
                  q: "Do you offer team plans?",
                  a: "Yes, we offer both individual and team plans with features like collaboration, shared templates, and bulk exports."
                }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                >
                  <AccordionItem value={`item-${idx}`} className="glow-panel rounded-2xl px-6 slow-transition">
                    <AccordionTrigger className="hover:text-primary transition-colors nav-link">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="py-14 px-4 sm:px-6 lg:px-8 bg-muted/5 border-t border-muted text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-4xl font-bold text-foreground">Don't Let Manual Reports Slow You Down</h2>
            <p className="text-lg text-muted-foreground">Join thousands of teams saving time with AI-powered report generation.</p>
            <button
              onClick={() => setFormOpen(true)}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-lg font-semibold cta-primary"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-sm text-muted-foreground">No credit card required. Includes 5 free reports.</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer-spectrum py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="glow-panel rounded-2xl p-4 slow-transition">
              <h4 className="font-semibold bg-gradient-to-r from-emerald-200 via-sky-200 to-orange-200 bg-clip-text text-transparent mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/#features" className="nav-link hover:text-foreground">Features</Link></li>
                <li><Link href="/#pricing" className="nav-link hover:text-foreground">Pricing</Link></li>
                <li><Link href="/#security" className="nav-link hover:text-foreground">Security</Link></li>
              </ul>
            </div>
            <div className="glow-panel rounded-2xl p-4 slow-transition">
              <h4 className="font-semibold bg-gradient-to-r from-emerald-200 via-sky-200 to-orange-200 bg-clip-text text-transparent mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="nav-link hover:text-foreground">About</Link></li>
                <li><Link href="/docs#release-notes" className="nav-link hover:text-foreground">Blog</Link></li>
                <li><Link href="/about#careers" className="nav-link hover:text-foreground">Careers</Link></li>
              </ul>
            </div>
            <div className="glow-panel rounded-2xl p-4 slow-transition">
              <h4 className="font-semibold bg-gradient-to-r from-emerald-200 via-sky-200 to-orange-200 bg-clip-text text-transparent mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/docs" className="nav-link hover:text-foreground">Docs</Link></li>
                <li><Link href="/docs#guides" className="nav-link hover:text-foreground">Guides</Link></li>
                <li><Link href="/docs#api" className="nav-link hover:text-foreground">API</Link></li>
              </ul>
            </div>
            <div className="glow-panel rounded-2xl p-4 slow-transition">
              <h4 className="font-semibold bg-gradient-to-r from-emerald-200 via-sky-200 to-orange-200 bg-clip-text text-transparent mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/docs#privacy" className="nav-link hover:text-foreground">Privacy</Link></li>
                <li><Link href="/docs#terms" className="nav-link hover:text-foreground">Terms</Link></li>
                <li><Link href="/about#contact" className="nav-link hover:text-foreground">Contact</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-muted pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
            <p>© 2026 TwoFastTwoMCP. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="https://x.com" target="_blank" rel="noreferrer" className="nav-link hover:text-foreground">Twitter</a>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="nav-link hover:text-foreground">GitHub</a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="nav-link hover:text-foreground">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
