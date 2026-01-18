import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
    return (
        <div className="space-y-8 animate-pulse">
            {/* Header Skeleton */}
            <div className="space-y-4">
                <Skeleton className="h-10 w-[200px] bg-white/10" />
                <Skeleton className="h-4 w-[300px] bg-white/5" />
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-3xl bg-white/5 border border-white/10" />
                ))}
            </div>

            {/* Main Content Areas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Skeleton className="h-[400px] w-full rounded-3xl bg-white/5" />
                <Skeleton className="h-[400px] w-full rounded-3xl bg-white/5" />
            </div>
        </div>
    )
}
