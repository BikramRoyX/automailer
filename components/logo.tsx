
import { Mail } from "lucide-react"

export function Logo({ className = "", iconClassName = "w-8 h-8", textClassName = "text-xl" }: { className?: string, iconClassName?: string, textClassName?: string }) {
    return (
        <div className={`flex items-center gap-2 font-bold group ${className}`}>
            <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20 ${iconClassName}`}>
                <Mail className="h-1/2 w-1/2" />
                <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className={`text-white tracking-tight ${textClassName}`}>AUTO<span className="text-indigo-400">MAILER</span></span>
        </div>
    )
}
