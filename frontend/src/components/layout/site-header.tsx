"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMemo } from "react"

import { useLanguage } from "@/components/providers/language-provider"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useTranslations } from "@/hooks/use-translations"
import { Menu, X } from "lucide-react"

type NavItem = {
  href: string
  translationKey: string
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", translationKey: "menuinicio" },
  { href: "/explore", translationKey: "menuexplorar" },
  { href: "/map", translationKey: "menumapa" },
  { href: "/recordings", translationKey: "menugravacoes" },
  { href: "/heard", translationKey: "menulista" },
  { href: "/hearing", translationKey: "guiaparaouvir" },
]

export function SiteHeader() {
  const pathname = usePathname()
  const { openSelector } = useLanguage()
  const { t } = useTranslations("all", { mergeAll: false })

  const mobileNav = useMemo(
    () =>
      NAV_ITEMS.map((item) => ({
        ...item,
        label: t(item.translationKey),
      })),
    [t],
  )

  return (
    <header className="top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:py-5">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-lg font-semibold uppercase tracking-[0.2em]"
          >
            {t("titulomenu", "Percursos Sonoros")}
          </Link>
          <nav className="hidden items-center gap-6 text-sm uppercase text-muted-foreground lg:flex">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === item.href
                  : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative transition-colors hover:text-foreground",
                    isActive ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {t(item.translationKey)}
                  {isActive && (
                    <span className="absolute inset-x-0 -bottom-2 h-px bg-foreground" />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="hidden border-foreground/30 uppercase shadow-none hover:bg-foreground hover:text-background lg:inline-flex"
            onClick={openSelector}
          >
            {t("language", "Language")}
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="border-foreground/30 lg:hidden"
              >
                <Menu className="size-5" />
                <span className="sr-only">Open navigation</span>
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[280px] border-l border-border/30 bg-background/95 backdrop-blur">
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm font-semibold uppercase tracking-[0.3em]">
                  {t("titulomenu", "Percursos Sonoros")}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="border border-transparent hover:border-border/40"
                  onClick={openSelector}
                >
                  <span className="text-xs uppercase tracking-[0.3em]">
                    {t("language", "Language")}
                  </span>
                </Button>
              </div>
              <div className="flex flex-col gap-4 text-sm uppercase">
                {mobileNav.map((item) => {
                  const isActive =
                    item.href === "/"
                      ? pathname === item.href
                      : pathname.startsWith(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between border-b border-border/30 pb-2 transition-colors hover:text-foreground",
                        isActive ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {item.label}
                      {isActive ? (
                        <X className="size-4 rotate-45" />
                      ) : (
                        <span className="font-light tracking-widest">›</span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
