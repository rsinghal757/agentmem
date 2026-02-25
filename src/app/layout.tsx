import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/layout/Header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Obsidian Memory Agent",
  description:
    "An AI assistant that builds and maintains its own Obsidian-compatible knowledge vault",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-neutral-950 text-neutral-100 antialiased selection:bg-violet-500/40`}
      >
        <div className="flex h-screen flex-col">
          <Header />
          <main className="flex-1 overflow-hidden px-3 pb-3 pt-2 sm:px-4 sm:pb-4">
            <div className="h-full rounded-2xl border border-white/10 bg-neutral-950/75 shadow-[0_24px_80px_-36px_rgba(124,58,237,0.55)] backdrop-blur">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
