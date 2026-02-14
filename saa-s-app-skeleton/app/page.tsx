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
    <div className="min-h-screen bg-background">
      <Navbar />
      <FormDialog isOpen={isFormOpen} onClose={() => setFormOpen(false)} />

      <main className="min-h-screen">
        {/* Hero Section */}
        <section id="home" className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8">
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute top-20 right-10 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
          </div>
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="text-center space-y-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <span className="text-xs font-semibold text-primary">TRUSTED BY 10K+ TEAMS</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-tight">
                AI-Powered Project Reports in
                <span className="block bg-gradient-to-r from-primary via-pink-500 to-accent bg-clip-text text-transparent mt-2">
                  Minutes, Not Hours
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Connect your GitHub repositories, customize your preferences, and let our AI generate comprehensive, professional reports automatically. Perfect for teams, stakeholders, and project documentation.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <motion.button
                  onClick={() => setFormOpen(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-all transform inline-flex items-center justify-center gap-2 btn-glow"
                >
                  Start Generating Free
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  href="#how-it-works"
                  className="px-8 py-3 border border-muted hover:bg-muted/10 text-foreground font-semibold rounded-lg transition-colors hover-glow inline-flex items-center justify-center"
                >
                  Watch Demo
                </motion.a>
              </div>

              <div className="pt-8 flex flex-wrap justify-center gap-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">5 min</div>
                  <p className="text-sm text-muted-foreground">Average generation</p>
                </div>
                <div className="text-center border-l border-muted">
                  <div className="text-2xl font-bold text-foreground pl-8">99%</div>
                  <p className="text-sm text-muted-foreground pl-8">Satisfaction rate</p>
                </div>
                <div className="text-center border-l border-muted">
                  <div className="text-2xl font-bold text-foreground pl-8">24/7</div>
                  <p className="text-sm text-muted-foreground pl-8">Availability</p>
                </div>
              </div>

              <div className="pt-10 flex justify-center">
                <motion.a
                  href="#features"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  animate={{ y: [0, 8, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  Explore features
                  <ChevronDown className="w-4 h-4" />
                </motion.a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* USP Section */}
        <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-muted">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              <motion.div variants={itemVariants} className="space-y-4 p-6 rounded-lg bg-muted/5 border border-muted hover-glow-jiggle hover:border-primary/50 transition-colors">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center hover-glow">
                  <ZapIcon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Lightning Fast</h3>
                <p className="text-muted-foreground">Generate comprehensive reports in minutes using advanced AI algorithms and intelligent content extraction.</p>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-4 p-6 rounded-lg bg-muted/5 border border-muted hover-glow-jiggle hover:border-primary/50 transition-colors">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center hover-glow">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Professional Output</h3>
                <p className="text-muted-foreground">Get polished, publication-ready reports with proper formatting, sections, and visual hierarchy.</p>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-4 p-6 rounded-lg bg-muted/5 border border-muted hover-glow-jiggle hover:border-primary/50 transition-colors">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center hover-glow">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Data-Driven Insights</h3>
                <p className="text-muted-foreground">Extract meaningful metrics, analytics, and insights directly from your repository data.</p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-muted/5 border-t border-muted">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="text-center mb-14"
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
                  className="relative p-6 rounded-2xl border border-muted bg-muted/10 hover:border-primary/50 transition-colors"
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
                className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-all transform btn-glow"
              >
                Start a free report
              </button>
            </motion.div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="text-center mb-16"
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
                  className="flex gap-4 p-6 rounded-lg bg-muted/5 border border-muted hover:border-primary/50 transition-colors"
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
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/5 border-y border-muted">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="text-center mb-12"
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
                  className="p-6 rounded-lg bg-muted/10 border border-muted"
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
        <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="text-center mb-14"
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
                  className={`rounded-2xl border border-muted p-6 bg-muted/5 ${
                    plan.name === 'Team' ? 'shadow-xl border-primary/50 bg-primary/5' : ''
                  }`}
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
                    className="mt-6 w-full px-4 py-2 rounded-lg border border-muted hover:border-primary/50 hover-glow"
                  >
                    Choose {plan.name}
                  </button>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Security Section */}
        <section id="security" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/5 border-y border-muted">
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
                  <Link href="/docs" className="px-5 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90">
                    Read security docs
                  </Link>
                  <button
                    onClick={() => setFormOpen(true)}
                    className="px-5 py-2 rounded-lg border border-muted hover:border-primary/50 hover-glow"
                  >
                    Request a demo
                  </button>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-6">
                <div className="p-6 rounded-2xl border border-muted bg-background">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Compliance</p>
                  <p className="text-2xl font-bold text-foreground mt-2">SOC 2-ready exports</p>
                  <p className="text-sm text-muted-foreground mt-3">Export bundles include audit metadata, timestamps, and report fingerprints.</p>
                </div>
                <div className="p-6 rounded-2xl border border-muted bg-background">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Data Control</p>
                  <p className="text-2xl font-bold text-foreground mt-2">Zero retention by default</p>
                  <p className="text-sm text-muted-foreground mt-3">Choose how long to keep generated reports or wipe instantly.</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Trust Signals */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div variants={itemVariants}>
                <div className="text-3xl font-bold text-primary mb-2">10K+</div>
                <p className="text-muted-foreground text-sm">Active Users</p>
              </motion.div>
              <motion.div variants={itemVariants}>
                <div className="text-3xl font-bold text-primary mb-2">50M+</div>
                <p className="text-muted-foreground text-sm">Reports Generated</p>
              </motion.div>
              <motion.div variants={itemVariants}>
                <div className="text-3xl font-bold text-primary mb-2">99.9%</div>
                <p className="text-muted-foreground text-sm">Uptime SLA</p>
              </motion.div>
              <motion.div variants={itemVariants}>
                <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                <p className="text-muted-foreground text-sm">Support</p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Lead Capture Form */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-muted/5 to-background">
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
              className="w-full px-8 py-4 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-semibold rounded-lg transition-all transform btn-glow"
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
        <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-muted">
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
                  <AccordionItem value={`item-${idx}`} className="border border-muted rounded-lg px-6 hover-glow hover:border-primary/50 transition-colors">
                    <AccordionTrigger className="hover:text-primary transition-colors link-glow">
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
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/5 border-t border-muted text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-4xl font-bold text-foreground">Don't Let Manual Reports Slow You Down</h2>
            <p className="text-lg text-muted-foreground">Join thousands of teams saving time with AI-powered report generation.</p>
            <button
              onClick={() => setFormOpen(true)}
              className="inline-flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-all transform hover:scale-105"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-sm text-muted-foreground">No credit card required. Includes 5 free reports.</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-muted py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/#features" className="link-glow hover:text-foreground">Features</Link></li>
                <li><Link href="/#pricing" className="link-glow hover:text-foreground">Pricing</Link></li>
                <li><Link href="/#security" className="link-glow hover:text-foreground">Security</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="link-glow hover:text-foreground">About</Link></li>
                <li><Link href="/docs#release-notes" className="link-glow hover:text-foreground">Blog</Link></li>
                <li><Link href="/about#careers" className="link-glow hover:text-foreground">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/docs" className="link-glow hover:text-foreground">Docs</Link></li>
                <li><Link href="/docs#guides" className="link-glow hover:text-foreground">Guides</Link></li>
                <li><Link href="/docs#api" className="link-glow hover:text-foreground">API</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/docs#privacy" className="link-glow hover:text-foreground">Privacy</Link></li>
                <li><Link href="/docs#terms" className="link-glow hover:text-foreground">Terms</Link></li>
                <li><Link href="/about#contact" className="link-glow hover:text-foreground">Contact</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-muted pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
            <p>© 2024 TwoFastTwoMCP. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="https://x.com" target="_blank" rel="noreferrer" className="link-glow hover:text-foreground">Twitter</a>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="link-glow hover:text-foreground">GitHub</a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="link-glow hover:text-foreground">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
