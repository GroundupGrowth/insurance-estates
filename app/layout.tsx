import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "@/stack";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "I&E — PM",
  description: "Internal project management and social media planning.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-app-bg font-sans text-[15px] text-app-ink antialiased">
        <StackProvider app={stackServerApp}>
          <StackTheme>
            {children}
            <Toaster />
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}
