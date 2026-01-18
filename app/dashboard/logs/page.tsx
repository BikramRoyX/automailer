import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // Need Table component? I'll use simple div or table. 
// I haven't created Table components. I'll use raw HTML table with tailwind classes.

export default async function LogsPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");

    const logs = await db.log.findMany({
        where: { userId: session.user.id },
        orderBy: { timestamp: "desc" },
        take: 100,
        select: {
            id: true,
            userId: true,
            type: true,
            message: true,
            timestamp: true
        }
    });

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Activity Logs</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Events</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative w-full overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Message</TableHead>
                                    <TableHead className="text-right">Time</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-muted-foreground">No logs found</TableCell>
                                    </TableRow>
                                ) : (
                                    logs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell>
                                                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
                                    ${log.type === "email_sent" ? "border-transparent bg-green-500 text-white shadow hover:bg-green-600" :
                                                        log.type === "email_failed" ? "border-transparent bg-red-500 text-white shadow hover:bg-red-600" :
                                                            "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
                                                >
                                                    {log.type.replace("_", " ")}
                                                </span>
                                            </TableCell>
                                            <TableCell>{log.message}</TableCell>
                                            <TableCell className="text-right">{log.timestamp.toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
