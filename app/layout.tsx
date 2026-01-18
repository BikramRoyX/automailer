import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ClientProviders } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AutoMailer - AI Job Search Assistant",
  description: "Accelerate your job search with AI-powered personalized outreach. Send authentic emails to recruiters directly from your Gmail.",
  keywords: ["job search", "email automation", "career", "recruiting", "AI assistant"],
  icons: {
    icon: "/favicon.ico",
  },
};

import { Toaster } from "@/components/ui/sonner"

// ... imports remain same

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={cn(inter.className, "min-h-screen bg-background font-sans antialiased text-foreground")}>
        <ClientProviders>
          {children}
          <Toaster />
        </ClientProviders>
      </body>
    </html>
  );
}
