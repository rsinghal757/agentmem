import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "GizzNote — A studio for thinking in writing",
  description:
    "A calm writing studio where conversation becomes a markdown library you own.",
  icons: {
    icon: "/icon.svg",
  },
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
    <html lang="en" className="h-full overflow-hidden">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full overflow-hidden bg-background font-sans text-foreground antialiased selection:bg-primary/20`}
      >
        <ClerkProvider>
          <main className="h-full w-full overflow-hidden">{children}</main>
        </ClerkProvider>
      </body>
    </html>
  );
}
