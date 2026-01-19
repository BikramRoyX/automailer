"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion, useScroll, useTransform } from "framer-motion"
import { Logo } from "@/components/logo"
import {
  ArrowRight,
  ShieldCheck,
  Mail,
  Users,
  Zap,
  Globe,
  BarChart3,
  Menu,
  Linkedin,
  Instagram,
  CheckCircle2,
  Lock,
  FileSpreadsheet,
  Activity
} from "lucide-react"
import { useState, useEffect } from "react"
import { SwipeableTemplates } from "@/components/dashboard/swipeable-templates"

// Particle Component
const Particles = () => {
  const [items, setItems] = useState<Array<{
    x: number;
    y: number;
    scale: number;
    duration: number;
    delay: number;
    width: number;
    height: number;
  }>>([])

  useEffect(() => {
    const newItems = [...Array(50)].map(() => ({
      x: Math.random() * (window.innerWidth),
      y: Math.random() * (window.innerHeight),
      scale: Math.random() * 0.5 + 0.5,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 10,
      width: Math.random() * 3 + 2,
      height: Math.random() * 3 + 2,
    }))
    setItems(newItems)
  }, [])

  if (items.length === 0) return null

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {items.map((item, i) => (
        <motion.div
          key={i}
          className="absolute bg-white rounded-full opacity-0"
          initial={{
            x: item.x,
            y: item.y,
            scale: item.scale,
            opacity: 0
          }}
          animate={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000), // Animate to new random pos
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
            opacity: [0, 0.5, 0],
            scale: [0.5, 1, 0.5]
          }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: item.delay
          }}
          style={{
            width: item.width + "px",
            height: item.height + "px",
          }}
        />
      ))}
    </div>
  )
}

