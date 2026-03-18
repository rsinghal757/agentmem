import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-[#F7F8F6] text-[#1C1C1C] antialiased selection:bg-[#0B6B3A]/20`}
      >
        <ClerkProvider>
          <main className="h-[100dvh] overflow-hidden">{children}</main>
        </ClerkProvider>
      </body>
    </html>
  );
}
