import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import { LanguageProvider } from "@/components/providers/language-provider"
import { ThemeProvider } from "@/components/providers/theme-provider"

import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Percursos Sonoros Guadiana",
  description:
    "Experimente os percursos sonoros de Mértola, explore mapas, trilhos e espécies com um design preto e branco alimentado por React e shadcn.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background text-foreground antialiased">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background text-foreground`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <LanguageProvider>{children}</LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
