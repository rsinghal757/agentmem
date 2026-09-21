/* Google Fonts links intentionally live in the shared App Router root layout. */
/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "GizzNote — Research Memory Workspace",
  description:
    "A calm AI workspace for research, writing, markdown notes, and connected memory.",
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
    <html lang="en" className="dark h-full overflow-hidden" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap" />
        <script dangerouslySetInnerHTML={{ __html: `try { document.documentElement.classList.toggle('dark', localStorage.getItem('gizznote-theme') !== 'light'); } catch {}` }} />
      </head>
      <body
        className="h-full overflow-hidden bg-background text-foreground antialiased selection:bg-primary/20"
      >
        <ClerkProvider>
          <main className="h-full w-full overflow-hidden">{children}</main>
        </ClerkProvider>
      </body>
    </html>
  );
}
