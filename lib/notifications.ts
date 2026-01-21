import { db } from "@/lib/db"

export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export async function createNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType = 'info'
) {
    try {
        await db.notification.create({
            data: {
                userId,
                title,
                message,
                type
            }
        })
    } catch (error) {
        console.error("Failed to create notification:", error)
        // We don't throw here to avoid failing the main action just because notification failed
    }
}
