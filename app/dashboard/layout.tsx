import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import * as fs from 'fs';
import * as path from 'path';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);
    if (!session) {
        try {
            fs.appendFileSync(path.join(process.cwd(), 'auth-debug.log'), `Layout Redirect: No Session found in dashboard/layout.tsx\n`);
        } catch (e) { }
        redirect("/login");
    }

    // Optional: Check setup status logic if needed
    // if (!session.user.isSetupComplete) {
    //     redirect("/onboarding");
    // }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-indigo-500/30 font-sans antialiased">
            <Navbar />
            <main className="container mx-auto p-4 md:p-8 max-w-7xl animate-in fade-in duration-500 slide-in-from-bottom-2">
                {children}
            </main>
        </div>
    );
}
