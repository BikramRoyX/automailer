"use client"

import Link from "next/link"
import { Logo } from "@/components/logo"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
    LayoutDashboard,
    Send,
    Settings,
    FileText,
    LogOut,
    Menu,
    X,
    Bell,
    User,
    BarChart3
} from "lucide-react"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { resetUserData } from "@/app/actions/auth-reset"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScreenLoader } from "@/components/ui/screen-loader"

const NAV_ITEMS = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { label: "Logs", href: "/dashboard/logs", icon: FileText },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function Navbar() {
    const pathname = usePathname()
    const { data: session } = useSession()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [notifications, setNotifications] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    // Fetch notifications
    const fetchNotifications = async () => {
        if (!session?.user) return
        try {
            setIsLoading(true)
            const res = await fetch("/api/notifications")
            if (res.ok) {
                const data = await res.json()
                setNotifications(data)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setIsLoading(false)
        }
    }

    // Initial Fetch
    useEffect(() => {
        fetchNotifications()
    }, [session])

    return (
        <>
            <ScreenLoader visible={isLoggingOut} message="Logging out safely..." />
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl"
            >
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">

                    {/* Logo */}
                    <Link href="/dashboard" className="flex items-center gap-2 group">
                        <Logo />
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {NAV_ITEMS.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all relative group",
                                        isActive ? "text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-pill"
                                            className="absolute inset-0 bg-white/10 rounded-lg"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <Icon className={cn("w-4 h-4", isActive ? "text-indigo-400" : "text-gray-500 group-hover:text-gray-300")} />
                                    <span className="relative z-10">{item.label}</span>
                                </Link>
                            )
                        })}
                    </div>

                    {/* Right Side Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        {/* Notification Dropdown */}
                        <DropdownMenu onOpenChange={(open) => {
                            if (open) fetchNotifications()
                        }}>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/5 rounded-full w-10 h-10 relative">
                                    <Bell className="w-5 h-5" />
                                    {notifications.length > 0 && !notifications.some((n: any) => n.isRead) && (
                                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-[#0a0a0a]" />
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-80 bg-[#0a0a0a] border border-white/10 text-zinc-400 p-0 overflow-hidden shadow-2xl">
                                <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold text-white">Notifications</h4>
                                        {notifications.length > 0 && (
                                            <span className="bg-indigo-500/10 text-indigo-400 text-[10px] px-2 py-0.5 rounded-full border border-indigo-500/20">
                                                {notifications.length} New
                                            </span>
                                        )}
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={fetchNotifications} disabled={isLoading}>
                                        <div className={cn("w-3 h-3 rounded-full border-2 border-zinc-600 border-t-zinc-400", isLoading && "animate-spin")} />
                                    </Button>
                                </div>

                                <div className="max-h-[300px] overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="min-h-[200px] flex flex-col items-center justify-center p-8 text-center space-y-4">
                                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                                                <Bell className="w-8 h-8 text-zinc-600 opacity-50" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-white font-medium">No notifications</p>
                                                <p className="text-xs text-zinc-500 max-w-[180px] mx-auto leading-relaxed">
                                                    We'll notify you when your campaign starts or when you get a reply.
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-white/5">
                                            {notifications.map((n, i) => (
                                                <div key={i} className={cn("p-4 hover:bg-white/5 transition-colors cursor-pointer", !n.isRead && "bg-white/[0.02]")}>
                                                    <div className="flex items-start gap-3">
                                                        <div className={cn(
                                                            "w-2 h-2 mt-2 rounded-full flex-shrink-0",
                                                            n.type === 'success' ? "bg-green-500" :
                                                                n.type === 'error' ? "bg-red-500" :
                                                                    n.type === 'warning' ? "bg-yellow-500" : "bg-indigo-500"
                                                        )} />
                                                        <div className="flex-1 space-y-1">
                                                            <p className="text-sm font-medium text-white leading-none">{n.title}</p>
                                                            <p className="text-xs text-zinc-400 leading-relaxed">{n.message}</p>
                                                            <p className="text-[10px] text-zinc-600">{new Date(n.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {notifications.length > 0 && (
                                    <div className="p-2 border-t border-white/5 bg-white/[0.02]">
                                        <Button variant="ghost" size="sm" className="w-full text-xs text-zinc-500 hover:text-white h-8">
                                            Mark all as read
                                        </Button>
                                    </div>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Profile Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="relative group outline-none" suppressHydrationWarning>
                                    <div className="absolute -inset-0.5 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full opacity-70 group-hover:opacity-100 transition duration-300 blur-[1px]" />
                                    <div className="relative w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden">
                                        {/* Avatar Image or Fallback */}
                                        <img
                                            src={session?.user?.image || `https://ui-avatars.com/api/?name=${session?.user?.name || "User"}&background=random`}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 bg-[#0a0a0a] border border-white/10 text-zinc-400">
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none text-white">{session?.user?.name || "AutoMailer User"}</p>
                                        <p className="text-xs leading-none text-muted-foreground">{session?.user?.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-white/10" />
                                <DropdownMenuItem className="focus:bg-white/5 focus:text-white cursor-pointer" asChild>
                                    <Link href="/dashboard/profile" className="flex items-center w-full">
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Profile</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="focus:bg-white/5 focus:text-white cursor-pointer" asChild>
                                    <Link href="/dashboard/settings" className="flex items-center w-full">
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Settings</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-white/10" />
                                <DropdownMenuItem
                                    className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer"
                                    onClick={async () => {
                                        setIsLoggingOut(true)
                                        // Fake delay to show animation (smooth transition)
                                        await new Promise(resolve => setTimeout(resolve, 2000))
                                        await resetUserData()
                                        await signOut() // Returns promise
                                    }}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Mobile Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden text-white"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </Button>
                </div>
            </motion.nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-b border-white/10 bg-[#0a0a0a]"
                    >
                        <div className="p-4 space-y-2">
                            {NAV_ITEMS.map((item) => {
                                const Icon = item.icon
                                const isActive = pathname === item.href
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors",
                                            isActive
                                                ? "bg-indigo-500/10 text-white border border-indigo-500/20"
                                                : "text-gray-400 hover:bg-white/5 hover:text-white"
                                        )}
                                    >
                                        <Icon className={cn("w-5 h-5", isActive ? "text-indigo-400" : "text-gray-500")} />
                                        {item.label}
                                    </Link>
                                )
                            })}
                            <div className="h-[1px] bg-white/10 my-2" />
                            <Button
                                variant="destructive"
                                className="w-full justify-start gap-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                                onClick={async () => {
                                    setIsLoggingOut(true)
                                    // Fake delay to show animation (smooth transition)
                                    await new Promise(resolve => setTimeout(resolve, 2000))
                                    await resetUserData()
                                    await signOut()
                                }}
                            >
                                <LogOut className="w-5 h-5" />
                                Sign Out
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
