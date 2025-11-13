"use client"

import type { ReactNode } from "react"

import { SiteFooter } from "./site-footer"
import { SiteHeader } from "./site-header"

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <div className="container mx-auto max-w-6xl px-4 py-12 sm:py-14 md:py-16">
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
