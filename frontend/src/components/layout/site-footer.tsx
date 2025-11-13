"use client"

import { useTranslations } from "@/hooks/use-translations"

export function SiteFooter() {
  const { t } = useTranslations("all", { mergeAll: false })

  return (
    <footer className="mt-16 border-t border-border/40 bg-background">
      <div className="container mx-auto max-w-6xl px-4 py-8 text-sm text-muted-foreground md:py-10">
        <p className="text-center uppercase tracking-[0.2em]">
          {t(
            "footer",
            "© 2024 Percursos Sonoros Lince-ibérico. Todos os direitos reservados.",
          )}
        </p>
      </div>
    </footer>
  )
}
