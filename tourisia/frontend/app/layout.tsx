import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: 'Tourisia',
  description: 'Discover unique experiences and hidden gems across 130+ countries with verified global providers.',
  generator: 'v0.app',
  icons: {
    icon: '/images/Logo-Tourisia--Principal.png',
    apple: '/images/Logo-Tourisia--Principal.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#2563eb',
}

import { Toaster } from "@/components/ui/sonner"
import { GoogleOAuthProvider } from "@react-oauth/google"
import { AIAssistant } from "@/components/ai-assistant"
import { GoogleTranslateScript } from "@/components/google-translate-script"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {

  const googleClientId = "1064867979845-f1f4re147ugosa4c0i7vukshfq5doi4s.apps.googleusercontent.com";

  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange={false}>
          <GoogleOAuthProvider clientId={googleClientId}>
            {children}
            <Toaster richColors />
            <AIAssistant />
            <GoogleTranslateScript />
            <Analytics />
          </GoogleOAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
