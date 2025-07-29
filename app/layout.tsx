import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Amatelini Japan Trip",
  description: "Amatelini Japan Trip",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Amatelini Japan Trip",
  },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};


const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" suppressHydrationWarning>
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Amatelini Japan Trip" />
      <link rel="apple-touch-icon" href="/192.png" />
      <link rel="apple-touch-startup-image" href="/512.png" />
      {/* OG IMAGE */}
      <meta property="og:title" content={metadata.title as string} />
      <meta property="og:description" content={metadata.description as string} />
      <meta property="og:image" content="/512.png" />
      <meta property="og:url" content="https://amatelini-japan-trip.vercel.app/" />
      <meta property="og:type" content="website" />
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