export default function LandingPage() {
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95])

  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-indigo-500/30">

      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="#">
            <Logo textClassName="text-lg tracking-tight" />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link className="text-sm font-medium text-gray-400 hover:text-white transition-colors" href="#how-it-works">How it Works</Link>
            <Link className="text-sm font-medium text-gray-400 hover:text-white transition-colors" href="#safety">Trust & Safety</Link>
          </nav>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
              Log in
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-white text-black hover:bg-gray-200 rounded-full px-6 font-medium">
                Get Started
              </Button>
            </Link>
          </div>

          <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Menu />
          </button>
        </div>
      </header>

      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-0 z-40 bg-black pt-24 px-6 md:hidden"
        >
          <nav className="flex flex-col gap-6 text-xl">
            <Link onClick={() => setIsMenuOpen(false)} href="#features">Features</Link>
            <Link onClick={() => setIsMenuOpen(false)} href="#how-it-works">How It Works</Link>
            <Link onClick={() => setIsMenuOpen(false)} href="/login">Login</Link>
            <Link onClick={() => setIsMenuOpen(false)} href="/register">
              <span className="text-indigo-400">Get Started</span>
            </Link>
          </nav>
        </motion.div>
      )}

      <main className="flex-1">

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
          {/* Global Particles */}
          <Particles />

          {/* Aurora Background Effects */}
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[4s]"></div>
          <div className="absolute top-[10%] right-[-5%] w-[400px] h-[400px] bg-purple-600/30 rounded-full blur-[100px] mix-blend-screen"></div>
          <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen"></div>

          <div className="container px-4 mx-auto relative z-10 text-center">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                style={{ opacity, scale }}
                className="space-y-8 text-left z-20"
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-indigo-300 backdrop-blur-sm"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                  </span>
                  v2.0 Now Live: Intelligent Role Detection
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]"
                >
                  Your Intelligent <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                    One-Click Email Agent.
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-lg md:text-xl text-gray-400 max-w-xl leading-relaxed"
                >
                  Safely send personalized HR outreach using your <strong>own Google account</strong>. No bulk spam, no shared reputation—just you, amplified.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex flex-col sm:flex-row gap-4 pt-2"
                >
                  <Link href="/register">
                    <Button size="lg" className="h-14 px-8 text-base bg-white text-black hover:bg-gray-200 rounded-full w-full sm:w-auto font-bold transition-transform hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                      Start Sending Free
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="#demo">
                    <Button variant="ghost" size="lg" className="h-14 px-8 text-base text-gray-400 hover:text-white hover:bg-white/5 rounded-full w-full sm:w-auto">
                      How it works
                    </Button>
                  </Link>
                </motion.div>

                <div className="flex items-center gap-4 text-sm text-gray-500 pt-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border border-black bg-gray-800 flex items-center justify-center text-xs text-white">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      </div>
                    ))}
                  </div>
                  <span>Trusted by 500+ Professionals</span>
                </div>
              </motion.div>

              {/* Floating UI Mockup - Right Side */}
              <motion.div
                initial={{ opacity: 0, x: 40, rotateY: -20 }}
                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="relative perspective-1000 z-10 w-full max-w-2xl mx-auto md:mr-0"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 blur-[60px] -z-10 rounded-full"></div>

                {/* Reuse the SwipeableTemplates Component here */}
                <div className="transform scale-90 md:scale-100 origin-center md:origin-right">
                  <SwipeableTemplates isDemoMode={true} />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* How It Works Section (New) */}
        <section id="how-it-works" className="py-24 bg-zinc-950 border-y border-white/5">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">How AutoMailer Works</h2>
              <p className="text-gray-400">Launch your first campaign in 3 simple steps.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Step 1 */}
              <motion.div
                whileHover={{ y: -10 }}
                className="relative p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/50 transition-colors group hover:bg-white/10 hover:shadow-2xl hover:shadow-indigo-500/10"
              >
                <div className="absolute -top-6 -left-6 text-8xl font-black text-white/5 z-0 group-hover:text-indigo-500/10 transition-colors">01</div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Lock className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Connect Google Account</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Securely link your Gmail or Google Workspace account instantly. We never send without your permission.
                  </p>
                </div>
              </motion.div>

              {/* Step 2 */}
              <motion.div
                whileHover={{ y: -10 }}
                className="relative p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-colors group hover:bg-white/10 hover:shadow-2xl hover:shadow-purple-500/10"
              >
                <div className="absolute -top-6 -left-6 text-8xl font-black text-white/5 z-0 group-hover:text-purple-500/10 transition-colors">02</div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <FileSpreadsheet className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Upload & Review</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Upload your HR list and curated resume. Our system creates draft emails for you to preview. You always have full control before sending.
                  </p>
                </div>
              </motion.div>

              {/* Step 3 */}
              <motion.div
                whileHover={{ y: -10 }}
                className="relative p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-pink-500/50 transition-colors group hover:bg-white/10 hover:shadow-2xl hover:shadow-pink-500/10"
              >
                <div className="absolute -top-6 -left-6 text-8xl font-black text-white/5 z-0 group-hover:text-pink-500/10 transition-colors">03</div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-pink-500/20 text-pink-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Zap className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">One-Click Send</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Once approved, hit send. We pace deliveries intelligently (max 50/day) to ensure safety and professional etiquette.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Bento Grid Features */}
        <section id="features" className="py-24 bg-zinc-950/50">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Complete Toolbar for Job Hunters</h2>
              <p className="text-gray-400 text-lg">Every feature you need to organize your search and get hired.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {/* Feature 1 - Large */}
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                className="md:col-span-2 row-span-2 rounded-3xl p-8 bg-gradient-to-br from-gray-900 to-black border border-white/10 min-h-[350px] flex flex-col justify-between overflow-hidden relative group hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all"></div>

                <div className="relative z-10">
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 text-indigo-400 shadow-inner border border-white/5">
                    <ShieldCheck className="h-7 w-7" />
                  </div>
                  <h3 className="text-3xl font-bold mb-4">Direct Google Integration</h3>
                  <p className="text-gray-400 max-w-md text-lg leading-relaxed">
                    AutoMailer connects directly to your personal Google Account. This means your emails are sent with your authentic signature from your own domain, ensuring top-tier deliverability and trust.
                  </p>
                </div>
                <div className="mt-8 rounded-xl bg-black/50 border border-white/10 p-4 font-mono text-xs text-green-400 shadow-2xl">
                  <div className="flex gap-2 mb-2 border-b border-white/5 pb-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/20"></div>
                  </div>
                  {`> OAuth2 Authentication... OK`} <br />
                  {`> Verifying User Consent... GRANTED`} <br />
                  {`> Queuing 1 personal delivery... SAFE`}
                </div>
              </motion.div>

              {/* Feature 2 - Tall */}
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                className="md:col-span-1 row-span-2 rounded-3xl p-8 bg-white/5 border border-white/10 flex flex-col relative overflow-hidden group hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300"
              >
                <div className="absolute bottom-0 right-0 w-full h-1/2 bg-gradient-to-t from-purple-900/20 to-transparent"></div>
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 text-purple-400 shadow-inner border border-white/5">
                  <Zap className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold mb-4">Smart One-Click Limits</h3>
                <p className="text-gray-400 mb-8 leading-relaxed">
                  We strictly enforce a safe limit of <strong>50 emails per day</strong> to protect your account reputation. This ensures your outreach remains professional and human.
                </p>

                {/* Decorative Progress */}
                <div className="space-y-4 relative z-10 mt-auto bg-black/40 p-4 rounded-xl border border-white/5">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Daily Quota</span>
                    <span>42/50</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="w-[84%] h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                  </div>
                  <div className="text-xs text-indigo-300 pt-2 flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3" />
                    Safety Active
                  </div>
                </div>
              </motion.div>

              {/* Feature 3 */}
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                className="md:col-span-1 rounded-3xl p-6 bg-black border border-white/10 flex flex-col justify-start text-left hover:border-blue-500/30 transition-all duration-300 group hover:shadow-xl hover:shadow-blue-500/10"
              >
                <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-lg mb-2">Live Analytics</h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  See exactly when recruiters open your emails. We track pixel-based opens so you know who is interested.
                </p>
              </motion.div>

              {/* Feature 4 */}
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                className="md:col-span-1 rounded-3xl p-6 bg-black border border-white/10 flex flex-col justify-start text-left hover:border-green-500/30 transition-all duration-300 group hover:shadow-xl hover:shadow-green-500/10"
              >
                <div className="w-10 h-10 bg-green-500/20 text-green-400 rounded-lg flex items-center justify-center mb-4">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-lg mb-2">Bulk CSV Import</h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Drag & drop your lead lists. We automatically parse columns for Name, Company, and Email Address.
                </p>
              </motion.div>

              {/* Feature 5 */}
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                className="md:col-span-1 rounded-3xl p-6 bg-black border border-white/10 flex flex-col justify-start text-left hover:border-orange-500/30 transition-all duration-300 group hover:shadow-xl hover:shadow-orange-500/10"
              >
                <div className="w-10 h-10 bg-orange-500/20 text-orange-400 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-lg mb-2">Role Detection</h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Our system scans job titles to categorize leads (e.g. &quot;Tech Recruiter&quot; vs &quot;Engineering Manager&quot;).
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features End */}

        {/* Safety & Compliance Section */}
        <section id="safety" className="py-24 bg-black relative overflow-hidden">
          {/* Background Gradient */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[100px]"></div>

          <div className="container px-4 mx-auto relative z-10">
            <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/20 bg-green-500/10 text-green-400 text-xs font-bold tracking-wider uppercase">
                <ShieldCheck className="w-3 h-3" />
                Enterprise Grade Safety
              </div>
              <h2 className="text-3xl md:text-5xl font-bold">Your Reputation is Fragile. <br /> We Protect It.</h2>
              <p className="text-gray-400 text-lg">
                Other tools blast generic emails via shady SMTP servers, getting you blacklisted.
                <span className="text-white font-medium"> We do things differently.</span>
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Point 1 */}
              <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-green-500/30 transition-all group">
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-6 text-green-400 group-hover:scale-110 transition-transform">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Gmail API Verified</h3>
                <p className="text-gray-400 leading-relaxed">
                  We don't ask for your password. We use official Google OAuth2 to send emails
                  <span className="text-white"> exactly as if you typed them yourself</span>.
                </p>
              </div>

              {/* Point 2 */}
              <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-green-500/30 transition-all group">
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-6 text-green-400 group-hover:scale-110 transition-transform">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Human-Like Pacing</h3>
                <p className="text-gray-400 leading-relaxed">
                  Sending 500 emails in a second is a red flag. We add
                  <span className="text-white"> random 30-90s delays </span>
                  between every email to mimic natural human behavior.
                </p>
              </div>

              {/* Point 3 */}
              <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-green-500/30 transition-all group">
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-6 text-green-400 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Bounce Shield™</h3>
                <p className="text-gray-400 leading-relaxed">
                  Our system automatically verifies HR emails before sending. If an address looks risky,
                  <span className="text-white"> we skip it automatically </span>
                  to preserve your domain health.
                </p>
              </div>
            </div>

            {/* Comparison Table */}
            <div className="mt-20 max-w-4xl mx-auto bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
              <div className="grid grid-cols-3 p-6 border-b border-white/10 bg-white/5 font-bold text-sm md:text-base">
                <div className="text-gray-400">Feature</div>
                <div className="text-center text-red-400">Generic Mass Mailers</div>
                <div className="text-center text-green-400 flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4 fill-green-400" /> AutoMailer
                </div>
              </div>

              <div className="grid grid-cols-3 p-6 border-b border-white/5 text-sm md:text-base hover:bg-white/5 transition-colors">
                <div className="font-medium text-gray-300">Sending Method</div>
                <div className="text-center text-gray-500">Shared SMTP (Spammy)</div>
                <div className="text-center text-white font-medium">Your Gmail Account</div>
              </div>

              <div className="grid grid-cols-3 p-6 border-b border-white/5 text-sm md:text-base hover:bg-white/5 transition-colors">
                <div className="font-medium text-gray-300">Daily Limit</div>
                <div className="text-center text-gray-500">Unlimited (Dangerous)</div>
                <div className="text-center text-white font-medium">Safe 50/day Cap</div>
              </div>

              <div className="grid grid-cols-3 p-6 border-b border-white/5 text-sm md:text-base hover:bg-white/5 transition-colors">
                <div className="font-medium text-gray-300">Data Privacy</div>
                <div className="text-center text-gray-500">Stored on their servers</div>
                <div className="text-center text-white font-medium">Local & Secure</div>
              </div>

              <div className="grid grid-cols-3 p-6 text-sm md:text-base hover:bg-white/5 transition-colors">
                <div className="font-medium text-gray-300">Ban Risk</div>
                <div className="text-center text-red-500 font-bold">High</div>
                <div className="text-center text-green-500 font-bold">Near Zero</div>
              </div>
            </div>

          </div>

        </section>
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-indigo-900/20"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.2)_0,rgba(0,0,0,0)_70%)]"></div>

          <div className="container px-4 mx-auto relative z-10 text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Professional Outreach, Simplified.</h2>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Take control of your career with the most responsible, secure email agent available.
            </p>
            <Link href="/register">
              <Button className="h-16 px-12 text-xl bg-white text-black hover:bg-gray-100 rounded-full shadow-[0_0_50px_-10px_rgba(255,255,255,0.3)] transition-all transform hover:scale-105 font-bold">
                Set Up in Minutes
              </Button>
            </Link>
            <p className="mt-6 text-sm text-gray-500">No credit card required • Free tier included</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-black border-t border-white/10 pt-20 pb-10 text-sm">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-16">
            <div className="col-span-2 lg:col-span-2 pr-8">
              <Link href="#" className="mb-6 block">
                <Logo />
              </Link>
              <p className="text-gray-500 mb-6 max-w-xs leading-relaxed">
                Empowering job seekers to land their dream roles through direct, authentic connection. Built with privacy and deliverability at its core.
              </p>
              <div className="flex gap-4">
                <Link href="https://www.instagram.com/entrepreneur.bikram.roy/?__pwa=1" target="_blank" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/20 hover:text-white transition-all border border-white/5">
                  <Instagram className="h-5 w-5" />
                </Link>
                <Link href="https://www.linkedin.com/in/bikram-kumar-roy-19344b19a" target="_blank" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/20 hover:text-white transition-all border border-white/5">
                  <Linkedin className="h-5 w-5" />
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-white text-base">Product</h4>
              <ul className="space-y-4 text-gray-500">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#safety" className="hover:text-white transition-colors">Trust & Safety</Link></li>
                <li><Link href="#how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-white text-base">Resources</h4>
              <ul className="space-y-4 text-gray-500">
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/templates" className="hover:text-white transition-colors">Email Templates</Link></li>
                <li><Link href="/guide" className="hover:text-white transition-colors">Setup Guide</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-white text-base">Legal</h4>
              <ul className="space-y-4 text-gray-500">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600">© 2026 AutoMailer Inc. All rights reserved.</p>
            <div className="flex gap-6 text-gray-600">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                <span className="text-xs font-medium text-gray-400">All Systems Operational</span>
              </div>
            </div>
          </div>
        </div>
      </footer >
    </div >
  )
}
