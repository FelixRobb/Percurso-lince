"use client"

import { useTranslations } from "@/hooks/use-translations"

export default function HearingGuidePage() {
  const { t } = useTranslations("hearing")

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-3 text-center">
        <h1 className="text-2xl font-semibold uppercase tracking-[0.4em] text-foreground">
          {t("comoEscutarTitulo")}
        </h1>
      </header>
      <section className="space-y-4 rounded-lg border border-border/40 bg-muted/10 p-6 leading-relaxed text-muted-foreground">
        <p>{t("comoEscutarTexto1")}</p>
        <p>{t("comoEscutarTexto2")}</p>
      </section>
      <section className="space-y-4 rounded-lg border border-border/40 bg-muted/10 p-6 leading-relaxed text-muted-foreground">
        <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-foreground">
          {t("comoUsarGuiaTitulo")}
        </h2>
        <p>{t("comoUsarGuiaTexto1")}</p>
        <p>{t("comoUsarGuiaTexto2")}</p>
      </section>
    </div>
  )
}
