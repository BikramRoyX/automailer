"use client"

import { AnalyticsView } from "@/components/dashboard/analytics-view"

export default function AnalyticsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight text-white">Analytics</h1>
            <AnalyticsView />
        </div>
    )
}
