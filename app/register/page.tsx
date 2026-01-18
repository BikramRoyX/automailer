"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"
import { Loader2, Mail, CheckCircle2, ArrowRight } from "lucide-react"
import { Logo } from "@/components/logo"
import { SwipeableCards } from "@/components/swipeable-cards"

export default function RegisterPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || "Registration failed")
            }

            router.push("/login")
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen w-full bg-black text-white selection:bg-indigo-500/30 font-sans">
            {/* Left Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col p-8 md:p-12 lg:p-16 relative z-10 bg-black/50 backdrop-blur-sm">
                <div className="mb-10">
                    <Link href="/" className="fit-content">
                        <Logo />
                    </Link>
                </div>

                <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-2 mb-8"
                    >
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                            Create your account
                        </h1>
                        <p className="text-gray-400">
                            Get started with <span className="text-indigo-400 font-medium">50 free emails/day</span>. No credit card required.
                        </p>
                    </motion.div>

                    {/* Social Buttons Mockup */}
                    <Button
                        variant="outline"
                        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                        className="w-full h-12 border-white/10 bg-white/5 hover:bg-white/10 hover:text-white text-gray-300 font-medium rounded-xl transition-all"
                    >
                        <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </Button>

                    <div className="relative mb-8">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-black px-2 text-gray-500 font-medium tracking-wider">
                                Or continue with email
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-gray-300">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-indigo-500/50 focus:bg-white/10 rounded-xl transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium text-gray-300">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="h-12 bg-white/5 border-white/10 text-white focus:border-indigo-500/50 focus:bg-white/10 rounded-xl transition-all"
                            />
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg"
                            >
                                {error}
                            </motion.div>
                        )}

                        <Button type="submit" className="w-full h-12 bg-white text-black hover:bg-gray-200 rounded-xl font-bold text-base transition-transform hover:scale-[1.02]" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Create Account"}
                        </Button>
                    </form>

                    <div className="mt-8 text-center text-sm text-gray-500">
                        Already have an account?{" "}
                        <Link href="/login" className="text-white hover:text-indigo-400 font-medium transition-colors hover:underline underline-offset-4">
                            Log in
                        </Link>
                    </div>
                </div>

                <div className="mt-auto pt-10">
                    <p className="text-xs text-gray-600 text-center">
                        By clicking &quot;Create Account&quot;, you agree to our <Link href="/terms" className="hover:text-gray-400 underline">Terms</Link> and <Link href="/privacy" className="hover:text-gray-400 underline">Privacy Policy</Link>.
                    </p>
                </div>
            </div>

            {/* Right Side - Visuals */}
            <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-zinc-900 items-center justify-center p-20">
                {/* Aurora Background - Reused from Landing */}
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[5s]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] mix-blend-screen"></div>

                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>

                <SwipeableCards />
            </div>
        </div>

    )
}
