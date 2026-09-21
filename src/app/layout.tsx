import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter, Source_Code_Pro, Source_Serif_4 } from "next/font/google";
import { ThemeScript } from "@/components/workspace/ThemeScript";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  display: "swap",
});

const sourceCode = Source_Code_Pro({
  variable: "--font-source-code",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GizzNote — A markdown desk for thinkers",
  description:
    "GizzNote is a markdown notebook where the note stays the centre of the screen and an agent works in the margin.",
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
    <html lang="en" className="h-full overflow-hidden" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body
        className={`${inter.variable} ${sourceSerif.variable} ${sourceCode.variable} h-full overflow-hidden bg-background text-foreground`}
      >
        <ClerkProvider>
          <div className="h-full w-full overflow-hidden">{children}</div>
        </ClerkProvider>
      </body>
    </html>
  );
}
