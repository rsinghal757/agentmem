import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { BottomTabs } from "@/components/layout/BottomTabs";
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
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-white text-neutral-900 antialiased selection:bg-[#6B8F71]/20`}
      >
        <div className="flex h-[100dvh] flex-col">
          <main className="flex-1 overflow-hidden">
            {children}
          </main>
          <BottomTabs />
        </div>
      </body>
    </html>
  );
}
