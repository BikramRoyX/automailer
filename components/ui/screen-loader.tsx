"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Loader2 } from "lucide-react"
import { Logo } from "@/components/logo"

interface ScreenLoaderProps {
    visible: boolean
    message?: string
}

export function ScreenLoader({ visible, message = "Loading..." }: ScreenLoaderProps) {
    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md"
                >
                    <div className="flex flex-col items-center justify-center space-y-8 relative">
                        {/* Background Pulse */}
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.3, 0.1, 0.3],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                            className="absolute inset-0 bg-indigo-500/20 blur-[120px] rounded-full mix-blend-screen"
                        />
                        <motion.div
                            animate={{
                                scale: [1.2, 1, 1.2],
                                opacity: [0.1, 0.2, 0.1],
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 1
                            }}
                            className="absolute inset-0 bg-purple-500/20 blur-[100px] rounded-full mix-blend-screen"
                        />

                        {/* Main Container */}
                        <div className="relative z-10 flex flex-col items-center gap-6">
                            {/* Logo with Glow */}
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                transition={{ type: "spring", bounce: 0.5 }}
                                className="relative"
                            >
                                <div className="absolute inset-0 bg-indigo-500/50 blur-2xl rounded-full opacity-50" />
                                <div className="relative bg-[#0a0a0a] p-4 rounded-2xl border border-white/10 shadow-2xl">
                                    <Logo />
                                </div>
                            </motion.div>

                            {/* Spinner & Text */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="flex flex-col items-center space-y-3"
                            >
                                <div className="p-3 bg-white/5 rounded-xl backdrop-blur-md border border-white/5">
                                    <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                                </div>
                                <div className="text-center space-y-1">
                                    <h3 className="text-lg font-bold text-white tracking-wide">
                                        Please Wait
                                    </h3>
                                    <p className="text-xs text-zinc-400 font-medium tracking-widest uppercase animate-pulse">
                                        {message}
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
